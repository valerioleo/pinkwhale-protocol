// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ConduitController} from "seaport-core/src/conduit/ConduitController.sol";

/// @notice Thin deployable wrapper around Seaport 1.6's ConduitController.
contract ConduitController16 is ConduitController {
    constructor() ConduitController() {}
}
