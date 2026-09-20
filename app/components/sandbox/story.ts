/**
 * One loan, four steps, told through who is holding what.
 *
 * The strip at the top is the only thing that persists: three columns, and the
 * assets sit in whichever one owns them at that step. Everything else on the page
 * explains a movement between two of those columns.
 *
 * So holdings are the model and the prose is the commentary — not the other way
 * round. Each step declares the world at its end; what animates is the difference
 * from the step before, which means no transition has to be written down twice.
 */

export type Holder = 'alice' | 'pinkwhale' | 'bob';

/**
 * Three assets rather than two, because the repayment is not the principal.
 * Alice's 110 is money she brings, and keeping it distinct is what lets the strip
 * show her holding the principal and the repayment at once in step 03.
 */
export type AssetId = 'ape' | 'principal' | 'repayment';

export const ASSETS: Record<AssetId, {readonly label: string; readonly kind: 'nft' | 'coin'}> = {
  ape: {label: 'BAYC #8817', kind: 'nft'},
  principal: {label: '100 USDC', kind: 'coin'},
  repayment: {label: '110 USDC', kind: 'coin'}
};

export const HOLDERS: readonly {readonly id: Holder; readonly name: string; readonly role: string}[] =
  [
    {id: 'alice', name: 'Alice', role: 'borrower'},
    {id: 'pinkwhale', name: 'Pinkwhale', role: 'custody'},
    {id: 'bob', name: 'Bob', role: 'lender'}
  ];

export type Holdings = Readonly<Record<Holder, readonly AssetId[]>>;

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
  readonly holdings: Holdings;
  /** The design's own annotation of what to watch move. The animation is driven
   *  by the holdings diff; these name it, including the parts that are not a
   *  transfer at all. */
  readonly moves: readonly string[];
  readonly scene: Scene;
};

const TERMS = 'hash(10%, 30d)';

export const STEPS: readonly Step[] = [
  {
    title: 'Two vanilla orders',
    body:
      'Alice and Bob each sign an ordinary Seaport order. Both name Pinkwhale as zone and commit ' +
      'a hash of the terms, interest and duration, in zoneHash. Nothing has moved.',
    holdings: {alice: ['ape'], pinkwhale: [], bob: ['principal']},
    moves: [],
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
    holdings: {alice: ['principal'], pinkwhale: ['ape'], bob: []},
    moves: ['ape Alice → Pinkwhale', '100 USDC Bob → Alice'],
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
    holdings: {alice: ['principal', 'ape'], pinkwhale: [], bob: ['repayment']},
    moves: ['110 USDC appears on Alice', '110 USDC Alice → Bob', 'ape Pinkwhale → Alice'],
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
    // The branch, not the next moment: this is what happens instead of step 03, so
    // the strip rewinds to the state the loan was left in and plays a different
    // ending. The ape ends on Bob — the design's own note says it slides from
    // Pinkwhale to him, though the panel lists it under both.
    holdings: {alice: ['principal'], pinkwhale: [], bob: ['ape']},
    moves: ['repayment expires', 'ape Pinkwhale → Bob, for free'],
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
