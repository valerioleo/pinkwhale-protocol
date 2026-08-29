// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test} from "forge-std/Test.sol";

import {ERC20Token} from "../contracts/Tokens/ERC20Token.sol";
import {ERC721Token} from "../contracts/Tokens/ERC721Token.sol";

/**
 * @notice The faucet mocks. Not part of the protocol, but the live demo mints
 *         through them, so the two things it relies on are pinned here: a token
 *         can declare its own decimals, and a collectible can hand out an
 *         arbitrary unclaimed id without a server choosing one.
 */
contract TokensTest is Test {
    uint256 internal constant SIZE = 10_000;

    ERC721Token internal apes;

    function setUp() public {
        apes = new ERC721Token("Mock Apes", "MAPE", "ipfs://", SIZE);
        // blockhash(block.number - 1) is zero at the very start of a chain, which
        // would make every seed depend only on the recipient and the nonce.
        vm.roll(500);
    }

    function test_decimals_areWhateverTheDeployerSaid() public {
        assertEq(new ERC20Token("USD Coin", "USDC", 6, 0, address(this)).decimals(), 6);
        assertEq(new ERC20Token("Mock USD", "mUSD", 18, 0, address(this)).decimals(), 18);
    }

    function test_initialSupply_goesToTheNamedOwner() public {
        address owner = makeAddr("owner");
        ERC20Token token = new ERC20Token("USD Coin", "USDC", 6, 1_000e6, owner);

        assertEq(token.balanceOf(owner), 1_000e6);
        assertEq(token.totalSupply(), 1_000e6);
    }

    function test_mintRandom_staysInsideTheCollection() public {
        for (uint256 i = 0; i < 24; i++) {
            uint256 id = apes.mintRandom(makeAddr(vm.toString(i)));
            assertLt(id, SIZE, "id must be a real collection id");
        }
    }

    /// @dev The seed mixes in the recipient and a nonce precisely so that two mints
    ///      sharing a block, and therefore a blockhash, still diverge.
    function test_mintRandom_doesNotCollideWithinOneBlock() public {
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        uint256 first = apes.mintRandom(alice);
        uint256 second = apes.mintRandom(alice);
        uint256 third = apes.mintRandom(bob);

        assertTrue(first != second && second != third && first != third, "three distinct ids");
        assertEq(apes.ownerOf(first), alice);
        assertEq(apes.ownerOf(second), alice);
        assertEq(apes.ownerOf(third), bob);
    }

    function test_mintRandom_spreadsAcrossTheRange() public {
        uint256 low;
        for (uint256 i = 0; i < 40; i++) {
            if (apes.mintRandom(makeAddr(vm.toString(i))) < SIZE / 2) low++;
        }
        // A sequential counter would put all 40 in the bottom half.
        assertGt(low, 5, "not clustered at the start");
        assertLt(low, 35, "not clustered at the end");
    }

    /// @dev A taken id walks forward, so a full collection would loop forever
    ///      without the guard that stops it getting there.
    function test_mintRandom_revertsOnceTheCollectionIsGone() public {
        ERC721Token tiny = new ERC721Token("Tiny", "TINY", "ipfs://", 3);
        address collector = makeAddr("collector");

        tiny.mintRandom(collector);
        tiny.mintRandom(collector);
        tiny.mintRandom(collector);

        assertEq(tiny.balanceOf(collector), 3, "every id claimed exactly once");

        vm.expectRevert(ERC721Token.CollectionExhausted.selector);
        tiny.mintRandom(collector);
    }

    function test_mintRandom_andMintNext_coexist() public {
        address collector = makeAddr("collector");

        uint256 random = apes.mintRandom(collector);
        uint256 sequential = apes.mintNext(collector);

        assertEq(sequential, 0, "mintNext still counts from zero");
        assertTrue(random != sequential);
        assertEq(apes.getTokenCount(), 1, "getTokenCount only tracks sequential mints");
    }

    function test_tokenURI_appendsTheIdToTheBase() public {
        uint256 id = apes.mintRandom(makeAddr("collector"));
        assertEq(apes.tokenURI(id), string.concat("ipfs://", vm.toString(id)));
    }
}
