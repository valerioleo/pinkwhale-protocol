/**
 * What each actor is handed, and what counts as already handed.
 *
 * Shared by the faucet endpoint and the browser deliberately: the button decides
 * who to ask for and the endpoint decides who to send to, and if those two rules
 * ever drift the button starts lying about what it will do.
 */
import {parseEther, parseUnits} from 'viem';

import {USDC_DECIMALS} from './chain';

/**
 * Enough to open a loan and still have something left over. Both sides need it —
 * the lender to hand over the principal, the borrower to cover interest the
 * principal alone does not stretch to.
 */
export const FAUCET_USDC = parseUnits('2000', USDC_DECIMALS);

/** Two, so a bundle of collateral is a real choice rather than a single checkbox. */
export const PUNKS_PER_BORROWER = 2;

/**
 * Below this, claim more from the faucet. A claim is 0.0001 ETH and a match costs
 * about 0.0000023 with its L1 fee, so the floor still covers a few loans and each
 * claim lasts dozens.
 */
export const GAS_FLOOR = parseEther('0.00002');

type Holdings = {usdc: bigint; punks: number[]; eth: bigint};

/**
 * What this actor is missing, asset by asset. The faucet hands over exactly this
 * and nothing more: USDC back up to the line, punks only to a borrower holding
 * none, gas only below the floor.
 */
export const shortfall = (persona: 'lender' | 'borrower', holdings: Holdings) => ({
  usdc: holdings.usdc < FAUCET_USDC ? FAUCET_USDC - holdings.usdc : 0n,
  punks: persona === 'borrower' && holdings.punks.length < 1 ? PUNKS_PER_BORROWER : 0,
  gas: holdings.eth < GAS_FLOOR
});

/** Whether this actor is short of anything it needs to play its part. */
export const isShort = (persona: 'lender' | 'borrower', holdings: Holdings) => {
  const {usdc, punks, gas} = shortfall(persona, holdings);

  return usdc > 0n || punks > 0 || gas;
};
