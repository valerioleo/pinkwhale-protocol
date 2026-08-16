// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ZoneParameters, Schema} from "seaport-types/src/lib/ConsiderationStructs.sol";
import {ZoneInterface} from "seaport-types/src/interfaces/ZoneInterface.sol";

import {OnlySeaport} from "./PinkwhaleErrors.sol";
import "./Utils/SeaportUtils.sol";

/**
 * @title  PinkwhaleZone
 * @notice The Seaport zone that guards Pinkwhale's resolution orders.
 *
 * @dev Seaport 1.6 splits the zone callback in two, and Pinkwhale uses the split
 *      rather than working around it.
 *
 *        authorizeOrder runs before any token moves. All the gating lives here, so
 *        a wrong caller or an already-repaid loan is turned away while the
 *        collateral is still in custody.
 *
 *        validateOrder runs after every transfer has settled. Only the protocol
 *        events live here, so `LoanRepaid` and `DefaultedCollateralClaimed` can
 *        never describe a transfer that did not happen.
 *
 *      Both hooks require `msg.sender == address(seaport)`.
 *
 *      Two properties are worth stating out loud, because the protocol leans on
 *      them and both are easy to "fix" by accident.
 *
 *      1. Creation orders never reach these hooks. During `executeLoan` the caller
 *         is the zone, and Seaport skips zone callbacks when `caller == zone`
 *         (`_isRestrictedAndCallerNotZone`). Only the resolution orders, fulfilled
 *         later by the borrower or the lender, invoke them.
 *
 *      2. "You must go through `executeLoan`" is enforced here. A third party who
 *         matches the two creation orders directly on Seaport is not the zone, so
 *         the hooks do fire. Creation orders carry empty `extraData`, so the decode
 *         below reverts and Seaport reports `InvalidRestrictedOrder`. That revert
 *         is the guard. Keep the decode strict.
 */
abstract contract PinkwhaleZone is ZoneInterface, SeaportUtils {
    event LoanRepaid(bytes32 indexed orderHash);
    event DefaultedCollateralClaimed(bytes32 indexed orderHash);

    /**
     * @notice Called by Seaport before any token fulfillments have been executed.
     *         This is where a resolution order is accepted or rejected.
     *
     * @param zoneParameters Context about the order fulfilment and the supplied
     *                       extraData.
     *
     * @return authorizedOrderMagicValue `authorizeOrder`'s own selector, which
     *                                   Seaport checks separately from the other hook's.
     */
    // [!region zone-hooks]
    // [!region authorize-order]
    function authorizeOrder(ZoneParameters calldata zoneParameters)
        external
        view
        override
        returns (bytes4 authorizedOrderMagicValue)
    {
        _onlySeaport();

        bytes32 upstreamOrderHash = _decodeUpstreamOrderHash(zoneParameters.extraData);

        _assertOrderExecution(zoneParameters.zoneHash, upstreamOrderHash, zoneParameters.fulfiller);

        authorizedOrderMagicValue = ZoneInterface.authorizeOrder.selector;
    }
    // [!endregion authorize-order]

    /**
     * @notice Called by Seaport after every transfer in the fulfilment has settled.
     *         Emits the protocol's loan-lifecycle events.
     *
     * @param zoneParameters Context about the order fulfilment and the supplied
     *                       extraData.
     *
     * @return validOrderMagicValue `validateOrder`'s own selector.
     */
    // [!region validate-order]
    function validateOrder(ZoneParameters calldata zoneParameters)
        external
        override
        returns (bytes4 validOrderMagicValue)
    {
        _onlySeaport();

        bytes32 upstreamOrderHash = _decodeUpstreamOrderHash(zoneParameters.extraData);

        // `authorizeOrder` already ran the full gate for this order in the same
        // transaction. Re-deriving the zoneHash costs one keccak, and it means the
        // events below stand on their own rather than on an assumption.
        _assertZoneHash(zoneParameters.zoneHash, upstreamOrderHash, zoneParameters.fulfiller);

        if (upstreamOrderHash == bytes32(0)) {
            // repayment orders have no upstreamOrderHash
            emit LoanRepaid(zoneParameters.orderHash);
        } else {
            // default orders have an upstreamOrderHash
            emit DefaultedCollateralClaimed(zoneParameters.orderHash);
        }

        validOrderMagicValue = ZoneInterface.validateOrder.selector;
    }
    // [!endregion validate-order]
    // [!endregion zone-hooks]

    /**
     * @dev The upstream order hash a resolution order refers to.
     *      The bare `abi.decode` is deliberate. Creation orders carry empty
     *      `extraData`, so this reverts for anyone trying to match them directly on
     *      Seaport. See property (2) in the contract docs.
     */
    // [!region extra-data-guard]
    function _decodeUpstreamOrderHash(bytes calldata extraData)
        internal
        pure
        returns (bytes32 upstreamOrderHash)
    {
        upstreamOrderHash = abi.decode(extraData, (bytes32));
    }
    // [!endregion extra-data-guard]

    function _onlySeaport() internal view {
        if (msg.sender != address(seaport)) revert OnlySeaport();
    }

    /**
     * @dev Returns the metadata for this zone.
     */
    function getSeaportMetadata()
        external
        pure
        override
        returns (
            string memory name,
            Schema[] memory schemas // map to Seaport Improvement Proposal IDs
        )
    {
        schemas = new Schema[](0);

        return ("Pinkwhale", schemas);
    }
}
