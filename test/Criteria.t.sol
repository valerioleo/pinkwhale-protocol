// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {PinkwhaleTestBase} from "./utils/PinkwhaleTestBase.sol";

import {CriteriaResolver} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ItemType, Side} from "seaport-types/src/lib/ConsiderationEnums.sol";
import {CriteriaResolutionErrors} from "seaport-types/src/interfaces/CriteriaResolutionErrors.sol";

/**
 * @notice Criteria loans: the lender funds against *any* token from a set rather
 *         than one specific id, and the borrower picks which one to post at
 *         execution time.
 *
 * @dev In `executeLoan`'s order array the lender is index 0 and the borrower is
 *      index 1, so a criteria loan needs two resolvers for the same token: one for
 *      the borrower's offer item and one for the lender's consideration item.
 *      Whatever the resolvers settle on is what lands in custody, and the
 *      repayment/default orders are minted against that concrete id.
 */
contract CriteriaTest is PinkwhaleTestBase {
    uint256 internal constant TOKEN_A = 7;
    uint256 internal constant TOKEN_B = 9;
    uint256 internal constant TOKEN_OUTSIDE_SET = 13;

    /// @dev A loan whose collateral is "one of {TOKEN_A, TOKEN_B}".
    function _merkleSetLoan() internal returns (LoanParams memory params) {
        bytes32 root = _pairRoot(TOKEN_A, TOKEN_B);

        params = _standardLoan(ItemType.ERC721, address(collection), uint256(root), 1);
        params.collateralOffer[0].itemType = ItemType.ERC721_WITH_CRITERIA;
        params.collateralConsideration[0].itemType = ItemType.ERC721_WITH_CRITERIA;
    }

    /// @dev A loan whose collateral is "any token in the collection", i.e. criteria 0.
    function _collectionWideLoan() internal returns (LoanParams memory params) {
        params = _standardLoan(ItemType.ERC721, address(collection), 0, 1);
        params.collateralOffer[0].itemType = ItemType.ERC721_WITH_CRITERIA;
        params.collateralConsideration[0].itemType = ItemType.ERC721_WITH_CRITERIA;
    }

    function _resolvers(uint256 identifier, bytes32[] memory proof)
        internal
        pure
        returns (CriteriaResolver[] memory resolvers)
    {
        resolvers = new CriteriaResolver[](2);
        // order 0 is the lender; the collateral is their consideration
        resolvers[0] = _criteriaResolver(0, Side.CONSIDERATION, 0, identifier, proof);
        // order 1 is the borrower; the collateral is their offer
        resolvers[1] = _criteriaResolver(1, Side.OFFER, 0, identifier, proof);
    }

    function test_merkleSetLoan_resolvesToTheChosenTokenAndRepays() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_A);
        _giveBorrowerERC721(TOKEN_B);

        LoanParams memory params = _merkleSetLoan();
        params.criteriaResolvers = _resolvers(TOKEN_B, _pairProof(TOKEN_A));

        Loan memory loan = _executeLoan(params);

        assertEq(collection.ownerOf(TOKEN_B), address(pinkwhale), "the chosen token is the collateral");
        assertEq(collection.ownerOf(TOKEN_A), borrower.addr, "the other one is untouched");
        assertEq(currency.balanceOf(borrower.addr), PRINCIPAL);

        // The resolution orders are minted against the concrete id, not the root.
        assertEq(loan.repaymentOrder.offer.length, 1);
        assertEq(uint256(loan.repaymentOrder.offer[0].itemType), uint256(ItemType.ERC721));
        assertEq(loan.repaymentOrder.offer[0].identifierOrCriteria, TOKEN_B);
        assertEq(loan.defaultOrder.offer[0].identifierOrCriteria, TOKEN_B);

        // ...so redeeming needs no resolvers at all.
        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(collection.ownerOf(TOKEN_B), borrower.addr, "collateral comes back");
        assertEq(currency.balanceOf(lender.addr), REPAYMENT);
    }

    function test_merkleSetLoan_defaults() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_A);
        _giveBorrowerERC721(TOKEN_B);

        LoanParams memory params = _merkleSetLoan();
        params.criteriaResolvers = _resolvers(TOKEN_A, _pairProof(TOKEN_B));

        Loan memory loan = _executeLoan(params);
        assertEq(collection.ownerOf(TOKEN_A), address(pinkwhale));

        vm.warp(loan.defaultOrder.startTime);
        _claimDefault(loan);

        assertEq(collection.ownerOf(TOKEN_A), lender.addr, "lender takes the resolved token");
        assertEq(collection.ownerOf(TOKEN_B), borrower.addr);
    }

    /// @dev A token outside the merkle set cannot be passed off as collateral.
    function test_merkleSetLoan_rejectsTokenOutsideTheSet() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_A);
        _giveBorrowerERC721(TOKEN_OUTSIDE_SET);

        LoanParams memory params = _merkleSetLoan();
        // A well-formed proof, for the wrong tree.
        params.criteriaResolvers = _resolvers(TOKEN_OUTSIDE_SET, _pairProof(TOKEN_A));

        _expectExecuteLoanRevert(params, CriteriaResolutionErrors.InvalidProof.selector);

        assertEq(collection.ownerOf(TOKEN_OUTSIDE_SET), borrower.addr, "nothing moved");
    }

    /// @dev Criteria 0 means "anything from this collection", a collection-wide offer.
    function test_collectionWideLoan_acceptsAnyTokenWithoutAProof() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC721(TOKEN_OUTSIDE_SET);

        LoanParams memory params = _collectionWideLoan();
        params.criteriaResolvers = _resolvers(TOKEN_OUTSIDE_SET, new bytes32[](0));

        Loan memory loan = _executeLoan(params);

        assertEq(collection.ownerOf(TOKEN_OUTSIDE_SET), address(pinkwhale));
        assertEq(loan.repaymentOrder.offer[0].identifierOrCriteria, TOKEN_OUTSIDE_SET);

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(collection.ownerOf(TOKEN_OUTSIDE_SET), borrower.addr);
        assertEq(currency.balanceOf(lender.addr), REPAYMENT);
    }

    function test_erc1155CriteriaLoan_roundTrips() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerERC1155(TOKEN_A, 3);
        _giveBorrowerERC1155(TOKEN_B, 3);

        LoanParams memory params =
            _standardLoan(ItemType.ERC1155, address(editions), uint256(_pairRoot(TOKEN_A, TOKEN_B)), 3);
        params.collateralOffer[0].itemType = ItemType.ERC1155_WITH_CRITERIA;
        params.collateralConsideration[0].itemType = ItemType.ERC1155_WITH_CRITERIA;
        params.criteriaResolvers = _resolvers(TOKEN_A, _pairProof(TOKEN_B));

        Loan memory loan = _executeLoan(params);

        assertEq(editions.balanceOf(address(pinkwhale), TOKEN_A), 3);
        assertEq(editions.balanceOf(borrower.addr, TOKEN_B), 3, "the other edition is untouched");

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(editions.balanceOf(borrower.addr, TOKEN_A), 3);
    }
}
