// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {
    AdvancedOrder,
    CriteriaResolver,
    Fulfillment,
    Execution,
    OfferItem,
    ConsiderationItem,
    ReceivedItem
} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ItemType} from "seaport-types/src/lib/ConsiderationEnums.sol";
import {ZoneInterface} from "seaport-types/src/interfaces/ZoneInterface.sol";
import {ERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {LenderRepaymentTerms, BorrowerRepaymentTerms, ResolutionOrders} from "./PinkwhaleStructs.sol";
import {
    RecipientMustBePinkwhale,
    LenderTermsMismatch,
    BorrowerTermsMismatch,
    DurationExceedsLenderMaximum,
    TermsLengthMismatch,
    TermsItemMismatch,
    NoCollateralReceived
} from "./PinkwhaleErrors.sol";
import "./Utils/TokenUtils.sol";
import "./Utils/PinkwhaleUtils.sol";
import "./Utils/SeaportUtils.sol";
import "./PinkwhaleZone.sol";

/**
 * @title  Pinkwhale
 * @notice Peer-to-peer NFT lending built entirely out of Seaport orders.
 *
 * @dev Collateral is held in this one contract and approved to Seaport. That is
 *      pooled custody rather than per-loan vaults, so every open loan's collateral
 *      sits in the same place. It is also why the zone's replay guard
 *      (`UpstreamOrderAlreadyFulfilled`) matters: it stops a settled claim from
 *      reaching for someone else's collateral.
 *
 *      Shared as a research artifact, as-is, with no safety guarantees. Not audited.
 */
contract Pinkwhale is PinkwhaleZone, TokenUtils, ReentrancyGuard {
    /**
     * @notice A loan was opened.
     *
     * @param loanId       The repayment order's hash, and the handle for everything
     *                     downstream. `LoanRepaid` fires with it, and the default
     *                     order commits to it in its `zoneHash`.
     * @param lender       Who funded the loan.
     * @param borrower     Who posted the collateral.
     * @param executor     Who submitted `executeLoan`, often a third party.
     * @param collateral   What actually landed in Pinkwhale's custody.
     * @param principal    What the lender handed over.
     * @param repayment    What the borrower must pay to redeem the collateral.
     * @param expiry       When the repayment window closes.
     * @param defaultOrderHash The order the lender can fulfil once `expiry` passes.
     */
    event LoanExecuted(
        bytes32 indexed loanId,
        address indexed lender,
        address indexed borrower,
        address executor,
        ReceivedItem[] collateral,
        OfferItem[] principal,
        ConsiderationItem[] repayment,
        uint256 expiry,
        bytes32 defaultOrderHash
    );

    constructor(address seaportAddress) SeaportUtils(seaportAddress) {}

    /**
     * @notice Create a new Loan by providing two valid Seaport Orders and terms
     * @dev    Although there is no distinction between Orders in Seaport, we need
     *         to make a distinction to identify the Lender and Borrower, verify that
     *         the recipient of the NFTs is set as Pinkwhale and that the respective
     *         terms are indeed matching with the hash provided in zoneHash.
     *
     * @param lenderOrder         (Seaport specific) The Order with the NFT to be collateralised set as
     *                            consideration item and Pinkwhale set as the consideration
     *                            recipient.
     * @param borrowerOrder       (Seaport specific) The Order with the NFT to be collateralised set as
     *                            offer item.
     * @param lenderTerms         The Terms used to generate the zoneHash of the lenderOrder.
     *                            This is necessary to validate that the Terms are respected.
     * @param borrowerTerms       The Terms used to generate the zoneHash of the borrowerOrder.
     *                            This is necessary to validate that the Terms are respected.
     * @param criteriaResolvers   (Seaport specific) An array where each element contains a
     *                            reference to a specific order as well as that
     *                            order's offer or consideration, a token
     *                            identifier, and a proof that the supplied
     *                            token identifier is contained in the
     *                            order's merkle root.
     * @param fulfillments        (Seaport specific) An array of elements allocating offer
     *                            components to consideration components.
     */
    // [!region execute-loan]
    function executeLoan(
        AdvancedOrder calldata lenderOrder,
        AdvancedOrder calldata borrowerOrder,
        LenderRepaymentTerms calldata lenderTerms,
        BorrowerRepaymentTerms calldata borrowerTerms,
        CriteriaResolver[] calldata criteriaResolvers,
        Fulfillment[] calldata fulfillments
    ) external nonReentrant {
        _assertTermsAgree(lenderOrder, borrowerOrder, lenderTerms, borrowerTerms);

        // Execute Orders on Seaport. Because the caller here *is* the zone, Seaport
        // skips the zone hooks for these two orders entirely.
        ReceivedItem[] memory collateralItems = _collectCollateral(
            seaport.matchAdvancedOrders(
                _ordersToMatch(lenderOrder, borrowerOrder), criteriaResolvers, fulfillments, msg.sender
            )
        );

        // We create the Resolution Orders (Repayment Order & Default Order)
        ResolutionOrders memory resolution =
            _createResolutionOrders(borrowerOrder.parameters.offerer, collateralItems, lenderTerms);

        emit LoanExecuted(
            resolution.repaymentOrderHash,
            lenderOrder.parameters.offerer,
            borrowerOrder.parameters.offerer,
            msg.sender,
            collateralItems,
            lenderOrder.parameters.offer,
            lenderTerms.consideration,
            resolution.expiry,
            resolution.defaultOrderHash
        );
    }
    // [!endregion execute-loan]

    function _ordersToMatch(AdvancedOrder calldata lenderOrder, AdvancedOrder calldata borrowerOrder)
        private
        pure
        returns (AdvancedOrder[] memory ordersToMatch)
    {
        ordersToMatch = new AdvancedOrder[](2);
        ordersToMatch[0] = lenderOrder;
        ordersToMatch[1] = borrowerOrder;
    }

    /**
     * @dev Everything that must hold about the two creation orders before they are
     *      allowed anywhere near Seaport.
     */
    // [!region assert-terms]
    function _assertTermsAgree(
        AdvancedOrder calldata lenderOrder,
        AdvancedOrder calldata borrowerOrder,
        LenderRepaymentTerms calldata lenderTerms,
        BorrowerRepaymentTerms calldata borrowerTerms
    ) private view {
        // Every item the lender directs anywhere must land in Pinkwhale's custody.
        // Otherwise the "collateral" never arrives.
        for (uint256 i; i < lenderOrder.parameters.consideration.length; i++) {
            if (lenderOrder.parameters.consideration[i].recipient != address(this)) {
                revert RecipientMustBePinkwhale();
            }
        }

        // The terms are only a hint until they reproduce each order's zoneHash.
        if (_getLenderTermsHash(lenderTerms) != lenderOrder.parameters.zoneHash) {
            revert LenderTermsMismatch();
        }
        if (_getBorrowerTermsHash(borrowerTerms) != borrowerOrder.parameters.zoneHash) {
            revert BorrowerTermsMismatch();
        }

        if (borrowerTerms.duration > lenderTerms.duration) revert DurationExceedsLenderMaximum();

        if (lenderTerms.consideration.length != borrowerTerms.offer.length) revert TermsLengthMismatch();

        // Both sides must describe the same repayment, item for item.
        for (uint256 i; i < lenderTerms.consideration.length; i++) {
            ConsiderationItem calldata lenderItem = lenderTerms.consideration[i];
            OfferItem calldata borrowerItem = borrowerTerms.offer[i];

            if (
                lenderItem.token != borrowerItem.token
                    || lenderItem.identifierOrCriteria != borrowerItem.identifierOrCriteria
                    || lenderItem.itemType != borrowerItem.itemType
                    || lenderItem.startAmount != borrowerItem.startAmount
                    || lenderItem.endAmount != borrowerItem.endAmount
            ) {
                revert TermsItemMismatch(i);
            }
        }
    }
    // [!endregion assert-terms]

    /**
     * @dev Pick out the executions that paid Pinkwhale and make sure Seaport can
     *      move them back out again when the loan resolves.
     */
    // [!region collect-collateral]
    function _collectCollateral(Execution[] memory executions)
        private
        returns (ReceivedItem[] memory collateralItems)
    {
        collateralItems = new ReceivedItem[](executions.length);

        uint256 receivedItemsCount;
        for (uint256 i = 0; i < executions.length; i++) {
            if (executions[i].item.recipient == address(this)) {
                collateralItems[receivedItemsCount++] = executions[i].item;

                // Make sure that Seaport can transferFrom the collateral later
                bool isNft = executions[i].item.itemType > ItemType.ERC20;
                _approveToken(isNft, executions[i].item.token, address(seaport));
            }
        }

        if (receivedItemsCount == 0) revert NoCollateralReceived();

        // Shrink to what was actually filled. Handing on the allocated length would
        // put phantom zero-amount offer items into the resolution orders.
        assembly ("memory-safe") {
            mstore(collateralItems, receivedItemsCount)
        }
    }
    // [!endregion collect-collateral]

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Receiver, ZoneInterface)
        returns (bool)
    {
        return interfaceId == type(ZoneInterface).interfaceId || super.supportsInterface(interfaceId);
    }
}
