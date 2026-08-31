/**
 * What each actor is handed, and what counts as already handed.
 *
 * Shared by the faucet endpoint and the browser deliberately: the button decides
 * who to ask for and the endpoint decides who to send to, and if those two rules
 * ever drift the button starts lying about what it will do.
 */
import {parseUnits} from 'viem';

import {USDC_DECIMALS} from './chain';

/**
 * Enough to open a loan and still have something left over. Both sides need it —
 * the lender to hand over the principal, the borrower to cover interest the
 * principal alone does not stretch to.
 */
export const FAUCET_USDC = parseUnits('2000', USDC_DECIMALS);

/** Two, so a bundle of collateral is a real choice rather than a single checkbox. */
export const PUNKS_PER_BORROWER = 2;

/** Whether this actor is short of anything it needs to play its part. */
export const isShort = (
  persona: 'lender' | 'borrower',
  holdings: {usdc: bigint; punks: number[]}
) => holdings.usdc < FAUCET_USDC || (persona === 'borrower' && holdings.punks.length < 1);
