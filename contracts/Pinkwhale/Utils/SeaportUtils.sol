// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {
    Order,
    OrderComponents,
    OfferItem,
    ConsiderationItem,
    OrderParameters,
    ReceivedItem
} from "seaport-types/src/lib/ConsiderationStructs.sol";

import {OrderType} from "seaport-types/src/lib/ConsiderationEnums.sol";

import {SeaportInterface} from "seaport-types/src/interfaces/SeaportInterface.sol";

import {LenderRepaymentTerms, ResolutionOrders} from "../PinkwhaleStructs.sol";
import {
    ZoneHashMismatch,
    UpstreamOrderNotValidated,
    UpstreamOrderAlreadyFulfilled
} from "../PinkwhaleErrors.sol";
import "./PinkwhaleUtils.sol";

contract SeaportUtils is PinkwhaleUtils {
    SeaportInterface public immutable seaport;

    constructor(address seaportAddress) {
        seaport = SeaportInterface(seaportAddress);
    }

    /**
     * @notice Create a new Seaport Order using the provided parameters.
     * @dev    This is helpful to avoid repetition of shared parameters (e.g. zone is always
     *         Pinkwhale, conduitKey is always 0x00, Order Type is always FULL_RESTRICTED, etc.)
     *
     * @param offerItems          (Seaport specific) An array of OfferItems
     *
     * @param considerationItems  (Seaport specific) An array of ConsiderationItems
     *
     * @param startTime           The moment when the Order starts being fulfillable
     *
     * @param endTime             The moment when the Order stops being fulfillable
     *
     * @param zoneHash            The zoneHash to pass in the order
     *
     * @param salt                The salt to pass in the order
     */
    function _createSeaportOrder(
        OfferItem[] memory offerItems,
        ConsiderationItem[] memory considerationItems,
        uint256 startTime,
        uint256 endTime,
        bytes32 zoneHash,
        uint256 salt
    ) internal view returns (Order memory) {
        Order memory order = Order({
            signature: "0x00",
            parameters: OrderParameters({
                offerer: address(this),
                zone: address(this),
                offer: offerItems,
                consideration: considerationItems,
                orderType: OrderType.FULL_RESTRICTED,
                startTime: startTime,
                endTime: endTime,
                zoneHash: zoneHash,
                salt: salt,
                conduitKey: 0x00,
                totalOriginalConsiderationItems: considerationItems.length
            })
        });

        return order;
    }

    /**
     * @notice Create the Repayment Order directed to the Borrower.
     *
     * @param receivedItems       (Seaport specific) The items that actually landed in
     *                            Pinkwhale's custody during the match.
     *
     * @param borrower            The address of the Borrower. Used to specify it as the
     *                            authorisedCaller in the zoneHash
     *
     * @param lenderTerms         The final Terms used for the Loan creation. Used to specify duration
     *                            and final amount to repay to Lender
     */
    function _createSeaportRepaymentOrder(
        ReceivedItem[] memory receivedItems,
        address borrower,
        LenderRepaymentTerms memory lenderTerms
    ) internal view returns (Order memory) {
        OfferItem[] memory offerItems = new OfferItem[](receivedItems.length);

        for (uint256 i = 0; i < receivedItems.length; i++) {
            offerItems[i] = OfferItem({
                itemType: receivedItems[i].itemType,
                token: receivedItems[i].token,
                identifierOrCriteria: receivedItems[i].identifier,
                startAmount: receivedItems[i].amount,
                endAmount: receivedItems[i].amount
            });
        }

        // [!region repayment-order]
        ConsiderationItem[] memory considerationItems = lenderTerms.consideration;

        bytes32 repayOrderZoneHash = _getZoneHash(
            bytes32(0), // No previous Order
            borrower
        );

        // after successful execution, we create two orders and store on Seaport
        // Order 1: Allow to repay the Loan
        Order memory repayLoanOrder = _createSeaportOrder(
            offerItems,
            considerationItems,
            block.timestamp,
            block.timestamp + lenderTerms.duration,
            repayOrderZoneHash,
            uint256(repayOrderZoneHash)
        );
        // [!endregion repayment-order]

        return repayLoanOrder;
    }

    /**
     * @notice Create the Default Order starting from a Repayment Order. This Order allows
     *         the Lender to claim the collateralised token for free as soon as the Repayment
     *         Order expires.
     * @dev    The default order never expires (`endTime = type(uint256).max`). That
     *         is deliberate for this artifact, and it means a lender can sit on an
     *         underwater claim indefinitely. The docs cover what a Dutch auction
     *         would change here.
     *
     * @param repaymentOrder      The Repayment Order from which derive a Default Order.
     */
    // [!region default-order]
    function _deriveDefaultOrderFromRepaymentOrder(Order memory repaymentOrder)
        internal
        view
        returns (Order memory)
    {
        bytes32 repaymentOrderHash = _getOrderHashFromOrder(repaymentOrder);
        address lender = repaymentOrder.parameters.consideration[0].recipient;

        bytes32 defaultOrderZoneHash = _getZoneHash(repaymentOrderHash, lender);

        // No Consideration Items means that Lender can fulfil this Order for free.
        ConsiderationItem[] memory considerationItems = new ConsiderationItem[](0);

        Order memory defaultOrder = _createSeaportOrder(
            repaymentOrder.parameters.offer,
            considerationItems,
            repaymentOrder.parameters.endTime + 1,
            type(uint256).max, // Order never expires
            defaultOrderZoneHash,
            uint256(repaymentOrderHash)
        );

        return defaultOrder;
    }
    // [!endregion default-order]

    /**
     * @notice Create and validate the two Resolution Orders after a Loan has been created.
     *
     * @param borrower            The address of the Borrower.
     *
     * @param receivedItems       The collateral now held by Pinkwhale.
     *
     * @param lenderTerms         The final Terms used for the Loan creation. Used to specify duration
     *                            and final amount to repay to Lender
     *
     * @return resolution         The repayment order's hash (the loan id), the default
     *                            order's hash, and when the repayment window closes.
     */
    // [!region create-resolution-orders]
    function _createResolutionOrders(
        address borrower,
        ReceivedItem[] memory receivedItems,
        LenderRepaymentTerms memory lenderTerms
    ) internal returns (ResolutionOrders memory resolution) {
        // Future 1: the borrower buys the collateral back, for what they agreed to
        // repay, at any point before the loan expires.
        Order memory repayLoanOrder = _createSeaportRepaymentOrder(receivedItems, borrower, lenderTerms);

        // Future 2: the lender takes the collateral for free, but only from the
        // second the repayment window shuts. Derived from the order above, so it
        // can name it and check later whether it was ever filled.
        Order memory defaultOrder = _deriveDefaultOrderFromRepaymentOrder(repayLoanOrder);

        // The repayment order's hash doubles as the loan id: it is what `LoanRepaid`
        // reports and what the default order commits to in its zoneHash.
        resolution = ResolutionOrders({
            repaymentOrderHash: _getOrderHashFromOrder(repayLoanOrder),
            defaultOrderHash: _getOrderHashFromOrder(defaultOrder),
            expiry: repayLoanOrder.parameters.endTime
        });

        Order[] memory newOrders = new Order[](2);
        newOrders[0] = repayLoanOrder;
        newOrders[1] = defaultOrder;

        // Marking them valid on chain is what lets a contract be an offerer. Neither
        // order carries a signature, and Pinkwhale has no key to sign one with.
        seaport.validate(newOrders);
    }
    // [!endregion create-resolution-orders]

    function _getOrderHashFromOrder(Order memory order) internal view returns (bytes32) {
        // Pinkwhale never calls `incrementCounter`, so in practice this is 0.
        // Reading it keeps the hash correct if that ever stops being true.
        uint256 pinkwhaleCounter = seaport.getCounter(address(this));

        bytes32 orderHash = seaport.getOrderHash(
            OrderComponents(
                order.parameters.offerer,
                order.parameters.zone,
                order.parameters.offer,
                order.parameters.consideration,
                order.parameters.orderType,
                order.parameters.startTime,
                order.parameters.endTime,
                order.parameters.zoneHash,
                order.parameters.salt,
                order.parameters.conduitKey,
                pinkwhaleCounter
            )
        );

        return orderHash;
    }

    /**
     * @notice The full gate for a resolution order. Runs in `authorizeOrder`, so
     *         before Seaport moves any tokens.
     * @dev    Two checks.
     *         First, if an upstreamOrderHash is present, that order must not already
     *         be filled. This matters because if Alice repays Bob's loan and then
     *         takes another one, Bob's old default claim is still a validated Seaport
     *         order, and Pinkwhale is now holding Alice's new collateral. Without this
     *         check Bob's claim would succeed against it.
     *         Second, `keccak256(upstreamOrderHash, fulfiller)` must reproduce the
     *         order's `zoneHash`, which is what binds a resolution order to one caller.
     *
     * @param zoneHash            The zoneHash of the order to validate
     *
     * @param upstreamOrderHash   The order hash of the order that should not have been fulfilled
     *
     * @param authorisedCaller    The only address authorised to fulfil this order on Seaport. Seaport
     *                            passes this to Pinkwhale as the `fulfiller`.
     */
    // [!region assert-order-execution]
    function _assertOrderExecution(bytes32 zoneHash, bytes32 upstreamOrderHash, address authorisedCaller)
        internal
        view
    {
        if (upstreamOrderHash != bytes32(0)) {
            // Check one: is the upstream order already filled?
            (bool isValidated,, uint256 totalFilled,) = seaport.getOrderStatus(upstreamOrderHash);

            if (!isValidated) revert UpstreamOrderNotValidated();
            if (totalFilled != 0) revert UpstreamOrderAlreadyFulfilled();
        }

        // Check two: do the zoneHashes match?
        _assertZoneHash(zoneHash, upstreamOrderHash, authorisedCaller);
    }
    // [!endregion assert-order-execution]

    /// @notice Check two on its own: the caller is the one this order was minted for.
    function _assertZoneHash(bytes32 zoneHash, bytes32 upstreamOrderHash, address authorisedCaller)
        internal
        pure
    {
        if (_getZoneHash(upstreamOrderHash, authorisedCaller) != zoneHash) revert ZoneHashMismatch();
    }
}
