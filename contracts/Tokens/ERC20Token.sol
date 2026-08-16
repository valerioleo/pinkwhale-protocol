// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Unpermissioned test currency. Anyone can mint; do not use outside tests.
contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply, address owner)
        ERC20(name, symbol)
    {
        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
