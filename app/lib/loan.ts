'use client';

import {parseUnits, zeroHash, type Address} from 'viem';

import {
  ItemType,
  OrderType,
  getBorrowerTermsHash,
  getLenderTermsHash,
  type ConsiderationItem,
  type OfferItem,
  type OrderParameters
} from '../../scripts/lib/orders';
import {chain, USDC_DECIMALS} from './chain';
import {cryptoPunksAddress, pinkwhaleAddress, usdcAddress} from './generated';

/**
 * The knobs a visitor gets.
 *
 * Principal is fixed and the rest are bounded, so no combination can produce an
 * order that reverts for a reason the demo is not trying to teach. The one thing
 * worth playing with is repayment: slide it to the principal for a flat fee, or
 * above it for interest that accrues by the second.
 */
export const PRINCIPAL = parseUnits('100', USDC_DECIMALS);

export const REPAYMENT_RANGE = {min: 100, max: 120, step: 1} as const;

export const DURATIONS = [
  {label: '5 minutes', seconds: 5n * 60n},
  {label: '1 hour', seconds: 60n * 60n},
  {label: '1 day', seconds: 24n * 60n * 60n}
] as const;

/** How long the two creation orders stay signable before they go stale. */
const CREATION_WINDOW = 30n * 60n;

export type LoanTerms = {
  collateral: number[];
  repaymentUsdc: number;
  durationSeconds: bigint;
};

const punkItem = (id: number): OfferItem => ({
  itemType: ItemType.ERC721,
  token: cryptoPunksAddress[chain.id],
  identifierOrCriteria: BigInt(id),
  startAmount: 1n,
  endAmount: 1n
});

const usdcItem = (amount: bigint): OfferItem => ({
  itemType: ItemType.ERC20,
  token: usdcAddress[chain.id],
  identifierOrCriteria: 0n,
  startAmount: amount,
  endAmount: amount
});

/**
 * Both orders, built from one set of terms.
 *
 * Step 5 does not let the lender retype anything, and this is why: `executeLoan`
 * requires the two sides to describe the same repayment item for item, with
 * duration the only slack. The lender mirrors the borrower or the match reverts,
 * so the mirror is derived here rather than entered twice.
 */
export const buildLoanOrders = (
  terms: LoanTerms,
  personas: {lender: Address; borrower: Address},
  now: bigint
) => {
  const repayment = parseUnits(String(terms.repaymentUsdc), USDC_DECIMALS);

  const collateralOffer = terms.collateral.map(punkItem);
  const collateralToEscrow: ConsiderationItem[] = collateralOffer.map((item) => ({
    ...item,
    recipient: pinkwhaleAddress[chain.id]
  }));

  const principalOffer = [usdcItem(PRINCIPAL)];
  const principalToBorrower: ConsiderationItem[] = [
    {...principalOffer[0]!, recipient: personas.borrower}
  ];

  // The repayment, expressed from each side. Same items, and the lender names
  // themselves as the one who gets paid.
  const lenderTerms = {
    consideration: [{...usdcItem(repayment), recipient: personas.lender}] as ConsiderationItem[],
    duration: terms.durationSeconds
  };
  const borrowerTerms = {
    offer: [usdcItem(repayment)],
    duration: terms.durationSeconds
  };

  const common = {
    zone: pinkwhaleAddress[chain.id],
    orderType: OrderType.FULL_RESTRICTED,
    startTime: now,
    endTime: now + CREATION_WINDOW,
    conduitKey: zeroHash
  };

  const borrowerOrder: OrderParameters = {
    ...common,
    offerer: personas.borrower,
    offer: collateralOffer,
    consideration: principalToBorrower,
    // The terms hash *is* the zoneHash: terms travel to `executeLoan` as plain
    // calldata, and only count if they reproduce what the signer committed to.
    zoneHash: getBorrowerTermsHash(borrowerTerms),
    salt: now,
    totalOriginalConsiderationItems: BigInt(principalToBorrower.length)
  };

  const lenderOrder: OrderParameters = {
    ...common,
    offerer: personas.lender,
    offer: principalOffer,
    consideration: collateralToEscrow,
    zoneHash: getLenderTermsHash(lenderTerms),
    salt: now + 1n,
    totalOriginalConsiderationItems: BigInt(collateralToEscrow.length)
  };

  return {borrowerOrder, lenderOrder, lenderTerms, borrowerTerms, repayment};
};

/** Simple interest over the term, for display only. */
export const apr = (terms: LoanTerms) => {
  const principal = Number(PRINCIPAL) / 10 ** USDC_DECIMALS;
  const growth = (terms.repaymentUsdc - principal) / principal;
  const year = 365 * 24 * 60 * 60;

  return growth * (year / Number(terms.durationSeconds)) * 100;
};
