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
 * One loan, on fixed terms.
 *
 * There is nothing to configure because configuring it was never the interesting
 * part: what the demo is showing is that four ordinary Seaport orders make a loan,
 * and a form full of sliders puts a chore in front of that.
 */
export const PRINCIPAL = parseUnits('1000', USDC_DECIMALS);

export const REPAYMENT_USDC = 1100;

export const DURATION_SECONDS = 5n * 60n;

export const DURATION_LABEL = '5 minutes';

/** How long the two creation orders stay signable before they go stale. */
const CREATION_WINDOW = 30n * 60n;

export type LoanTerms = {
  collateral: number[];
  repaymentUsdc: number;
  durationSeconds: bigint;
};

/** The terms, given whichever punk the borrower is putting up. */
export const termsFor = (collateral: number[]): LoanTerms => ({
  collateral,
  repaymentUsdc: REPAYMENT_USDC,
  durationSeconds: DURATION_SECONDS
});

const punkItem = (id: number): OfferItem => ({
  itemType: ItemType.ERC721,
  token: cryptoPunksAddress[chain.id],
  identifierOrCriteria: BigInt(id),
  startAmount: 1n,
  endAmount: 1n
});

const usdcItem = (amount: bigint): OfferItem => risingUsdcItem(amount, amount);

/**
 * Seaport interpolates every item linearly from `startAmount` to `endAmount`
 * across its order's window, which is the whole of Pinkwhale's interest
 * mechanism: the repayment starts at the principal and reaches the agreed total
 * at expiry, so what is owed genuinely rises by the second. Equal amounts would
 * be a flat fee instead — correct, but not what the slider is describing.
 */
const risingUsdcItem = (from: bigint, to: bigint): OfferItem => ({
  itemType: ItemType.ERC20,
  token: usdcAddress[chain.id],
  identifierOrCriteria: 0n,
  startAmount: from,
  endAmount: to
});

/**
 * Both orders, built from one set of terms.
 *
 * Step 5 does not let the lender retype anything, and this is why: `executeLoan`
 * requires the two sides to describe the same repayment item for item, with
 * duration the only slack. The lender mirrors the borrower or the match reverts,
 * so the mirror is derived here rather than entered twice.
 */
/**
 * The repayment, expressed from each side, and nothing else.
 *
 * Time is deliberately not an input: these are what each `zoneHash` commits to,
 * so `executeLoan` must be handed exactly the same structs the signatures were
 * made over. Keeping them independent of when you ask means a later caller cannot
 * reproduce them wrongly by guessing a timestamp.
 */
export const buildRepaymentTerms = (
  terms: LoanTerms,
  personas: {lender: Address; borrower: Address}
) => {
  const repayment = parseUnits(String(terms.repaymentUsdc), USDC_DECIMALS);

  const owed = risingUsdcItem(PRINCIPAL, repayment);

  return {
    lenderTerms: {
      consideration: [{...owed, recipient: personas.lender}] as ConsiderationItem[],
      duration: terms.durationSeconds
    },
    borrowerTerms: {offer: [owed], duration: terms.durationSeconds},
    repayment
  };
};

export const buildLoanOrders = (
  terms: LoanTerms,
  personas: {lender: Address; borrower: Address},
  now: bigint
) => {
  const {lenderTerms, borrowerTerms, repayment} = buildRepaymentTerms(terms, personas);

  const collateralOffer = terms.collateral.map(punkItem);
  const collateralToEscrow: ConsiderationItem[] = collateralOffer.map((item) => ({
    ...item,
    recipient: pinkwhaleAddress[chain.id]
  }));

  const principalOffer = [usdcItem(PRINCIPAL)];
  const principalToBorrower: ConsiderationItem[] = [
    {...principalOffer[0]!, recipient: personas.borrower}
  ];

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

