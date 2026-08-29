// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Unpermissioned test collectible. Anyone can mint; do not use outside tests.
contract ERC721Token is ERC721 {
    /// @dev How many ids the collection pretends to have, so a mock can mint into
    ///      the same range as the collection it stands in for.
    uint256 public immutable collectionSize;

    uint256 private _nextTokenId;

    /// @dev Tracked apart from `_nextTokenId`, which only counts sequential mints.
    uint256 private _mintedCount;

    /// @dev Only mixed into the seed, so two mints in one block cannot collide.
    uint256 private _mintNonce;

    string private _baseTokenURI;

    error CollectionExhausted();

    constructor(string memory name, string memory symbol, string memory baseTokenURI, uint256 size)
        ERC721(name, symbol)
    {
        _baseTokenURI = baseTokenURI;
        collectionSize = size;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function getTokenCount() public view virtual returns (uint256) {
        return _nextTokenId;
    }

    function mint(address to, uint256 tokenId) public returns (bool) {
        _safeMint(to, tokenId);
        return true;
    }

    function mintNext(address recipient) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
    }

    /**
     * @notice Mint an arbitrary unclaimed id from the collection.
     *
     * @dev The seed is the previous block's hash. That is guessable and a proposer
     *      could lean on it, which is entirely fine for a faucet handing out demo
     *      collectibles and entirely unfit for anything of value. `recipient` and a
     *      nonce join the hash so two mints in the same block land somewhere
     *      different, and a taken id walks forward to the next free one.
     */
    function mintRandom(address recipient) public returns (uint256 tokenId) {
        if (_mintedCount >= collectionSize) revert CollectionExhausted();

        uint256 seed =
            uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), recipient, _mintNonce++)));

        tokenId = seed % collectionSize;

        // Bounded by the guard above: there is always at least one free id left.
        while (_ownerOf(tokenId) != address(0)) {
            tokenId = (tokenId + 1) % collectionSize;
        }

        _mintedCount++;
        _safeMint(recipient, tokenId);
    }
}
