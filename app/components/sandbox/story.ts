/**
 * One loan, four steps, told through who is holding what.
 *
 * The strip at the top is the only thing that persists: three columns, and the
 * assets sit in whichever one owns them. Everything else on the page explains a
 * movement between two of those columns.
 *
 * So holdings are the model and the prose is the commentary. Each step declares
 * the moments it plays through; what animates is the difference between them,
 * which means no transition has to be written down twice.
 */

export type Holder = 'alice' | 'pinkwhale' | 'bob';

/**
 * Two, and only ever two. There is one ape and one pile of USDC, and the pile
 * keeps its identity while its amount changes — Alice's debt growing to 110 is
 * the same money becoming more of itself, not a second pile appearing beside the
 * first. Modelling it as two assets made the strip draw a fresh bubble on Bob
 * when what should happen is that Alice's bubble travels there.
 */
export type AssetId = 'ape' | 'usdc';

export const ASSETS: Record<AssetId, {readonly kind: 'nft' | 'coin'; readonly icon: string}> = {
  ape: {kind: 'nft', icon: '/tokens/bayc.png'},
  usdc: {kind: 'coin', icon: '/tokens/usdc.png'}
};

/** The ape's label never changes; the USDC's does, so it is carried per frame. */
export const APE_LABEL = 'BAYC #8817';

/** `hue` is an OKLCh angle, which is what blobatar builds its palette in — the
 *  hi-fi's pink and blue faces, read back as angles. */
export const HOLDERS: readonly {
  readonly id: Holder;
  readonly name: string;
  readonly role: string;
  readonly hue: number;
}[] = [
  {id: 'alice', name: 'Alice', role: 'borrower', hue: 5},
  {id: 'pinkwhale', name: 'Pinkwhale', role: 'custody', hue: 350},
  {id: 'bob', name: 'Bob', role: 'lender', hue: 230}
];

export type Holdings = Readonly<Record<Holder, readonly AssetId[]>>;

/**
 * One moment in a step.
 *
 * Most steps are a single moment. Step 03 is three, because paying a debt is not
 * one movement: the amount owed appears, the money goes to Bob, and only then
 * does the collateral come back. That order is the point — Seaport releases the
 * ape *because* it was paid, and a strip that handed it back at the same instant
 * would be drawing a swap.
 */
export type Frame = {
  readonly holdings: Holdings;
  /** What the single USDC chip reads at this moment. */
  readonly usdc: string;
};

type Tone = 'neutral' | 'muted' | 'good' | 'bad';

export type OrderCard = {
  readonly title: string;
  readonly status: string;
  readonly tone: Tone;
  readonly by: string;
  readonly rows: readonly {readonly label: string; readonly value: string}[];
};

export type Scene = {
  readonly cards: readonly OrderCard[];
  /** Drawn between the two cards: what the first one does to the second. */
  readonly link?: string;
  readonly note?: string;
  /** Present when the step is one transaction rather than a standing state. */
  readonly tx?: {readonly header: string; readonly beats: readonly string[]};
};

export type Step = {
  readonly title: string;
  readonly body: string;
  readonly frames: readonly Frame[];
  readonly scene: Scene;
};

const TERMS = 'hash(10%, 30d)';

export const STEPS: readonly Step[] = [
  {
    title: 'Two vanilla orders',
    body:
      'Alice and Bob each sign an ordinary Seaport order. Both name Pinkwhale as zone and commit ' +
      'a hash of the terms, interest and duration, in zoneHash. Nothing has moved.',
    frames: [
      {holdings: {alice: ['ape'], pinkwhale: [], bob: ['usdc']}, usdc: '100 USDC'}
    ],
    scene: {
      cards: [
        {
          title: 'Borrower',
          status: 'Signed',
          tone: 'neutral',
          by: 'signed by Alice',
          rows: [
            {label: 'offer', value: 'BAYC #8817'},
            {label: 'wants', value: '100 USDC'},
            {label: 'zone', value: 'Pinkwhale'},
            {label: 'zoneHash', value: TERMS}
          ]
        },
        {
          title: 'Lender',
          status: 'Signed',
          tone: 'neutral',
          by: 'signed by Bob',
          rows: [
            {label: 'offer', value: '100 USDC'},
            {label: 'wants', value: 'BAYC #8817 → Pinkwhale'},
            {label: 'zone', value: 'Pinkwhale'},
            {label: 'zoneHash', value: TERMS}
          ]
        }
      ],
      note:
        'Same zoneHash on both means the same terms were agreed. Two orders with mismatched ' +
        'hashes can never match.'
    }
  },
  {
    title: 'Orders match. One transaction.',
    body:
      "Pinkwhale matches the pair. In that single transaction the ape moves into Pinkwhale's " +
      'address as escrow, the USDC moves to Alice, and two new orders with the same shape are ' +
      'created: repayment and default.',
    frames: [
      {holdings: {alice: ['usdc'], pinkwhale: ['ape'], bob: []}, usdc: '100 USDC'}
    ],
    scene: {
      tx: {
        header: 'ONE TRANSACTION · matchOrders',
        beats: ['Ape into Pinkwhale escrow', '100 USDC to Alice', 'Two orders created ↓']
      },
      cards: [
        {
          title: 'Repayment',
          status: 'Open',
          tone: 'neutral',
          by: 'created by Pinkwhale',
          rows: [
            {label: 'offer', value: 'BAYC #8817 → Alice'},
            {label: 'wants', value: '100 → 110 USDC → Bob'},
            {label: 'fillable by', value: 'Alice, until day 30'},
            {label: 'zoneHash', value: 'hash(0, Alice)'}
          ]
        },
        {
          title: 'Default',
          status: 'Waiting',
          tone: 'muted',
          by: 'created by Pinkwhale',
          rows: [
            {label: 'offer', value: 'BAYC #8817 → Bob'},
            {label: 'wants', value: 'nothing'},
            {label: 'fillable by', value: 'Bob, from day 31'},
            {label: 'zoneHash', value: 'hash(repaymentId, Bob)'}
          ]
        }
      ]
    }
  },
  {
    title: 'Alice repays. One transaction.',
    body:
      'At day 30 Alice owes 110 USDC, so it appears in her balance. She fills the repayment ' +
      'order: in that single transaction the USDC moves to Bob, the ape moves back to her, and ' +
      'the zone invalidates the default order.',
    // Three moments, in the order the contract enforces them. The debt appears,
    // it is paid, and only then is the collateral released — releasing it
    // alongside the payment would draw a swap, not a repayment.
    frames: [
      {holdings: {alice: ['usdc'], pinkwhale: ['ape'], bob: []}, usdc: '110 USDC'},
      {holdings: {alice: [], pinkwhale: ['ape'], bob: ['usdc']}, usdc: '110 USDC'},
      {holdings: {alice: ['ape'], pinkwhale: [], bob: ['usdc']}, usdc: '110 USDC'}
    ],
    scene: {
      tx: {
        header: 'ONE TRANSACTION · fulfillOrder(repayment)',
        beats: ['110 USDC to Bob', 'Ape back to Alice', 'Default order invalidated ↓']
      },
      link: 'invalidates',
      cards: [
        {
          title: 'Repayment',
          status: 'Filled',
          tone: 'good',
          by: 'filled by Alice · day 30',
          rows: [
            {label: 'paid', value: '110 USDC'},
            {label: 'got back', value: 'BAYC #8817'}
          ]
        },
        {
          title: 'Default',
          status: 'Invalidated',
          tone: 'bad',
          by: 'created by Pinkwhale',
          rows: [
            {label: 'offer', value: 'BAYC #8817 → Bob'},
            {label: 'fillable by', value: 'never'}
          ]
        }
      ]
    }
  },
  {
    title: '…or she does not',
    body:
      'The window closes with the repayment order unfilled. That expiry is what activates the ' +
      'default order. Bob fills it and the ape moves to him for free. Alice keeps the 100 USDC.',
    // The branch, not the next moment: this is what happens instead of step 03,
    // so the strip rewinds to the state the loan was left in and plays a
    // different ending. The ape ends on Bob — the design's own note says it
    // slides from Pinkwhale to him, though its panel lists it under both.
    frames: [
      {holdings: {alice: ['usdc'], pinkwhale: [], bob: ['ape']}, usdc: '100 USDC'}
    ],
    scene: {
      link: 'activates',
      cards: [
        {
          title: 'Repayment',
          status: 'Expired',
          tone: 'muted',
          by: 'expired · day 31',
          rows: [
            {label: 'offer', value: 'BAYC #8817 → Alice'},
            {label: 'fillable by', value: 'not anymore'}
          ]
        },
        {
          title: 'Default',
          status: 'Active',
          tone: 'good',
          by: 'fillable by Bob',
          rows: [
            {label: 'offer', value: 'BAYC #8817 → Bob'},
            {label: 'wants', value: 'nothing'},
            {label: 'fillable by', value: 'now'}
          ]
        }
      ],
      note:
        "Bob fills Default and the ape slides from Pinkwhale to Bob in the strip above. Alice's " +
        '100 USDC stays where it is.'
    }
  }
];

export const frameAt = (step: number, frame: number): Frame | undefined =>
  STEPS[step]?.frames[frame];

export const lastFrame = (step: number): Frame | undefined => {
  const frames = STEPS[step]?.frames;

  return frames?.[frames.length - 1];
};

/**
 * What changed hands on the way into a given frame.
 *
 * Derived, never declared. This is the same diff the animation runs on, so the
 * ring cannot mark something that did not move — there is no second description
 * of the transition to fall out of step with the first.
 */
export const movedInto = (step: number, frame: number): ReadonlySet<AssetId> => {
  const current = frameAt(step, frame);
  const before = frame > 0 ? frameAt(step, frame - 1) : lastFrame(step - 1);

  if (!current || !before) return new Set();

  const owner = (holdings: Holdings) =>
    new Map(
      (Object.keys(holdings) as Holder[]).flatMap((holder) =>
        holdings[holder].map((asset) => [asset, holder] as const)
      )
    );

  const was = owner(before.holdings);
  const moved = new Set(
    [...owner(current.holdings)]
      .filter(([asset, holder]) => was.get(asset) !== holder)
      .map(([asset]) => asset)
  );

  // A balance that grew without going anywhere has still changed, and the reader
  // is being asked to look at it.
  if (current.usdc !== before.usdc) moved.add('usdc');

  return moved;
};
