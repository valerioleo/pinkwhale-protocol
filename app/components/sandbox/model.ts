/**
 * The loan lifecycle, as the figure tells it: agree, exchange, resolve.
 *
 * Only the third step moves under its own power. The first two are pictures that
 * assemble themselves on arrival; the third is a small machine with a clock, and
 * the one thing worth getting right about it is that the clock drives everything
 * else. Amount, phase, which order is fillable and which is dead are all read off
 * the day — there is no second copy of the loan's state to fall out of step with
 * the first.
 */

export const PRINCIPAL = 100;

export const INTEREST = 10;

export const TERM_DAYS = 30;

/** How far past the deadline the claim lane runs, in days. For drawing only. */
export const CLAIM_DAYS = 5;

/**
 * Seaport interpolates linearly between the two endpoints and stops at the
 * second, which is why the figure can say "amount at deadline" and mean it: past
 * day 30 the debt does not keep climbing, it stops being payable.
 */
export const owedOn = (day: number) =>
  PRINCIPAL + (INTEREST * Math.min(day, TERM_DAYS)) / TERM_DAYS;

export type Scenario = 'repay' | 'default';

/** Where a scenario comes to rest. Everything before it is the clock running. */
export const SETTLES_ON: Record<Scenario, number> = {repay: 15, default: TERM_DAYS + 1};

export type Phase = 'idle' | 'accruing' | 'settled';

export type Transfer = {readonly asset: 'usdc' | 'ape'; readonly route: string};

export type ExitOrder = {
  readonly title: string;
  readonly badge: string;
  /** Drives both the glyph and the colour: they are one decision, not two. */
  readonly mark: 'live' | 'locked' | 'filled' | 'void' | 'expired';
  readonly note: string;
  readonly amount?: string;
  readonly transfers: readonly Transfer[];
  /** A filled claim is the one card the figure tints. */
  readonly tinted?: boolean;
  /** Routes that can no longer happen are still shown, greyed. */
  readonly spent?: boolean;
};

const REPAYMENT_ROUTES: readonly Transfer[] = [
  {asset: 'usdc', route: 'Alice → Bob'},
  {asset: 'ape', route: 'Pinkwhale → Alice'}
];

const CLAIM_ROUTES: readonly Transfer[] = [{asset: 'ape', route: 'Pinkwhale → Bob'}];

/** The two exit orders, read at whatever moment the player is showing. */
export const exitOrders = (
  scenario: Scenario,
  phase: Phase,
  day: number
): readonly [ExitOrder, ExitOrder] => {
  const settled = phase === 'settled';
  const owed = String(Math.round(owedOn(day)));

  if (scenario === 'repay') {
    return [
      {
        title: 'Repayment',
        badge: settled ? `FILLED · DAY ${day}` : 'FILLABLE NOW',
        mark: settled ? 'filled' : 'live',
        note: settled ? 'Paid before the deadline.' : 'Pay now to return the NFT.',
        amount: owed,
        transfers: REPAYMENT_ROUTES
      },
      {
        title: 'Default',
        badge: settled ? 'VOID' : 'TIME-LOCKED',
        mark: settled ? 'void' : 'locked',
        note: settled
          ? 'Repayment makes this order unfillable.'
          : `Claim after day ${TERM_DAYS} only if unpaid.`,
        transfers: CLAIM_ROUTES,
        spent: true
      }
    ];
  }

  return [
    {
      title: 'Repayment',
      badge: settled ? 'EXPIRED' : 'FILLABLE NOW',
      mark: settled ? 'expired' : 'live',
      note: settled ? 'Window closed without repayment.' : 'Pay now to return the NFT.',
      amount: settled ? undefined : owed,
      transfers: REPAYMENT_ROUTES,
      spent: settled
    },
    {
      title: 'Default',
      badge: settled ? `FILLED · DAY ${day}` : 'TIME-LOCKED',
      mark: settled ? 'filled' : 'locked',
      note: settled
        ? 'Bob claims after the deadline.'
        : `Claim after day ${TERM_DAYS} only if unpaid.`,
      transfers: CLAIM_ROUTES,
      tinted: settled,
      spent: !settled
    }
  ];
};

/** The words around the figure, which change with the moment it is showing. */
export const playerCopy = (scenario: Scenario, phase: Phase) => ({
  playback:
    phase === 'idle' ? 'AUTO PLAY' : phase === 'accruing' ? 'ACCRUING' : 'SCENARIO COMPLETE',
  amountLabel:
    phase !== 'settled'
      ? 'AMOUNT TO REPAY NOW'
      : scenario === 'repay'
        ? 'REPAYMENT AMOUNT'
        : 'AMOUNT AT DEADLINE',
  dayNote:
    phase !== 'settled'
      ? 'Loan still open'
      : scenario === 'repay'
        ? `of ${TERM_DAYS} days`
        : 'Window closed',
  claimLane:
    phase !== 'settled' ? 'CLAIM · LOCKED' : scenario === 'repay' ? 'CLAIM · VOID' : 'CLAIM',
  caption:
    phase !== 'settled'
      ? 'No repayment yet. Interest accrues; the NFT remains in Pinkwhale custody.'
      : scenario === 'repay'
        ? 'Repay: fill one order, void the other. Default: pass the deadline, then claim.'
        : 'Deadline passes → claim becomes available → Bob claims.'
});

/** The beats listed under the figure, for whichever scenario is showing. */
export const BEATS: Record<Scenario, readonly string[]> = {
  repay: [
    `Day 0 → ${TERM_DAYS} · amount rises from ${PRINCIPAL} to ${PRINCIPAL + INTEREST} USDC`,
    `Day ${SETTLES_ON.repay} · Alice fills Repayment before the deadline`,
    'NFT returns to Alice · Default becomes unfillable'
  ],
  default: [
    `Day 0 → ${TERM_DAYS} · amount rises from ${PRINCIPAL} to ${PRINCIPAL + INTEREST} USDC`,
    `Day ${SETTLES_ON.default} · repayment closes, Claim becomes available`,
    'Bob claims · NFT moves to Bob, loan closes'
  ]
};

/** The two signed orders in step 01, as a diff against a plain Seaport order. */
export const AGREEMENT = [
  {
    signer: 'Alice',
    title: `Borrow ${PRINCIPAL} USDC`,
    pair: ['BAYC', 'USDC'] as const,
    added: [
      'zone: Pinkwhale',
      'zoneHash: hash(',
      'maxInterest = 10%,',
      'minLength = 30',
      ')',
      'recipient: Pinkwhale'
    ]
  },
  {
    signer: 'Bob',
    title: `Lend ${PRINCIPAL} USDC`,
    pair: ['USDC', 'BAYC'] as const,
    added: [
      'zone: Pinkwhale',
      'zoneHash: hash(',
      'minInterest = 10%,',
      'maxLength = 30',
      ')',
      'recipient: Pinkwhale'
    ]
  }
] as const;

export const MOTION_CUES = [
  {
    id: '01 / AGREE',
    text:
      'Diff rows appear. The shared zone highlights, then compatible interest and duration ' +
      'bounds resolve to 10% and 30 days.'
  },
  {
    id: '02 / EXCHANGE',
    text:
      "Two transfer lanes play together: Alice's BAYC enters custody as Bob's USDC arrives " +
      'with Alice.'
  },
  {
    id: '03 / RESOLVE',
    text:
      'Create two exit orders at opening. Advance time and amount together. Fill repayment—or ' +
      "unlock the lender's claim after expiry."
  }
] as const;
