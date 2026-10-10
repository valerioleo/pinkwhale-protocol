/**
 * The loan, as the figure tells it: two orders match, and execution leaves two
 * new orders in their place, each owning its stretch of time.
 *
 * The one thing worth getting right is that the clock drives everything else.
 * Interest, which order is fillable and which is dead are all read off the day and
 * the outcome — there is no second copy of the loan's state to fall out of step
 * with the first.
 */

export const PRINCIPAL = 100;

export const INTEREST = 10;

export const TERM_DAYS = 30;

/** The day Bob's claim lands, the first after the deadline. */
export const CLAIM_DAY = TERM_DAYS + 1;

/**
 * Seaport interpolates linearly between the two endpoints and stops at the
 * second: past day 30 the debt does not keep climbing, it stops being payable.
 */
export const interestOn = (day: number) =>
  (PRINCIPAL * (INTEREST / 100) * Math.min(day, TERM_DAYS)) / TERM_DAYS;

/** Running until one of the two exit orders is filled. */
export type Outcome = 'running' | 'repaid' | 'claimed';

export type Variant = 'live' | 'pending' | 'void';

export type Person = 'alice' | 'bob';

export type Mark = Person | 'pinkwhale';

export type Asset = 'bayc' | 'usdc';

export type OrderRow = {
  readonly label: string;
  readonly value:
    | {readonly kind: 'asset'; readonly asset: Asset; readonly text: string}
    | {readonly kind: 'party'; readonly mark: Mark; readonly text: string}
    | {readonly kind: 'none'}
    | {readonly kind: 'time'; readonly text: string}
    | {readonly kind: 'terms'; readonly length: string; readonly rate: string};
  /** Where the consideration goes, when it is not the offerer. */
  readonly recipient?: {readonly mark: Mark; readonly text: string};
};

export type Order = {
  readonly title: string;
  readonly status: string;
  readonly variant: Variant;
  /** Whose colours a live card wears. */
  readonly tone: 'neutral' | 'repayment' | 'claim';
  readonly rows: readonly OrderRow[];
};

const two = (value: number) => value.toFixed(2);

const zone: OrderRow = {label: 'zone', value: {kind: 'party', mark: 'pinkwhale', text: 'Pinkwhale'}};

/**
 * The two signed orders. They differ only in which way their bounds face, which
 * is the whole reason they can meet: her ceiling and his floor are the same number.
 * Until the reader matches them they are only signed.
 */
export const signedOrders = (matched: boolean): readonly [Order, Order] => {
  const status = matched ? 'MATCHED' : 'SIGNED';

  return [
    {
      title: 'Alice - Borrower',
      status,
      variant: 'live',
      tone: 'neutral',
      rows: [
        {label: 'Offer', value: {kind: 'asset', asset: 'bayc', text: 'BAYC'}},
        {label: 'Consideration', value: {kind: 'asset', asset: 'usdc', text: `${PRINCIPAL} USDC`}},
        zone,
        {label: 'zoneHash', value: {kind: 'terms', length: `≥ ${TERM_DAYS} days`, rate: `≤ ${INTEREST}%`}}
      ]
    },
    {
      title: 'Bob - Lender',
      status,
      variant: 'live',
      tone: 'neutral',
      rows: [
        {label: 'Offer', value: {kind: 'asset', asset: 'usdc', text: `${PRINCIPAL} USDC`}},
        {
          label: 'Consideration',
          value: {kind: 'asset', asset: 'bayc', text: 'BAYC'},
          recipient: {mark: 'pinkwhale', text: 'Pinkwhale'}
        },
        zone,
        {label: 'zoneHash', value: {kind: 'terms', length: `≤ ${TERM_DAYS} days`, rate: `≥ ${INTEREST}%`}}
      ]
    }
  ];
};

/**
 * The repayment order dies with the deadline, not with the claim: Seaport stops
 * filling an order at its endTime, which is the same second the default's
 * startTime opens.
 */
export const windowClosed = (day: number) => day >= TERM_DAYS;

/**
 * The two exit orders, read at whatever moment the player is showing. `waiting`
 * is the figure before its clock has started: both orders exist, neither is yet
 * the one that matters.
 */
export const exitOrders = (outcome: Outcome, day: number, waiting: boolean): readonly [Order, Order] => {
  const closed = windowClosed(day);

  return [
    {
      title: 'Repayment',
      status:
        outcome === 'repaid'
          ? 'FILLED'
          : outcome === 'claimed'
            ? 'VOID'
            : closed
              ? 'EXPIRED'
              : 'FILLABLE NOW',
      variant:
        outcome === 'repaid'
          ? 'live'
          : outcome === 'claimed'
            ? 'void'
            : closed || waiting
              ? 'pending'
              : 'live',
      tone: 'repayment',
      rows: [
        {label: 'Offer', value: {kind: 'asset', asset: 'bayc', text: 'BAYC'}},
        {
          label: 'Consideration',
          value: {
            kind: 'asset',
            asset: 'usdc',
            // A claimed loan was never repaid, so there is no one figure to show.
            text: `${PRINCIPAL} + ${outcome === 'claimed' ? 'interest' : two(interestOn(day))}`
          },
          recipient: {mark: 'bob', text: 'Bob'}
        },
        {label: 'Authorized filler', value: {kind: 'party', mark: 'alice', text: 'Alice'}},
        {label: 'endTime', value: {kind: 'time', text: `day ${TERM_DAYS}`}}
      ]
    },
    {
      title: 'Default',
      status:
        outcome === 'repaid'
          ? 'VOID'
          : outcome === 'claimed'
            ? 'FILLED'
            : closed
              ? 'FILLABLE NOW'
              : `OPENS DAY ${TERM_DAYS}`,
      variant: outcome === 'repaid' ? 'void' : outcome === 'claimed' || closed ? 'live' : 'pending',
      tone: 'claim',
      rows: [
        {label: 'Offer', value: {kind: 'asset', asset: 'bayc', text: 'BAYC'}},
        {label: 'Consideration', value: {kind: 'none'}},
        {label: 'Authorized filler', value: {kind: 'party', mark: 'bob', text: 'Bob'}},
        {label: 'startTime', value: {kind: 'time', text: `day ${TERM_DAYS}`}}
      ]
    }
  ];
};

/** What is announced once the orders match and the ape is in custody. */
export const MATCHED_ANNOUNCEMENT = 'Orders matched. BAYC held by Pinkwhale.';

/** Who holds the ape once the loan has ended, and the line announced when it does. */
export const ENDINGS = {
  repaid: {owner: 'alice', name: 'Alice', subtitle: 'Repaid', announce: 'Repaid. BAYC owned by Alice.'},
  claimed: {owner: 'bob', name: 'Bob', subtitle: 'Claimed', announce: 'Claimed. BAYC owned by Bob.'}
} as const;
