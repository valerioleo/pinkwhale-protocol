/**
 * The loan, told five times over.
 *
 * Each step is a complete picture of the world at one moment, not a diff from the
 * last — which is the point of the figure. The reader scrolls, the panel redraws,
 * and the only thing that changes between two adjacent states is what that step's
 * prose just described.
 *
 * Every figure here is arithmetic on the ones above it: Alice starts with 10 USDC
 * of her own, takes 100, repays 105, and is left with 5. Numbers that agree are
 * the whole argument, so they are written once and read from here.
 */

export type ActorRow = {
  readonly name: string;
  readonly role: string;
  readonly usdc: string;
  /** An em dash rather than empty: the row is a statement about holding nothing. */
  readonly nft: string;
  readonly tint: 'alice' | 'bob' | 'pinkwhale';
};

/** One column of the ORDERS table: an order, read top to bottom. */
export type OrderColumn = {
  readonly title: string;
  readonly createdBy: string;
  readonly rows: readonly {readonly label: string; readonly line: string; readonly sub?: string}[];
  /**
   * How the column is drawn. `live` is the ordinary case; the rest mark an order
   * that has already resolved, so the two columns stop looking interchangeable the
   * moment they stop being so.
   */
  readonly state?: 'live' | 'filled' | 'cancelled' | 'expired' | 'active';
};

export type Step = {
  readonly title: string;
  readonly day: string;
  readonly body: string;
  readonly meta?: {readonly label: string; readonly value: string};
  readonly panel: {
    readonly header: string;
    readonly status: string;
    readonly tone: 'idle' | 'open' | 'good' | 'bad';
    readonly bars?: readonly {readonly label: string; readonly value: string; readonly sub?: string}[];
    /** Rendered as a button rather than a figure: step 5 offers an action. */
    readonly action?: string;
    readonly actors: readonly ActorRow[];
    readonly orders: readonly [OrderColumn, OrderColumn];
  };
};

const APE = 'BAYC #8817';

/** The two orders Pinkwhale mints when the loan opens. Identical in steps 2 to 5;
 *  only their state differs, which is exactly what the figure is trying to show. */
const resolutionOrders = (
  repayment: OrderColumn['state'],
  fallback: OrderColumn['state']
): readonly [OrderColumn, OrderColumn] => [
  {
    title: 'Repayment',
    createdBy: 'Pinkwhale',
    state: repayment,
    rows: [
      {label: 'offer', line: APE, sub: 'to Alice'},
      {label: 'consideration', line: '100 → 110 USDC', sub: 'to Bob, day 0 → day 30'},
      {label: 'fillable if', line: 'repaid within the agreed window'},
      {label: 'terms', line: '30 days · 10 USDC interest', sub: 'linear over the window'},
      {label: 'zoneHash', line: 'hash(0, Alice)'}
    ]
  },
  {
    title: 'Default',
    createdBy: 'Pinkwhale',
    state: fallback,
    rows: [
      {label: 'offer', line: APE, sub: 'to Bob'},
      {label: 'consideration', line: 'empty'},
      {label: 'fillable if', line: 'Repayment expires unfilled'},
      {label: 'terms', line: 'no expiry', sub: 'from day 30'},
      {label: 'zoneHash', line: 'hash(repaymentOrderId, Bob)'}
    ]
  }
];

/** Alice's balance is written per step rather than derived, so a step reads as a
 *  statement of fact and not as a calculation the reader has to follow. */
const actors = (alice: string, bob: string, custodyHasApe: boolean): readonly ActorRow[] => [
  {name: 'Alice', role: 'borrower', usdc: alice, nft: custodyHasApe ? '—' : APE, tint: 'alice'},
  {name: 'Pinkwhale', role: 'custody', usdc: '—', nft: custodyHasApe ? APE : '—', tint: 'pinkwhale'},
  {name: 'Bob', role: 'lender', usdc: bob, nft: '—', tint: 'bob'}
];

export const STEPS: readonly Step[] = [
  {
    title: 'Two orders, unmatched',
    day: 'day −1',
    body:
      'Bob signs a lender order: 100 USDC for a thirty-day loan against BAYC #8817. Alice signs ' +
      'the borrower side. It is a classic coincidence of wants: each order is exactly what the ' +
      'other one asks for. Nothing has moved yet. Either order can be cancelled until they meet.',
    panel: {
      header: 'loan #1 · not yet open',
      status: 'Unmatched',
      tone: 'idle',
      actors: actors('10.00 USDC', '100.00 USDC', false),
      orders: [
        {
          title: 'Borrower',
          createdBy: 'Alice',
          rows: [
            {label: 'offer', line: APE},
            {label: 'consideration', line: '100 USDC', sub: 'to Alice'},
            {label: 'terms', line: '30 days · 10 USDC interest', sub: 'linear over the window'},
            {label: 'zoneHash', line: 'hash(terms)'}
          ]
        },
        {
          title: 'Lender',
          createdBy: 'Bob',
          rows: [
            {label: 'offer', line: '100 USDC'},
            {label: 'consideration', line: APE, sub: 'to Pinkwhale'},
            {label: 'terms', line: '30 days · 10 USDC interest', sub: 'linear over the window'},
            {label: 'zoneHash', line: 'hash(terms)'}
          ]
        }
      ]
    }
  },
  {
    title: 'The loan opens',
    day: 'day 0',
    body:
      "The two orders match. Alice's ape goes into Pinkwhale custody and Bob's 100 USDC goes to " +
      'Alice. In the same transaction Pinkwhale creates the two orders that decide how this ends.',
    panel: {
      header: 'loan #1 · day 0',
      status: 'Open',
      tone: 'open',
      actors: actors('110.00 USDC', '0.00 USDC', true),
      orders: resolutionOrders('live', 'live')
    }
  },
  {
    title: 'The debt rises',
    day: 'day 1 → 30',
    body:
      'Nothing moves on its own. What Alice owes climbs in a straight line from 100 to 110 across ' +
      'the thirty days. Seaport reads the repayment amount off the clock, so the price you see is ' +
      'the price at fill time. Scroll and watch it rise.',
    panel: {
      header: 'loan #1 · day 15',
      status: 'Open',
      tone: 'open',
      // Filled in from scroll position; the values here are the midpoint the
      // prerendered page shows before any script runs.
      bars: [
        {label: 'Day 15 of 30', value: '', sub: 'advances as you scroll'},
        {label: 'Alice owes today', value: '105.00 USDC'}
      ],
      actors: actors('110.00 USDC', '0.00 USDC', true),
      orders: resolutionOrders('live', 'live')
    }
  },
  {
    title: 'Alice pays',
    day: 'day 15',
    body:
      'Alice fills the repayment order: 105 USDC goes to Bob and the ape comes back to her. In the ' +
      "same transaction Pinkwhale's zone sees the repayment filled and the default order is " +
      'cancelled. It can never fill now.',
    meta: {label: 'Filled by', value: 'Alice'},
    panel: {
      header: 'loan #1 · day 15',
      status: 'Repaid · default cancelled',
      tone: 'good',
      bars: [
        {label: 'Repaid on day 15', value: '', sub: '105 USDC to Bob · ape back to Alice'},
        {label: 'default order', value: 'Cancelled'}
      ],
      actors: actors('5.00 USDC', '105.00 USDC', false),
      orders: resolutionOrders('filled', 'cancelled')
    }
  },
  {
    title: 'But if Alice does not pay',
    day: 'day 31',
    body:
      'The window closes and her repayment order expires unfilled. That is what activates the ' +
      'default order: from day 31 Bob can fill it and claim the collateral. The ape moves to him, ' +
      'Alice keeps the 100 USDC.',
    meta: {label: 'Can be filled by', value: 'Bob'},
    panel: {
      header: 'loan #1 · day 31',
      status: 'Expired · default active',
      tone: 'bad',
      bars: [
        {label: 'Day 31 of 30', value: '', sub: 'repayment expired unfilled'},
        {label: 'nothing left to pay', value: ''}
      ],
      action: `Claim ${APE} as Bob`,
      actors: actors('110.00 USDC', '0.00 USDC', true),
      orders: resolutionOrders('expired', 'active')
    }
  }
];

/**
 * Step 3 is the only one that moves while you read it.
 *
 * The day is a function of how far through that step you have scrolled, and the
 * amount owed is Seaport's own straight line between the two endpoints — the same
 * interpolation the contract does against `block.timestamp`.
 */
export const DURATION_DAYS = 30;

export const PRINCIPAL = 100;

export const REPAYMENT = 110;

export const owedOnDay = (day: number) =>
  PRINCIPAL + ((REPAYMENT - PRINCIPAL) * day) / DURATION_DAYS;
