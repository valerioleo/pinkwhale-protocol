// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {PinkwhaleTestBase} from "./utils/PinkwhaleTestBase.sol";

import {
    AdvancedOrder,
    CriteriaResolver,
    ConsiderationItem,
    OfferItem,
    OrderParameters,
    ReceivedItem,
    SpentItem,
    ZoneParameters
} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ItemType} from "seaport-types/src/lib/ConsiderationEnums.sol";
import {ZoneInteractionErrors} from "seaport-types/src/interfaces/ZoneInteractionErrors.sol";
import {ConsiderationEventsAndErrors} from "seaport-types/src/interfaces/ConsiderationEventsAndErrors.sol";

import {
    OnlySeaport,
    ZoneHashMismatch,
    UpstreamOrderAlreadyFulfilled,
    UpstreamOrderNotValidated,
    RecipientMustBePinkwhale,
    LenderTermsMismatch,
    BorrowerTermsMismatch,
    DurationExceedsLenderMaximum,
    TermsLengthMismatch,
    TermsItemMismatch
} from "../contracts/Pinkwhale/PinkwhaleErrors.sol";

/**
 * @notice Every property the protocol claims, stated as an attack that fails.
 * @dev    This is the suite the docs' "Attack Playground" is built from.
 */
contract GuardsTest is PinkwhaleTestBase {
    uint256 internal constant TOKEN_ID = 42;

    function _openLoan() internal returns (Loan memory loan) {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);
        loan = _executeLoan(_standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1));
    }

    // -------------------------------------------------------------------------
    // The zone hooks are Seaport's alone
    // -------------------------------------------------------------------------

    function _emptyZoneParameters() internal pure returns (ZoneParameters memory zp) {
        zp.extraData = abi.encode(bytes32(0));
        zp.offer = new SpentItem[](0);
        zp.consideration = new ReceivedItem[](0);
        zp.orderHashes = new bytes32[](0);
    }

    /// @dev Without this gate anyone could call `validateOrder` and emit `LoanRepaid` at will.
    function test_authorizeOrder_revertsForNonSeaportCaller() public {
        vm.prank(attacker.addr);
        vm.expectRevert(OnlySeaport.selector);
        pinkwhale.authorizeOrder(_emptyZoneParameters());
    }

    function test_validateOrder_revertsForNonSeaportCaller() public {
        vm.prank(attacker.addr);
        vm.expectRevert(OnlySeaport.selector);
        pinkwhale.validateOrder(_emptyZoneParameters());
    }

    // -------------------------------------------------------------------------
    // You must go through executeLoan
    // -------------------------------------------------------------------------

    /**
     * @dev The creation orders are restricted to the Pinkwhale zone and carry empty
     *      `extraData`. Matching them without going through `executeLoan` means the
     *      caller is not the zone, so `authorizeOrder` fires, the `abi.decode` of an
     *      empty `extraData` reverts, and Seaport turns that into
     *      `InvalidRestrictedOrder`. That revert *is* the guard.
     */
    function test_matchingCreationOrdersDirectly_reverts() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        (AdvancedOrder memory lenderAdvanced, AdvancedOrder memory borrowerAdvanced) =
            _signedCreationOrders(params);

        AdvancedOrder[] memory orders = new AdvancedOrder[](2);
        orders[0] = lenderAdvanced;
        orders[1] = borrowerAdvanced;

        vm.prank(attacker.addr);
        vm.expectPartialRevert(ZoneInteractionErrors.InvalidRestrictedOrder.selector);
        seaport.matchAdvancedOrders(
            orders,
            params.criteriaResolvers,
            _fulfillments(lenderAdvanced.parameters, borrowerAdvanced.parameters),
            attacker.addr
        );

        assertEq(collection.ownerOf(TOKEN_ID), borrower.addr, "collateral never moved");
    }

    // -------------------------------------------------------------------------
    // Resolution orders are bound to one caller
    // -------------------------------------------------------------------------

    function test_repayment_byWrongActor_revertsWithZoneHashMismatch() public {
        Loan memory loan = _openLoan();

        currency.mint(attacker.addr, REPAYMENT);
        vm.prank(attacker.addr);
        currency.approve(address(seaport), type(uint256).max);

        vm.prank(attacker.addr);
        vm.expectRevert(ZoneHashMismatch.selector);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.repaymentOrder, "", abi.encode(bytes32(0))),
            new CriteriaResolver[](0),
            bytes32(0),
            attacker.addr
        );

        assertEq(collection.ownerOf(TOKEN_ID), address(pinkwhale), "collateral stayed put");
    }

    function test_default_byWrongActor_revertsWithZoneHashMismatch() public {
        Loan memory loan = _openLoan();
        vm.warp(loan.defaultOrder.startTime);

        vm.prank(attacker.addr);
        vm.expectRevert(ZoneHashMismatch.selector);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.defaultOrder, "", abi.encode(loan.loanId)),
            new CriteriaResolver[](0),
            bytes32(0),
            attacker.addr
        );

        assertEq(collection.ownerOf(TOKEN_ID), address(pinkwhale));
    }

    /// @dev Pointing `extraData` at an order Seaport has never seen fails the first check.
    function test_default_namingAnUnknownUpstreamOrder_reverts() public {
        Loan memory loan = _openLoan();
        vm.warp(loan.defaultOrder.startTime);

        vm.prank(lender.addr);
        vm.expectRevert(UpstreamOrderNotValidated.selector);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.defaultOrder, "", abi.encode(bytes32(uint256(1)))),
            new CriteriaResolver[](0),
            bytes32(0),
            lender.addr
        );
    }

    /**
     * @dev And naming a *real* validated order that simply is not this order's
     *      upstream gets past check #1 and dies on the zoneHash, because the
     *      upstream hash is one of the two things the zoneHash commits to.
     */
    function test_default_withForgedExtraData_revertsWithZoneHashMismatch() public {
        Loan memory loan = _openLoan();
        vm.warp(loan.defaultOrder.startTime);

        // The default order itself: validated, unfilled, and the wrong answer.
        bytes memory forged = abi.encode(loan.defaultOrderHash);

        vm.prank(lender.addr);
        vm.expectRevert(ZoneHashMismatch.selector);
        seaport.fulfillAdvancedOrder(
            _advanced(loan.defaultOrder, "", forged), new CriteriaResolver[](0), bytes32(0), lender.addr
        );
    }

    // -------------------------------------------------------------------------
    // Time
    // -------------------------------------------------------------------------

    function test_repayAfterExpiry_revertsWithSeaportInvalidTime() public {
        Loan memory loan = _openLoan();
        _fundBorrowerForRepayment(REPAYMENT);

        vm.warp(loan.repaymentOrder.endTime + 1);

        vm.prank(borrower.addr);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConsiderationEventsAndErrors.InvalidTime.selector,
                loan.repaymentOrder.startTime,
                loan.repaymentOrder.endTime
            )
        );
        seaport.fulfillAdvancedOrder(
            _advanced(loan.repaymentOrder, "", abi.encode(bytes32(0))),
            new CriteriaResolver[](0),
            bytes32(0),
            borrower.addr
        );
    }

    function test_claimDefaultBeforeExpiry_revertsWithSeaportInvalidTime() public {
        Loan memory loan = _openLoan();

        vm.prank(lender.addr);
        vm.expectRevert(
            abi.encodeWithSelector(
                ConsiderationEventsAndErrors.InvalidTime.selector,
                loan.defaultOrder.startTime,
                loan.defaultOrder.endTime
            )
        );
        seaport.fulfillAdvancedOrder(
            _advanced(loan.defaultOrder, "", abi.encode(loan.loanId)),
            new CriteriaResolver[](0),
            bytes32(0),
            lender.addr
        );
    }

    // -------------------------------------------------------------------------
    // A settled claim cannot be replayed against someone else's collateral
    // -------------------------------------------------------------------------

    /**
     * @dev Custody is pooled: every open loan's collateral sits in the same contract.
     *      So a default order from a loan that was *repaid* is still a validated
     *      Seaport order pointing at a token the contract may well be holding again.
     *      `authorizeOrder` rejects it before anything moves, because the repayment
     *      order it names has since been filled.
     */
    function test_defaultOrderFromRepaidLoan_cannotClaimLaterCollateral() public {
        Loan memory firstLoan = _openLoan();

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(firstLoan);
        assertEq(collection.ownerOf(TOKEN_ID), borrower.addr);

        // The window on the first loan closes; its default order becomes fulfillable.
        vm.warp(firstLoan.defaultOrder.startTime);

        // The borrower puts the very same token up as collateral again.
        _fundLender(PRINCIPAL);
        vm.prank(borrower.addr);
        collection.setApprovalForAll(address(seaport), true);
        Loan memory secondLoan =
            _executeLoan(_standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1));

        assertEq(collection.ownerOf(TOKEN_ID), address(pinkwhale), "Pinkwhale holds it again");

        // The lender's stale claim from loan #1 reaches for it.
        vm.prank(lender.addr);
        vm.expectRevert(UpstreamOrderAlreadyFulfilled.selector);
        seaport.fulfillAdvancedOrder(
            _advanced(firstLoan.defaultOrder, "", abi.encode(firstLoan.loanId)),
            new CriteriaResolver[](0),
            bytes32(0),
            lender.addr
        );

        assertEq(collection.ownerOf(TOKEN_ID), address(pinkwhale), "second loan's collateral is safe");

        // ...and the second loan still resolves normally.
        vm.warp(secondLoan.defaultOrder.startTime);
        _claimDefault(secondLoan);
        assertEq(collection.ownerOf(TOKEN_ID), lender.addr);
    }

    /// @dev The same order cannot simply be fulfilled twice.
    function test_repaymentOrder_cannotBeFulfilledTwice() public {
        Loan memory loan = _openLoan();
        _fundBorrowerForRepayment(REPAYMENT * 2);

        _repay(loan);

        vm.prank(borrower.addr);
        vm.expectRevert(
            abi.encodeWithSelector(ConsiderationEventsAndErrors.OrderAlreadyFilled.selector, loan.loanId)
        );
        seaport.fulfillAdvancedOrder(
            _advanced(loan.repaymentOrder, "", abi.encode(bytes32(0))),
            new CriteriaResolver[](0),
            bytes32(0),
            borrower.addr
        );
    }

    // -------------------------------------------------------------------------
    // Loan creation must describe a loan
    // -------------------------------------------------------------------------

    function test_collateralNotDirectedToPinkwhale_reverts() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        // The lender quietly points the collateral at themselves.
        params.collateralConsideration[0].recipient = payable(lender.addr);

        _expectExecuteLoanRevert(params, RecipientMustBePinkwhale.selector);
    }

    function test_borrowerDurationLongerThanLenders_reverts() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        params.borrowerDuration = params.lenderDuration + 1 days;

        _expectExecuteLoanRevert(params, DurationExceedsLenderMaximum.selector);
    }

    function test_repaymentItemsDisagree_reverts() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        // The borrower signs up to repay less than the lender expects.
        params.borrowerRepayment[0].startAmount = PRINCIPAL;
        params.borrowerRepayment[0].endAmount = PRINCIPAL;

        _expectExecuteLoanRevert(params, abi.encodeWithSelector(TermsItemMismatch.selector, uint256(0)));
    }

    function test_repaymentItemCountsDisagree_reverts() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        params.borrowerRepayment = new OfferItem[](0);

        _expectExecuteLoanRevert(params, TermsLengthMismatch.selector);
    }

    /// @dev Terms are only a hint until they reproduce the order's zoneHash.
    function test_lenderTermsThatDoNotHashToTheOrder_revert() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);

        OrderParameters memory lenderParams = _lenderOrder(params);
        lenderParams.zoneHash = keccak256("not the terms");
        OrderParameters memory borrowerParams = _borrowerOrder(params);

        // Sign before arming the cheatcode: `_sign` calls into Seaport, and
        // `vm.expectRevert` latches onto whatever call comes next.
        AdvancedOrder memory lenderAdvanced = _advanced(lenderParams, _sign(lender, lenderParams), "");
        AdvancedOrder memory borrowerAdvanced = _advanced(borrowerParams, _sign(borrower, borrowerParams), "");

        vm.prank(executor.addr);
        vm.expectRevert(LenderTermsMismatch.selector);
        pinkwhale.executeLoan(
            lenderAdvanced,
            borrowerAdvanced,
            _lenderTerms(params),
            _borrowerTerms(params),
            params.criteriaResolvers,
            _fulfillments(lenderParams, borrowerParams)
        );
    }

    function test_borrowerTermsThatDoNotHashToTheOrder_revert() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);

        OrderParameters memory lenderParams = _lenderOrder(params);
        OrderParameters memory borrowerParams = _borrowerOrder(params);
        borrowerParams.zoneHash = keccak256("not the terms either");

        AdvancedOrder memory lenderAdvanced = _advanced(lenderParams, _sign(lender, lenderParams), "");
        AdvancedOrder memory borrowerAdvanced = _advanced(borrowerParams, _sign(borrower, borrowerParams), "");

        vm.prank(executor.addr);
        vm.expectRevert(BorrowerTermsMismatch.selector);
        pinkwhale.executeLoan(
            lenderAdvanced,
            borrowerAdvanced,
            _lenderTerms(params),
            _borrowerTerms(params),
            params.criteriaResolvers,
            _fulfillments(lenderParams, borrowerParams)
        );
    }
}
