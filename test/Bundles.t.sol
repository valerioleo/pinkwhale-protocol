// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {PinkwhaleTestBase} from "./utils/PinkwhaleTestBase.sol";

import {ConsiderationItem, CriteriaResolver, OfferItem} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ItemType, Side} from "seaport-types/src/lib/ConsiderationEnums.sol";

import {ERC20Token} from "../contracts/Tokens/ERC20Token.sol";
import {ERC721Token} from "../contracts/Tokens/ERC721Token.sol";

/**
 * @notice Bundles: one loan secured by several items at once, of mixed types and
 *         from unrelated contracts.
 *
 * @dev    This is a different mechanism from the one in `Criteria.t.sol`. Criteria
 *         decide *which* token fills a slot; the length of the offer array decides
 *         how many slots there are. Seaport matches item for item either way, and
 *         Pinkwhale carries every execution addressed to it into the resolution
 *         orders, so a bundle needs no code that a single-item loan does not.
 */
contract BundlesTest is PinkwhaleTestBase {
    uint256 internal constant APE_ID = 8817;
    uint256 internal constant PENGUIN_ID = 3572;
    uint256 internal constant PENGUIN_ID_ALT = 6190;
    uint256 internal constant EDITION_ID = 3;
    uint256 internal constant EDITION_AMOUNT = 5;
    uint256 internal constant PAIRED_TOKENS = 5_000e18;
    uint256 internal constant MARKETPLACE_FEE = 2e18;

    /// @dev A second, unrelated ERC721 collection, plus the ERC20 that some NFTs are
    ///      only worth pledging alongside.
    ERC721Token internal penguins;
    ERC20Token internal paired;

    function setUp() public override {
        super.setUp();

        penguins = new ERC721Token("Mock Penguins", "MPEN", "ipfs://");
        paired = new ERC20Token("Mock Paired", "mPAIR", 0, address(this));
    }

    /// @dev Two ERC721s from different contracts, an ERC1155 balance, and an ERC20.
    function _giveBorrowerTheBundle() internal {
        collection.mint(borrower.addr, APE_ID);
        penguins.mint(borrower.addr, PENGUIN_ID);
        editions.mint(borrower.addr, EDITION_ID, EDITION_AMOUNT);
        paired.mint(borrower.addr, PAIRED_TOKENS);

        vm.startPrank(borrower.addr);
        collection.setApprovalForAll(address(seaport), true);
        penguins.setApprovalForAll(address(seaport), true);
        editions.setApprovalForAll(address(seaport), true);
        paired.approve(address(seaport), type(uint256).max);
        vm.stopPrank();
    }

    /// @dev The standard loan with its one collateral item swapped for the bundle.
    function _bundleLoan() internal returns (LoanParams memory params) {
        params = _standardLoan(ItemType.ERC721, address(collection), APE_ID, 1);

        params.collateralOffer = new OfferItem[](4);
        params.collateralOffer[0] = _offerItem(ItemType.ERC721, address(collection), APE_ID, 1);
        params.collateralOffer[1] = _offerItem(ItemType.ERC721, address(penguins), PENGUIN_ID, 1);
        params.collateralOffer[2] =
            _offerItem(ItemType.ERC1155, address(editions), EDITION_ID, EDITION_AMOUNT);
        params.collateralOffer[3] = _offerItem(ItemType.ERC20, address(paired), 0, PAIRED_TOKENS);

        // The lender's consideration is the same list, addressed to Pinkwhale.
        params.collateralConsideration = new ConsiderationItem[](params.collateralOffer.length);
        for (uint256 i = 0; i < params.collateralOffer.length; i++) {
            OfferItem memory item = params.collateralOffer[i];
            params.collateralConsideration[i] = _considerationItem(
                item.itemType, item.token, item.identifierOrCriteria, item.startAmount, address(pinkwhale)
            );
        }
    }

    function test_bundleLoan_takesEveryItemIntoCustodyAndGivesThemAllBack() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerTheBundle();

        Loan memory loan = _executeLoan(_bundleLoan());

        assertEq(collection.ownerOf(APE_ID), address(pinkwhale));
        assertEq(penguins.ownerOf(PENGUIN_ID), address(pinkwhale));
        assertEq(editions.balanceOf(address(pinkwhale), EDITION_ID), EDITION_AMOUNT);
        assertEq(paired.balanceOf(address(pinkwhale)), PAIRED_TOKENS);
        assertEq(paired.balanceOf(borrower.addr), 0, "the ERC20 is collateral like anything else");
        assertEq(currency.balanceOf(borrower.addr), PRINCIPAL, "one principal against the whole bundle");

        // One repayment order offers all four back, in the order they arrived.
        assertEq(loan.repaymentOrder.offer.length, 4);
        assertEq(loan.repaymentOrder.offer[0].token, address(collection));
        assertEq(loan.repaymentOrder.offer[1].token, address(penguins));
        assertEq(loan.repaymentOrder.offer[2].token, address(editions));
        assertEq(loan.repaymentOrder.offer[2].startAmount, EDITION_AMOUNT);
        assertEq(loan.repaymentOrder.offer[3].token, address(paired));
        assertEq(loan.repaymentOrder.offer[3].startAmount, PAIRED_TOKENS);

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(collection.ownerOf(APE_ID), borrower.addr);
        assertEq(penguins.ownerOf(PENGUIN_ID), borrower.addr);
        assertEq(editions.balanceOf(borrower.addr, EDITION_ID), EDITION_AMOUNT);
        assertEq(paired.balanceOf(borrower.addr), PAIRED_TOKENS);
        assertEq(currency.balanceOf(lender.addr), REPAYMENT);
    }

    function test_bundleLoan_defaultHandsTheWholeBundleOver() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerTheBundle();

        Loan memory loan = _executeLoan(_bundleLoan());

        assertEq(loan.defaultOrder.offer.length, 4, "the claim covers everything in custody");
        assertEq(loan.defaultOrder.consideration.length, 0, "and still costs nothing to fill");

        vm.warp(loan.defaultOrder.startTime);
        _claimDefault(loan);

        assertEq(collection.ownerOf(APE_ID), lender.addr);
        assertEq(penguins.ownerOf(PENGUIN_ID), lender.addr);
        assertEq(editions.balanceOf(lender.addr, EDITION_ID), EDITION_AMOUNT);
        assertEq(paired.balanceOf(lender.addr), PAIRED_TOKENS);
    }

    /**
     * @dev The repayment side is just as free as the collateral side. Two consideration
     *      items with different recipients is how a frontend takes its fee: the lender
     *      is paid, the marketplace is paid, and Pinkwhale has no idea either happened.
     */
    function test_bundleLoan_repaymentSplitsAcrossRecipients() public {
        _fundLender(PRINCIPAL);
        _giveBorrowerTheBundle();

        address marketplace = makeAddr("marketplace");

        LoanParams memory params = _bundleLoan();

        params.lenderRepayment = new ConsiderationItem[](2);
        params.lenderRepayment[0] =
            _considerationItem(ItemType.ERC20, address(currency), 0, REPAYMENT, lender.addr);
        params.lenderRepayment[1] =
            _considerationItem(ItemType.ERC20, address(currency), 0, MARKETPLACE_FEE, marketplace);

        params.borrowerRepayment = new OfferItem[](2);
        params.borrowerRepayment[0] = _offerItem(ItemType.ERC20, address(currency), 0, REPAYMENT);
        params.borrowerRepayment[1] = _offerItem(ItemType.ERC20, address(currency), 0, MARKETPLACE_FEE);

        Loan memory loan = _executeLoan(params);

        assertEq(loan.repaymentOrder.consideration.length, 2);
        assertEq(loan.repaymentOrder.consideration[0].recipient, lender.addr);
        assertEq(loan.repaymentOrder.consideration[1].recipient, marketplace);

        _fundBorrowerForRepayment(REPAYMENT + MARKETPLACE_FEE - PRINCIPAL);
        _repay(loan);

        assertEq(currency.balanceOf(lender.addr), REPAYMENT);
        assertEq(currency.balanceOf(marketplace), MARKETPLACE_FEE, "the fee item settles like any other");
        assertEq(collection.ownerOf(APE_ID), borrower.addr);
        assertEq(paired.balanceOf(borrower.addr), PAIRED_TOKENS);
    }

    /**
     * @dev The two mechanisms compose. Item 0 of this bundle is one named ape; item 1 is
     *      "any penguin from this set", settled at execution time. What reaches custody
     *      is two concrete tokens either way, so the resolution orders are minted against
     *      ids and need no resolvers of their own.
     */
    function test_bundleLoan_mixesNamedAndCriteriaItems() public {
        _fundLender(PRINCIPAL);

        collection.mint(borrower.addr, APE_ID);
        penguins.mint(borrower.addr, PENGUIN_ID);
        penguins.mint(borrower.addr, PENGUIN_ID_ALT);

        vm.startPrank(borrower.addr);
        collection.setApprovalForAll(address(seaport), true);
        penguins.setApprovalForAll(address(seaport), true);
        vm.stopPrank();

        uint256 root = uint256(_pairRoot(PENGUIN_ID, PENGUIN_ID_ALT));

        LoanParams memory params = _standardLoan(ItemType.ERC721, address(collection), APE_ID, 1);

        params.collateralOffer = new OfferItem[](2);
        params.collateralOffer[0] = _offerItem(ItemType.ERC721, address(collection), APE_ID, 1);
        params.collateralOffer[1] = _offerItem(ItemType.ERC721_WITH_CRITERIA, address(penguins), root, 1);

        params.collateralConsideration = new ConsiderationItem[](2);
        params.collateralConsideration[0] =
            _considerationItem(ItemType.ERC721, address(collection), APE_ID, 1, address(pinkwhale));
        params.collateralConsideration[1] =
            _considerationItem(ItemType.ERC721_WITH_CRITERIA, address(penguins), root, 1, address(pinkwhale));

        // Index 1 on both sides: the lender's consideration and the borrower's offer.
        params.criteriaResolvers = new CriteriaResolver[](2);
        params.criteriaResolvers[0] =
            _criteriaResolver(0, Side.CONSIDERATION, 1, PENGUIN_ID_ALT, _pairProof(PENGUIN_ID));
        params.criteriaResolvers[1] =
            _criteriaResolver(1, Side.OFFER, 1, PENGUIN_ID_ALT, _pairProof(PENGUIN_ID));

        Loan memory loan = _executeLoan(params);

        assertEq(collection.ownerOf(APE_ID), address(pinkwhale), "the named item");
        assertEq(penguins.ownerOf(PENGUIN_ID_ALT), address(pinkwhale), "the resolved one");
        assertEq(penguins.ownerOf(PENGUIN_ID), borrower.addr, "the rest of the set is untouched");

        assertEq(loan.repaymentOrder.offer.length, 2);
        assertEq(uint256(loan.repaymentOrder.offer[1].itemType), uint256(ItemType.ERC721));
        assertEq(loan.repaymentOrder.offer[1].identifierOrCriteria, PENGUIN_ID_ALT);

        _fundBorrowerForRepayment(REPAYMENT - PRINCIPAL);
        _repay(loan);

        assertEq(collection.ownerOf(APE_ID), borrower.addr);
        assertEq(penguins.ownerOf(PENGUIN_ID_ALT), borrower.addr);
    }
}
