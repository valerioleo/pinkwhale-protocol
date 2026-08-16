// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Conduit} from "seaport-core/src/conduit/Conduit.sol";

/// @notice Thin deployable wrapper around Seaport 1.6's Conduit.
contract Conduit16 is Conduit {
    constructor() Conduit() {}
}
