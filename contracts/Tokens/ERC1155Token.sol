// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/// @notice Unpermissioned test multi-token. Anyone can mint; do not use outside tests.
contract ERC1155Token is ERC1155 {
    uint256 private _nextTokenId;

    constructor(string memory baseTokenURI) ERC1155(baseTokenURI) {}

    function getTokenCount() public view virtual returns (uint256) {
        return _nextTokenId;
    }

    function mint(address recipient, uint256 tokenId) public returns (bool) {
        _mint(recipient, tokenId, 1, "");
        return true;
    }

    function mint(address recipient, uint256 tokenId, uint256 amount) public returns (bool) {
        _mint(recipient, tokenId, amount, "");
        return true;
    }

    function mintNext(address recipient) public returns (uint256 tokenId) {
        tokenId = _nextTokenId++;
        _mint(recipient, tokenId, 1, "");
    }
}
