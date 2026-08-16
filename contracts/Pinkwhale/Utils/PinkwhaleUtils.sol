// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {LenderRepaymentTerms, BorrowerRepaymentTerms} from "../PinkwhaleStructs.sol";

contract PinkwhaleUtils {
    function _getLenderTermsHash(LenderRepaymentTerms calldata terms) internal pure returns (bytes32 hash) {
        hash = keccak256(abi.encode(terms.consideration, terms.duration));
    }

    function _getBorrowerTermsHash(BorrowerRepaymentTerms calldata terms)
        internal
        pure
        returns (bytes32 hash)
    {
        hash = keccak256(abi.encode(terms.offer, terms.duration));
    }

    /**
     * @notice The `zoneHash` carried by a resolution order.
     * @dev    It commits to exactly two things: which order must still be unfilled
     *         for this one to be valid, and who is allowed to fulfil it. It does not
     *         mix in the collateral token or id, because the order's own offer items
     *         already pin those down and Seaport hashes them into the order hash.
     *
     * @param upstreamOrder     `bytes32(0)` for a repayment order; the repayment
     *                          order's hash for the default order derived from it.
     * @param authorisedCaller  The only address Seaport may report as `fulfiller`.
     */
    // [!region zone-hash]
    function _getZoneHash(bytes32 upstreamOrder, address authorisedCaller)
        internal
        pure
        returns (bytes32 zoneHash)
    {
        zoneHash = keccak256(abi.encodePacked(upstreamOrder, authorisedCaller));
    }
    // [!endregion zone-hash]
}
