// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Seaport} from "seaport-core/src/Seaport.sol";

/// @notice Thin deployable wrapper around Seaport 1.6 so Foundry/deployoor
///         emit an artifact for it. No behaviour of its own.
contract Seaport16 is Seaport {
    constructor(address conduitController) Seaport(conduitController) {}
}
