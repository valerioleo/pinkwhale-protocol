// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, Vm} from "forge-std/Test.sol";

import {
    AdvancedOrder,
    ConsiderationItem,
    CriteriaResolver,
    Fulfillment,
    FulfillmentComponent,
    OfferItem,
    OrderComponents,
    OrderParameters
} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ItemType, OrderType, Side} from "seaport-types/src/lib/ConsiderationEnums.sol";

import {Seaport16} from "../../contracts/Seaport/Seaport16.sol";
import {ConduitController16} from "../../contracts/Seaport/conduit/ConduitController16.sol";
import {Pinkwhale} from "../../contracts/Pinkwhale/Pinkwhale.sol";
import {LenderRepaymentTerms, BorrowerRepaymentTerms} from "../../contracts/Pinkwhale/PinkwhaleStructs.sol";
import {ERC20Token} from "../../contracts/Tokens/ERC20Token.sol";
import {ERC721Token} from "../../contracts/Tokens/ERC721Token.sol";
import {ERC1155Token} from "../../contracts/Tokens/ERC1155Token.sol";

/**
 * @notice Everything the Pinkwhale tests need to stand up a loan.
 * @dev    Nothing is forked. Seaport 1.6, Pinkwhale and the mock tokens are all
 *         deployed fresh in `setUp`, so a test run is fully self-contained.
 */
abstract contract PinkwhaleTestBase is Test {
    // Seaport's own OrderValidated event, redeclared so we can match on its topic.
    event OrderValidated(bytes32 orderHash, OrderParameters orderParameters);

    struct Actor {
        address addr;
        uint256 key;
    }

    /// @notice A fully specified loan, before it touches Seaport.
    struct LoanParams {
        // the collateral: borrower's offer, lender's consideration
        OfferItem[] collateralOffer;
        ConsiderationItem[] collateralConsideration;
        // the principal: lender's offer, borrower's consideration
        OfferItem[] principalOffer;
        ConsiderationItem[] principalConsideration;
        // the agreed repayment, expressed from both sides
        ConsiderationItem[] lenderRepayment;
        OfferItem[] borrowerRepayment;
        uint256 lenderDuration;
        uint256 borrowerDuration;
        CriteriaResolver[] criteriaResolvers;
        uint256 salt;
    }

    /// @notice What `_executeLoan` hands back: the two resolution orders Pinkwhale minted.
    struct Loan {
        bytes32 loanId;
        OrderParameters repaymentOrder;
        bytes32 defaultOrderHash;
        OrderParameters defaultOrder;
        OrderParameters lenderOrder;
        OrderParameters borrowerOrder;
    }

    uint256 internal constant PRINCIPAL = 100e18;
    uint256 internal constant REPAYMENT = 110e18;
    uint256 internal constant DURATION = 30 days;

    /// @dev What the mock ape collection pretends to be, matching BAYC.
    uint256 internal constant COLLECTION_SIZE = 10_000;

    ConduitController16 internal conduitController;
    Seaport16 internal seaport;
    Pinkwhale internal pinkwhale;

    ERC20Token internal currency;
    ERC721Token internal collection;
    ERC1155Token internal editions;

    Actor internal lender;
    Actor internal borrower;
    Actor internal executor;
    Actor internal attacker;

    bytes32 internal domainSeparator;

    uint256 private saltNonce;

    function setUp() public virtual {
        // Order start times are `block.timestamp`-relative and the default order
        // begins at `repaymentEnd + 1`; starting from block 1 makes the arithmetic
        // legible and keeps every order comfortably in the future.
        vm.warp(1_700_000_000);

        conduitController = new ConduitController16();
        seaport = new Seaport16(address(conduitController));
        pinkwhale = new Pinkwhale(address(seaport));

        (, domainSeparator,) = seaport.information();

        currency = new ERC20Token("Mock USD", "mUSD", 18, 0, address(this));
        collection = new ERC721Token("Mock Apes", "MAPE", "ipfs://", COLLECTION_SIZE);
        editions = new ERC1155Token("ipfs://");

        lender = _actor("lender");
        borrower = _actor("borrower");
        executor = _actor("executor");
        attacker = _actor("attacker");
    }

    // -------------------------------------------------------------------------
    // Actors and balances
    // -------------------------------------------------------------------------

    function _actor(string memory name) internal returns (Actor memory actor) {
        (address addr, uint256 key) = makeAddrAndKey(name);
        actor = Actor({addr: addr, key: key});
        vm.deal(addr, 10 ether);
    }

    /// @dev Everyone approves Seaport directly; Pinkwhale always uses conduitKey 0.
    function _fundLender(uint256 amount) internal {
        currency.mint(lender.addr, amount);
        vm.prank(lender.addr);
        currency.approve(address(seaport), type(uint256).max);
    }

    function _fundBorrowerForRepayment(uint256 amount) internal {
        currency.mint(borrower.addr, amount);
        vm.prank(borrower.addr);
        currency.approve(address(seaport), type(uint256).max);
    }

    function _giveBorrowerERC721(uint256 tokenId) internal {
        collection.mint(borrower.addr, tokenId);
        vm.prank(borrower.addr);
        collection.setApprovalForAll(address(seaport), true);
    }

    function _giveBorrowerERC1155(uint256 tokenId, uint256 amount) internal {
        editions.mint(borrower.addr, tokenId, amount);
        vm.prank(borrower.addr);
        editions.setApprovalForAll(address(seaport), true);
    }

    // -------------------------------------------------------------------------
    // Item builders
    // -------------------------------------------------------------------------

    function _offerItem(ItemType itemType, address token, uint256 identifier, uint256 amount)
        internal
        pure
        returns (OfferItem memory)
    {
        return OfferItem({
            itemType: itemType,
            token: token,
            identifierOrCriteria: identifier,
            startAmount: amount,
            endAmount: amount
        });
    }

    function _considerationItem(
        ItemType itemType,
        address token,
        uint256 identifier,
        uint256 amount,
        address recipient
    ) internal pure returns (ConsiderationItem memory) {
        return ConsiderationItem({
            itemType: itemType,
            token: token,
            identifierOrCriteria: identifier,
            startAmount: amount,
            endAmount: amount,
            recipient: payable(recipient)
        });
    }

    function _one(OfferItem memory item) internal pure returns (OfferItem[] memory arr) {
        arr = new OfferItem[](1);
        arr[0] = item;
    }

    function _one(ConsiderationItem memory item) internal pure returns (ConsiderationItem[] memory arr) {
        arr = new ConsiderationItem[](1);
        arr[0] = item;
    }

    // -------------------------------------------------------------------------
    // Loan construction
    // -------------------------------------------------------------------------

    /**
     * @notice The canonical loan: one collateral item in, `PRINCIPAL` currency out,
     *         `REPAYMENT` currency owed back inside `DURATION`.
     */
    function _standardLoan(
        ItemType collateralType,
        address collateralToken,
        uint256 identifier,
        uint256 amount
    ) internal returns (LoanParams memory params) {
        params.collateralOffer = _one(_offerItem(collateralType, collateralToken, identifier, amount));
        params.collateralConsideration =
            _one(_considerationItem(collateralType, collateralToken, identifier, amount, address(pinkwhale)));

        params.principalOffer = _one(_offerItem(ItemType.ERC20, address(currency), 0, PRINCIPAL));
        params.principalConsideration =
            _one(_considerationItem(ItemType.ERC20, address(currency), 0, PRINCIPAL, borrower.addr));

        params.lenderRepayment =
            _one(_considerationItem(ItemType.ERC20, address(currency), 0, REPAYMENT, lender.addr));
        params.borrowerRepayment = _one(_offerItem(ItemType.ERC20, address(currency), 0, REPAYMENT));

        params.lenderDuration = DURATION;
        params.borrowerDuration = DURATION;
        params.salt = ++saltNonce;
    }

    function _lenderTerms(LoanParams memory params) internal pure returns (LenderRepaymentTerms memory) {
        return LenderRepaymentTerms({consideration: params.lenderRepayment, duration: params.lenderDuration});
    }

    function _borrowerTerms(LoanParams memory params) internal pure returns (BorrowerRepaymentTerms memory) {
        return BorrowerRepaymentTerms({offer: params.borrowerRepayment, duration: params.borrowerDuration});
    }

    /// @dev Mirrors `PinkwhaleUtils._getLenderTermsHash`.
    function _lenderTermsHash(LoanParams memory params) internal pure returns (bytes32) {
        return keccak256(abi.encode(params.lenderRepayment, params.lenderDuration));
    }

    /// @dev Mirrors `PinkwhaleUtils._getBorrowerTermsHash`.
    function _borrowerTermsHash(LoanParams memory params) internal pure returns (bytes32) {
        return keccak256(abi.encode(params.borrowerRepayment, params.borrowerDuration));
    }

    /// @dev Mirrors `PinkwhaleUtils._getZoneHash`.
    function _zoneHash(bytes32 upstreamOrderHash, address authorisedCaller) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(upstreamOrderHash, authorisedCaller));
    }

    function _creationOrderParams(
        address offerer,
        OfferItem[] memory offer,
        ConsiderationItem[] memory consideration,
        bytes32 zoneHash,
        uint256 salt
    ) internal view returns (OrderParameters memory) {
        return OrderParameters({
            offerer: offerer,
            zone: address(pinkwhale),
            offer: offer,
            consideration: consideration,
            orderType: OrderType.FULL_RESTRICTED,
            startTime: block.timestamp,
            endTime: block.timestamp + 10 minutes,
            zoneHash: zoneHash,
            salt: salt,
            conduitKey: bytes32(0),
            totalOriginalConsiderationItems: consideration.length
        });
    }

    function _lenderOrder(LoanParams memory params) internal view returns (OrderParameters memory) {
        return _creationOrderParams(
            lender.addr,
            params.principalOffer,
            params.collateralConsideration,
            _lenderTermsHash(params),
            params.salt
        );
    }

    function _borrowerOrder(LoanParams memory params) internal view returns (OrderParameters memory) {
        return _creationOrderParams(
            borrower.addr,
            params.collateralOffer,
            params.principalConsideration,
            _borrowerTermsHash(params),
            params.salt + 1_000_000
        );
    }

    /**
     * @dev Index-aligned cross-matching: each side's offer item i pays the other
     *      side's consideration item i.
     */
    function _fulfillments(OrderParameters memory lenderOrder, OrderParameters memory borrowerOrder)
        internal
        pure
        returns (Fulfillment[] memory fulfillments)
    {
        uint256 total = lenderOrder.offer.length + borrowerOrder.offer.length;
        fulfillments = new Fulfillment[](total);

        for (uint256 i = 0; i < lenderOrder.offer.length; i++) {
            fulfillments[i] = _fulfillment(0, i, 1, i);
        }
        for (uint256 i = 0; i < borrowerOrder.offer.length; i++) {
            fulfillments[lenderOrder.offer.length + i] = _fulfillment(1, i, 0, i);
        }
    }

    function _fulfillment(
        uint256 offerOrderIndex,
        uint256 offerItemIndex,
        uint256 considerationOrderIndex,
        uint256 considerationItemIndex
    ) internal pure returns (Fulfillment memory fulfillment) {
        fulfillment.offerComponents = new FulfillmentComponent[](1);
        fulfillment.offerComponents[0] =
            FulfillmentComponent({orderIndex: offerOrderIndex, itemIndex: offerItemIndex});

        fulfillment.considerationComponents = new FulfillmentComponent[](1);
        fulfillment.considerationComponents[0] =
            FulfillmentComponent({orderIndex: considerationOrderIndex, itemIndex: considerationItemIndex});
    }

    // -------------------------------------------------------------------------
    // Signing
    // -------------------------------------------------------------------------

    function _orderHash(OrderParameters memory params) internal view returns (bytes32) {
        return seaport.getOrderHash(
            OrderComponents({
                offerer: params.offerer,
                zone: params.zone,
                offer: params.offer,
                consideration: params.consideration,
                orderType: params.orderType,
                startTime: params.startTime,
                endTime: params.endTime,
                zoneHash: params.zoneHash,
                salt: params.salt,
                conduitKey: params.conduitKey,
                counter: seaport.getCounter(params.offerer)
            })
        );
    }

    function _sign(Actor memory signer, OrderParameters memory params) internal view returns (bytes memory) {
        bytes32 digest = keccak256(abi.encodePacked(bytes2(0x1901), domainSeparator, _orderHash(params)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer.key, digest);
        return abi.encodePacked(r, s, v);
    }

    function _advanced(OrderParameters memory params, bytes memory signature, bytes memory extraData)
        internal
        pure
        returns (AdvancedOrder memory)
    {
        return AdvancedOrder({
            parameters: params, numerator: 1, denominator: 1, signature: signature, extraData: extraData
        });
    }

    // -------------------------------------------------------------------------
    // Execution
    // -------------------------------------------------------------------------

    function _signedCreationOrders(LoanParams memory params)
        internal
        view
        returns (AdvancedOrder memory lenderAdvanced, AdvancedOrder memory borrowerAdvanced)
    {
        OrderParameters memory lenderParams = _lenderOrder(params);
        OrderParameters memory borrowerParams = _borrowerOrder(params);

        // Creation orders carry empty extraData on purpose. See PinkwhaleZone.
        lenderAdvanced = _advanced(lenderParams, _sign(lender, lenderParams), "");
        borrowerAdvanced = _advanced(borrowerParams, _sign(borrower, borrowerParams), "");
    }

    /// @notice Run `executeLoan` and pull the two resolution orders out of the logs.
    function _executeLoan(LoanParams memory params) internal returns (Loan memory loan) {
        (AdvancedOrder memory lenderAdvanced, AdvancedOrder memory borrowerAdvanced) =
            _signedCreationOrders(params);

        loan.lenderOrder = lenderAdvanced.parameters;
        loan.borrowerOrder = borrowerAdvanced.parameters;

        vm.recordLogs();

        vm.prank(executor.addr);
        pinkwhale.executeLoan(
            lenderAdvanced,
            borrowerAdvanced,
            _lenderTerms(params),
            _borrowerTerms(params),
            params.criteriaResolvers,
            _fulfillments(lenderAdvanced.parameters, borrowerAdvanced.parameters)
        );

        (loan.loanId, loan.repaymentOrder, loan.defaultOrderHash, loan.defaultOrder) =
            _readResolutionOrders(vm.getRecordedLogs());
    }

    function _expectExecuteLoanRevert(LoanParams memory params, bytes4 selector) internal {
        _expectExecuteLoanRevert(params, abi.encodePacked(selector));
    }

    /**
     * @dev Signing calls into Seaport, so the orders have to be built *before*
     *      `vm.expectRevert` is armed, because the cheatcode latches onto the next
     *      call it sees, whichever one that is.
     */
    function _expectExecuteLoanRevert(LoanParams memory params, bytes memory revertData) internal {
        (AdvancedOrder memory lenderAdvanced, AdvancedOrder memory borrowerAdvanced) =
            _signedCreationOrders(params);

        vm.prank(executor.addr);
        vm.expectRevert(revertData);
        pinkwhale.executeLoan(
            lenderAdvanced,
            borrowerAdvanced,
            _lenderTerms(params),
            _borrowerTerms(params),
            params.criteriaResolvers,
            _fulfillments(lenderAdvanced.parameters, borrowerAdvanced.parameters)
        );
    }

    /**
     * @dev Pinkwhale calls `seaport.validate` with [repayment, default], so the two
     *      `OrderValidated` events arrive in that order. Reading the orders back out
     *      of the logs rather than recomputing them means the tests assert against
     *      what Seaport actually stored.
     */
    function _readResolutionOrders(Vm.Log[] memory logs)
        internal
        view
        returns (
            bytes32 repaymentOrderHash,
            OrderParameters memory repaymentOrder,
            bytes32 defaultOrderHash,
            OrderParameters memory defaultOrder
        )
    {
        bytes32 topic = OrderValidated.selector;
        uint256 seen;

        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].emitter != address(seaport) || logs[i].topics[0] != topic) continue;

            (bytes32 orderHash, OrderParameters memory params) =
                abi.decode(logs[i].data, (bytes32, OrderParameters));

            if (seen == 0) {
                (repaymentOrderHash, repaymentOrder) = (orderHash, params);
            } else if (seen == 1) {
                (defaultOrderHash, defaultOrder) = (orderHash, params);
            }
            seen++;
        }

        require(seen == 2, "expected exactly two resolution orders");
    }

    /// @notice Borrower redeems the collateral by paying the repayment order.
    function _repay(Loan memory loan) internal {
        vm.prank(borrower.addr);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.repaymentOrder, "", abi.encode(bytes32(0))),
            new CriteriaResolver[](0),
            bytes32(0),
            borrower.addr
        );
    }

    /// @notice Lender takes the collateral once the repayment window has closed.
    function _claimDefault(Loan memory loan) internal {
        vm.prank(lender.addr);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.defaultOrder, "", abi.encode(loan.loanId)),
            new CriteriaResolver[](0),
            bytes32(0),
            lender.addr
        );
    }

    // -------------------------------------------------------------------------
    // Criteria helpers. Seaport verifies sorted-pair merkle proofs over
    // keccak256(abi.encode(identifier)) leaves.
    // -------------------------------------------------------------------------

    function _leaf(uint256 identifier) internal pure returns (bytes32) {
        return keccak256(abi.encode(identifier));
    }

    function _pairRoot(uint256 idA, uint256 idB) internal pure returns (bytes32) {
        bytes32 a = _leaf(idA);
        bytes32 b = _leaf(idB);
        return a < b ? keccak256(abi.encodePacked(a, b)) : keccak256(abi.encodePacked(b, a));
    }

    function _pairProof(uint256 sibling) internal pure returns (bytes32[] memory proof) {
        proof = new bytes32[](1);
        proof[0] = _leaf(sibling);
    }

    function _criteriaResolver(
        uint256 orderIndex,
        Side side,
        uint256 index,
        uint256 identifier,
        bytes32[] memory proof
    ) internal pure returns (CriteriaResolver memory) {
        return CriteriaResolver({
            orderIndex: orderIndex, side: side, index: index, identifier: identifier, criteriaProof: proof
        });
    }
}
