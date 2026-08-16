// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @notice Every revert reason Pinkwhale can produce, as a typed selector.
 * @dev    The tests, and the docs' Attack Playground, assert on selectors, so
 *         every failure mode is a typed error rather than a string. Seaport's own
 *         errors, such as `InvalidTime` and `InvalidRestrictedOrder`, are asserted
 *         directly from `seaport-types`.
 */

// --- Zone hooks -------------------------------------------------------------

/// @dev A zone hook was called by something other than the Seaport instance
///      this contract was deployed against. Both `authorizeOrder` and
///      `validateOrder` are gated on this, so protocol events cannot be spoofed.
error OnlySeaport();

/// @dev `keccak256(upstreamOrderHash, fulfiller)` did not reproduce the order's
///      `zoneHash`: the wrong actor is trying to fulfil a resolution order.
error ZoneHashMismatch();

/// @dev The upstream (repayment) order referenced by a default order was never
///      validated on Seaport, so there is nothing to default on.
error UpstreamOrderNotValidated();

/// @dev The upstream (repayment) order has already been filled, so the loan was
///      repaid and the lender's default claim is dead. Without this check a stale
///      claim could be replayed against collateral a later borrower deposited.
error UpstreamOrderAlreadyFulfilled();

// --- Loan creation ----------------------------------------------------------

/// @dev A lender consideration item is directed somewhere other than Pinkwhale;
///      the collateral would never enter custody.
error RecipientMustBePinkwhale();

/// @dev The supplied lender terms do not hash to the lender order's `zoneHash`.
error LenderTermsMismatch();

/// @dev The supplied borrower terms do not hash to the borrower order's `zoneHash`.
error BorrowerTermsMismatch();

/// @dev The borrower asked for a longer loan than the lender agreed to fund.
error DurationExceedsLenderMaximum();

/// @dev Lender consideration and borrower offer describe a different number of
///      repayment items.
error TermsLengthMismatch();

/// @dev Lender and borrower disagree on a repayment item at the given index.
error TermsItemMismatch(uint256 index);

/// @dev The match produced no items payable to Pinkwhale, so there is no
///      collateral to lend against.
error NoCollateralReceived();
