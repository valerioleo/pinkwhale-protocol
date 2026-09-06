/**
 * The example loan every widget on this page talks about: 100 USDC lent against
 * one Bored Ape, repaid inside 30 days at 100 rising to 110 as interest accrues.
 *
 * The hashes are real. They come from the same helpers `scripts/lib/orders.ts`
 * uses to sign orders Seaport accepts, which mirror `PinkwhaleUtils` field for
 * field. Change a number here and the hash on screen changes the way it would
 * change on chain.
 *
 * Note copy takes `**bold**` and `` `code` ``, rendered by RichText.
 */
import type {Address, Hex} from 'viem';

import {
  ItemType,
  OrderType,
  getBorrowerTermsHash,
  getLenderTermsHash,
  getZoneHash,
  type ConsiderationItem,
  type OfferItem
} from '../../../scripts/lib/orders';
import type {TokenKind} from './icons';

export {ItemType, OrderType, getBorrowerTermsHash, getLenderTermsHash, getZoneHash};
export type {ConsiderationItem, OfferItem};

export const ACTORS = {
  borrower: {
    label: 'Borrower',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as Address,
    color: 'var(--pw-borrower)'
  },
  lender: {
    label: 'Lender',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as Address,
    color: 'var(--pw-lender)'
  },
  pinkwhale: {
    label: 'Pinkwhale',
    address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0' as Address,
    color: 'var(--pw-brand)'
  },
  stranger: {
    label: 'A stranger',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' as Address,
    color: 'var(--pw-muted)'
  }
} as const;

export type ActorKey = keyof typeof ACTORS;

/** Real mainnet addresses, so the hashes below are computed over plausible data. */
export const USDC: Address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const BAYC: Address = '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D';

export const TOKEN_ID = 8817n;
export const PRINCIPAL = 100_000000n; // USDC has 6 decimals
export const INTEREST = 10_000000n;
export const DURATION = 30n * 24n * 60n * 60n;

/** A fixed t0, so the numbers on the page hold still between renders. */
export const T0 = 1_760_000_000n;
export const EXPIRY = T0 + DURATION;

export const ZERO_HASH: Hex = `0x${'0'.repeat(64)}`;

/**
 * Principal at the start of the window, principal plus interest at the end.
 * Seaport interpolates between the two, so the interest accrues by itself.
 */
const repaymentItem: ConsiderationItem = {
  itemType: ItemType.ERC20,
  token: USDC,
  identifierOrCriteria: 0n,
  startAmount: PRINCIPAL,
  endAmount: PRINCIPAL + INTEREST,
  recipient: ACTORS.lender.address
};

const {recipient: _paidTo, ...repaymentOfferItem} = repaymentItem;

export const lenderTerms = {consideration: [repaymentItem], duration: DURATION};
/** The same repayment seen from the borrower's side. An OfferItem has no recipient. */
export const borrowerTerms = {offer: [repaymentOfferItem satisfies OfferItem], duration: DURATION};

/**
 * A stand-in for the repayment order's Seaport hash. On chain it comes back from
 * `seaport.getOrderHash(...)`. The widgets only need a stable 32-byte handle to
 * show how the default order points at it.
 */
export const REPAYMENT_ORDER_HASH: Hex =
  '0x4493b1189c281adb356bc5c9faff8b7f416f58d936c13b47abfec2090c327f6b';

export type OrderKind = 'lender-creation' | 'borrower-creation' | 'repayment' | 'default';

/** One line in an order's offer or consideration array. */
export type Item = {
  index: string;
  itemType: string;
  icon?: TokenKind;
  amount: string;
  recipient?: {label: string; icon?: TokenKind};
  note: string;
};

export type Field = {
  name: string;
  value: string;
  icon?: TokenKind;
  note: string;
};

export type OrderView = {
  label: string;
  /** Who puts the signature on it: a person in a wallet, or the contract itself. */
  createdBy: 'User-created' | 'Pinkwhale-created';
  offerSubtitle: string;
  considerationSubtitle: string;
  offer: Item[];
  consideration: Item[];
  fields: Field[];
};

const short = (hex: string) => `${hex.slice(0, 10)}...${hex.slice(-8)}`;
const usdc = (amount: bigint) => `${Number(amount) / 1e6} USDC`;

const zoneField = (): Field => ({
  name: 'zone',
  value: `Pinkwhale ${short(ACTORS.pinkwhale.address)}`,
  icon: 'pinkwhale',
  note: 'The address Seaport calls back into before it will settle this order. Paired with `FULL_RESTRICTED` it routes every fulfilment through Pinkwhale. It is also why the creation orders skip the hooks entirely: **Seaport does not call a zone that is doing the calling**, and during `executeLoan` the caller is Pinkwhale.'
});

const orderTypeField = (): Field => ({
  name: 'orderType',
  value: 'FULL_RESTRICTED (2)',
  note: 'One of five values Seaport already supports. **Restricted** means the zone gets a say, unless the caller is the zone. An open order would let anyone match these directly, with nobody checking the terms.'
});

const collateralOfferItem = (note: string): Item => ({
  index: 'offer[0]',
  itemType: 'ERC721',
  icon: 'bayc',
  amount: `BAYC #${TOKEN_ID}`,
  note
});

export const ORDERS: Record<OrderKind, OrderView> = {
  'lender-creation': {
    label: 'Lender creation',
    createdBy: 'User-created',
    offerSubtitle: 'what this order gives up',
    considerationSubtitle: 'what is accepted as collateral',
    offer: [
      {
        index: 'offer[0]',
        itemType: 'ERC20',
        icon: 'usdc',
        amount: usdc(PRINCIPAL),
        note: '**The principal.** It leaves the lender during the match and goes straight to the borrower. Pinkwhale never touches it.'
      }
    ],
    consideration: [
      {
        index: 'consideration[0]',
        itemType: 'ERC721',
        icon: 'bayc',
        amount: `BAYC #${TOKEN_ID}`,
        recipient: {label: 'Pinkwhale', icon: 'pinkwhale'},
        note: 'What the lender will accept as collateral. **The recipient is the interesting part**: it says Pinkwhale, not the lender.\n\n`executeLoan` walks every consideration item and reverts with `RecipientMustBePinkwhale` if one of them points elsewhere, so a lender cannot quietly buy the ape instead of lending against it.'
      }
    ],
    fields: [
      {
        name: 'offerer',
        value: `Lender ${short(ACTORS.lender.address)}`,
        note: 'Whoever signs the order. Seaport checks the EIP-712 signature against this address, so nothing here can be forged.'
      },
      zoneField(),
      orderTypeField(),
      {
        name: 'zoneHash',
        value: short(getLenderTermsHash(lenderTerms)),
        note: 'Thirty-two bytes Seaport carries around **without ever looking at them**, which leaves Pinkwhale free to decide what they mean.\n\nHere they are `keccak256(abi.encode(consideration, duration))` of the repayment terms.\n\nThe terms reach `executeLoan` as plain calldata, so whoever sends the transaction could rewrite them. This hash is what stops that: change a number and it no longer reproduces.'
      },
      {
        name: 'startTime, endTime',
        value: 'now, now + order duration',
        note: 'How long the **offer** stands, which is the lender deciding how long to leave their funding offer open. It has nothing to do with the length of the loan.'
      },
      {
        name: 'extraData',
        value: '0x (empty)',
        note: 'Empty on purpose. Match this order outside `executeLoan` and the zone does fire, the `abi.decode` of empty bytes reverts, and Seaport reports `InvalidRestrictedOrder`. **That revert is the guard.**'
      }
    ]
  },

  'borrower-creation': {
    label: 'Borrower creation',
    createdBy: 'User-created',
    offerSubtitle: 'what is put up as collateral',
    considerationSubtitle: 'what the borrower takes away',
    offer: [
      collateralOfferItem(
        '**The collateral.** Swap the itemType for `ERC721_WITH_CRITERIA` and this same field becomes a collection offer or a bundle, because criteria items are a Seaport feature Pinkwhale gets for free.'
      )
    ],
    consideration: [
      {
        index: 'consideration[0]',
        itemType: 'ERC20',
        icon: 'usdc',
        amount: usdc(PRINCIPAL),
        recipient: {label: 'Borrower'},
        note: 'The money the borrower came for, **paid to them directly** in the same transaction that takes the ape.'
      }
    ],
    fields: [
      {
        name: 'offerer',
        value: `Borrower ${short(ACTORS.borrower.address)}`,
        note: 'The borrower signs this one, in their own wallet, exactly as they would sign a listing.'
      },
      zoneField(),
      orderTypeField(),
      {
        name: 'zoneHash',
        value: short(getBorrowerTermsHash(borrowerTerms)),
        note: '`keccak256(abi.encode(offer, duration))` of what the borrower agrees to repay.\n\n`executeLoan` compares the two sides **item by item**, so a loan only opens if both parties signed the same deal.'
      },
      {
        name: 'startTime, endTime',
        value: 'now, now + order duration',
        note: 'How long the borrower leaves the request open. Again, **not the loan term**.'
      },
      {
        name: 'extraData',
        value: '0x (empty)',
        note: 'Same guard as the lender order.'
      }
    ]
  },

  repayment: {
    label: 'Repayment',
    createdBy: 'Pinkwhale-created',
    offerSubtitle: 'the collateral, offered back',
    considerationSubtitle: 'what buys it back',
    offer: [collateralOfferItem('The collateral, now sitting in **Pinkwhale custody**.')],
    consideration: [
      {
        index: 'consideration[0]',
        itemType: 'ERC20',
        icon: 'usdc',
        amount: `${usdc(PRINCIPAL)} to ${usdc(PRINCIPAL + INTEREST)}`,
        recipient: {label: 'Lender'},
        note: 'Copied straight from the terms the lender signed, and **paid to the lender**, so the money never passes through the protocol on the way back.\n\nNote that `startAmount` and `endAmount` differ. Seaport interpolates every item linearly across the order window, so the borrower owes 100 on day zero and 110 on day thirty. **That is the interest**, and Pinkwhale contains no code for it.'
      }
    ],
    fields: [
      {
        name: 'offerer',
        value: `Pinkwhale ${short(ACTORS.pinkwhale.address)}`,
        icon: 'pinkwhale',
        note: 'A contract can be an offerer if it calls `seaport.validate` on its own order. **That is the whole trick** behind the two resolution orders: no signature, no key, no relayer.'
      },
      zoneField(),
      orderTypeField(),
      {
        name: 'zoneHash',
        value: short(getZoneHash(ZERO_HASH, ACTORS.borrower.address)),
        note: '`keccak256(abi.encodePacked(bytes32(0), borrower))`.\n\nNo upstream order to check, and **only the borrower** can fulfil it. Seaport reports the caller to the zone, which hashes it and compares.'
      },
      {
        name: 'startTime, endTime',
        value: 't0, t0 + 30 days',
        note: '**The loan term**, written as an order validity window.\n\nThere is no repayment deadline stored anywhere in Pinkwhale, because Seaport already enforces this one, and because the interest curve is measured against it.'
      },
      {
        name: 'extraData',
        value: 'bytes32(0)',
        note: 'Thirty-two zero bytes. Every resolution order names the order that must still be unfilled for it to count, and this one is **first in the chain**, so it names nothing.'
      }
    ]
  },

  default: {
    label: 'Default',
    createdBy: 'Pinkwhale-created',
    offerSubtitle: 'the collateral, offered back',
    considerationSubtitle: 'what buys it back',
    offer: [
      collateralOfferItem("Identical to the repayment order's offer. Same ape, same custodian.")
    ],
    consideration: [],
    fields: [
      {
        name: 'offerer',
        value: `Pinkwhale ${short(ACTORS.pinkwhale.address)}`,
        icon: 'pinkwhale',
        note: 'Same custodian, same collateral.'
      },
      zoneField(),
      orderTypeField(),
      {
        name: 'zoneHash',
        value: short(getZoneHash(REPAYMENT_ORDER_HASH, ACTORS.lender.address)),
        note: '`keccak256(abi.encodePacked(repaymentOrderHash, lender))`.\n\n**Two commitments in one hash.** Only the lender may fulfil this order, and it is tied to the repayment order it came from.'
      },
      {
        name: 'startTime, endTime',
        value: 'expiry + 1, type(uint256).max',
        note: 'Opens **one second** after the repayment window shuts, and never closes. The adjacency is the protocol.'
      },
      {
        name: 'salt',
        value: 'uint256(repaymentOrderHash)',
        note: '`salt` is the field Seaport leaves free for making otherwise-identical orders distinct, and it goes into the order hash.\n\nUsing the repayment order hash means **every default order is uniquely bound to its own loan**. Two loans on the same ape, on the same terms, cannot derive the same default order and end up sharing one fill.'
      },
      {
        name: 'extraData',
        value: 'repaymentOrderHash',
        note: 'The lender has to hand back the hash of the repayment order this claim came from, and it does two jobs.\n\nIt is **half of the zoneHash** above, so getting it wrong fails the check. And it tells the zone **which order to go and look up**: if that repayment order turns out to have been filled, the borrower paid the loan off and this claim is refused.'
      }
    ]
  }
};

export const ORDER_KINDS = Object.keys(ORDERS) as OrderKind[];
