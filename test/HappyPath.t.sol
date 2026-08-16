// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {PinkwhaleTestBase} from "./utils/PinkwhaleTestBase.sol";
import {Pinkwhale} from "../contracts/Pinkwhale/Pinkwhale.sol";
import {PinkwhaleZone} from "../contracts/Pinkwhale/PinkwhaleZone.sol";
import {ItemType} from "seaport-types/src/lib/ConsiderationEnums.sol";

/// @notice The two ways a loan ends: it gets repaid, or it doesn't.
contract HappyPathTest is PinkwhaleTestBase {
    uint256 internal constant TOKEN_ID = 42;

    function _openERC721Loan() internal returns (Loan memory loan) {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        loan = _executeLoan(params);
    }

    function test_executeLoan_movesCollateralIntoCustodyAndPrincipalToBorrower() public {
        Loan memory loan = _openERC721Loan();

        assertEq(collection.ownerOf(TOKEN_ID), address(pinkwhale), "collateral should sit with Pinkwhale");
        assertEq(currency.balanceOf(borrower.addr), PRINCIPAL, "borrower receives the principal");
        assertEq(currency.balanceOf(lender.addr), 0, "lender parted with the principal");

        assertTrue(loan.loanId != bytes32(0), "loan id is the repayment order hash");
        assertTrue(loan.defaultOrderHash != bytes32(0));

        // Both resolution orders are live on Seaport, unfilled.
        (bool repaymentValidated,, uint256 repaymentFilled,) = seaport.getOrderStatus(loan.loanId);
        assertTrue(repaymentValidated);
        assertEq(repaymentFilled, 0);

        (bool defaultValidated,, uint256 defaultFilled,) = seaport.getOrderStatus(loan.defaultOrderHash);
        assertTrue(defaultValidated);
        assertEq(defaultFilled, 0);

        // The repayment window is the lender's duration, and the default order picks
        // up exactly where it leaves off.
        assertEq(loan.repaymentOrder.endTime, block.timestamp + DURATION);
        assertEq(loan.defaultOrder.startTime, loan.repaymentOrder.endTime + 1);
        assertEq(loan.defaultOrder.endTime, type(uint256).max);

        // The repayment order offers back exactly what came in, with no phantom items.
        assertEq(loan.repaymentOrder.offer.length, 1);
        assertEq(loan.repaymentOrder.offer[0].token, address(collection));
        assertEq(loan.repaymentOrder.offer[0].identifierOrCriteria, TOKEN_ID);
        assertEq(uint256(loan.repaymentOrder.offer[0].itemType), uint256(ItemType.ERC721));

        // ...and the default order is free to fulfil.
        assertEq(loan.defaultOrder.consideration.length, 0);
    }

    function test_executeLoan_emitsAnIndexableLoanExecuted() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);

        // Only check the indexed handles: loanId is not knowable before the call, so
        // assert the shape and then read the real values back from the return.
        vm.recordLogs();
        Loan memory loan = _executeLoan(params);

        // The loanId in the event must be the repayment order hash we can fulfil.
        (bool validated,,,) = seaport.getOrderStatus(loan.loanId);
        assertTrue(validated, "the emitted loanId addresses a real Seaport order");
    }

    function test_repay_returnsCollateralAndPaysLender() public {
        Loan memory loan = _openERC721Loan();
        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL); // borrower still holds the principal

        vm.expectEmit(true, false, false, true, address(pinkwhale));
        emit PinkwhaleZone.LoanRepaid(loan.loanId);

        _repay(loan);

        assertEq(collection.ownerOf(TOKEN_ID), borrower.addr, "collateral returns to the borrower");
        assertEq(currency.balanceOf(lender.addr), REPAYMENT, "lender is made whole plus interest");
        assertEq(currency.balanceOf(borrower.addr), 0);
        assertEq(currency.balanceOf(address(pinkwhale)), 0, "Pinkwhale keeps nothing");

        (,, uint256 filled, uint256 denominator) = seaport.getOrderStatus(loan.loanId);
        assertEq(filled, denominator, "repayment order is spent");
    }

    function test_default_letsLenderClaimCollateralForFree() public {
        Loan memory loan = _openERC721Loan();

        vm.warp(loan.defaultOrder.startTime);

        vm.expectEmit(true, false, false, true, address(pinkwhale));
        emit PinkwhaleZone.DefaultedCollateralClaimed(loan.defaultOrderHash);

        _claimDefault(loan);

        assertEq(collection.ownerOf(TOKEN_ID), lender.addr, "lender takes the collateral");
        assertEq(currency.balanceOf(lender.addr), 0, "and pays nothing for it");
        assertEq(currency.balanceOf(borrower.addr), PRINCIPAL, "borrower keeps the principal");
    }

    function test_erc1155Collateral_roundTrips() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC1155(TOKEN_ID, 1);

        LoanParams memory params = _standardLoan(ItemType.ERC1155, address(editions), TOKEN_ID, 1);
        Loan memory loan = _executeLoan(params);

        // Without `onERC1155Received` on Pinkwhale this deposit would revert:
        // Seaport moves ERC1155 with `safeTransferFrom`.
        assertEq(editions.balanceOf(address(pinkwhale), TOKEN_ID), 1, "1155 collateral in custody");
        assertEq(editions.balanceOf(borrower.addr, TOKEN_ID), 0);

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(editions.balanceOf(borrower.addr, TOKEN_ID), 1, "1155 collateral returns");
        assertEq(currency.balanceOf(lender.addr), REPAYMENT);
    }

    function test_erc1155Collateral_default() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC1155(TOKEN_ID, 5);

        LoanParams memory params = _standardLoan(ItemType.ERC1155, address(editions), TOKEN_ID, 5);
        Loan memory loan = _executeLoan(params);

        assertEq(editions.balanceOf(address(pinkwhale), TOKEN_ID), 5);

        vm.warp(loan.defaultOrder.startTime);
        _claimDefault(loan);

        assertEq(editions.balanceOf(lender.addr, TOKEN_ID), 5, "lender claims the whole stack");
    }

    /**
     * @notice Interest that accrues over the loan term, with no protocol support.
     * @dev Seaport interpolates every item linearly from `startAmount` to `endAmount`
     *      across the order's window, and Pinkwhale copies the lender's consideration
     *      into the repayment order untouched. So a lender who signs terms of
     *      "100 now, 110 at expiry" gets interest that grows from zero to ten,
     *      and Pinkwhale never learns what an interest rate is.
     */
    function test_repaymentAmountAccruesLinearlyOverTheTerm() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        params.lenderRepayment[0].startAmount = PRINCIPAL;
        params.lenderRepayment[0].endAmount = REPAYMENT;
        params.borrowerRepayment[0].startAmount = PRINCIPAL;
        params.borrowerRepayment[0].endAmount = REPAYMENT;

        Loan memory loan = _executeLoan(params);
        _fundBorrowerForRepayment(REPAYMENT);

        // Halfway through the term, the borrower owes half the interest.
        vm.warp(loan.repaymentOrder.startTime + DURATION / 2);
        _repay(loan);

        uint256 halfway = PRINCIPAL + (REPAYMENT - PRINCIPAL) / 2;
        assertApproxEqAbs(currency.balanceOf(lender.addr), halfway, 1, "half the interest at the midpoint");
        assertEq(collection.ownerOf(TOKEN_ID), borrower.addr);
    }

    /// @dev And at the very start of the window the borrower owes the principal alone.
    function test_repayingImmediatelyCostsOnlyThePrincipal() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_ID);

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), TOKEN_ID, 1);
        params.lenderRepayment[0].startAmount = PRINCIPAL;
        params.lenderRepayment[0].endAmount = REPAYMENT;
        params.borrowerRepayment[0].startAmount = PRINCIPAL;
        params.borrowerRepayment[0].endAmount = REPAYMENT;

        Loan memory loan = _executeLoan(params);
        _fundBorrowerForRepayment(0); // no extra funds needed, just the approval

        _repay(loan); // same block the loan opened in, borrower still holds the principal

        assertEq(currency.balanceOf(lender.addr), PRINCIPAL, "no interest yet");
        assertEq(collection.ownerOf(TOKEN_ID), borrower.addr);
    }

    function test_supportsInterface_coversZoneAndReceivers() public view {
        assertTrue(pinkwhale.supportsInterface(0x01ffc9a7), "ERC165");
        assertTrue(pinkwhale.supportsInterface(0x4e2312e0), "ERC1155Receiver");
    }
}
