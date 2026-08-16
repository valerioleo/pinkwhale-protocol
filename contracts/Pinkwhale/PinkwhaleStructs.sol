// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {OfferItem, ConsiderationItem} from "seaport-types/src/lib/ConsiderationStructs.sol";

/// @notice What the lender expects back, and for how long they'll wait.
struct LenderRepaymentTerms {
    ConsiderationItem[] consideration;
    uint256 duration;
}

/// @notice What the borrower is willing to pay back, and the longest term they'll take.
struct BorrowerRepaymentTerms {
    OfferItem[] offer;
    uint256 duration;
}

/// @notice The pair of Seaport orders that can close a loan out.
/// @dev    Bundled into a struct so `executeLoan` carries one stack slot instead of
///         three, so the whole graph compiles on the legacy pipeline. See foundry.toml.
struct ResolutionOrders {
    bytes32 repaymentOrderHash;
    bytes32 defaultOrderHash;
    uint256 expiry;
}
