// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Unpermissioned test currency. Anyone can mint; do not use outside tests.
contract ERC20Token is ERC20 {
    /// @dev Set at construction so a mock can stand in for a real token's shape.
    ///      The demo deploys this as 6-decimal USDC; the test suite keeps 18.
    uint8 private immutable _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 tokenDecimals,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) {
        _decimals = tokenDecimals;

        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
