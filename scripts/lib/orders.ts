/**
 * Building and signing Pinkwhale's Seaport orders, in viem.
 *
 * This is the single place the loan shape is expressed off-chain: the deploy demo,
 * and the docs' interactive widgets, all import from here rather than re-deriving
 * hashes by hand. Everything is pure except `signOrder`, which needs a wallet.
 */
import {
  concatHex,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  type Address,
  type Hex,
  type WalletClient
} from 'viem';

export const ItemType = {
  NATIVE: 0,
  ERC20: 1,
  ERC721: 2,
  ERC1155: 3,
  ERC721_WITH_CRITERIA: 4,
  ERC1155_WITH_CRITERIA: 5
} as const;

/** Which half of an order a criteria resolver is talking about. */
export const Side = {
  OFFER: 0,
  CONSIDERATION: 1
} as const;

export type CriteriaResolver = {
  orderIndex: bigint;
  side: number;
  index: bigint;
  identifier: bigint;
  criteriaProof: readonly `0x${string}`[];
};

export const OrderType = {
  FULL_OPEN: 0,
  PARTIAL_OPEN: 1,
  FULL_RESTRICTED: 2,
  PARTIAL_RESTRICTED: 3,
  CONTRACT: 4
} as const;

export type OfferItem = {
  itemType: number;
  token: Address;
  identifierOrCriteria: bigint;
  startAmount: bigint;
  endAmount: bigint;
};

export type ConsiderationItem = OfferItem & {recipient: Address};

export type OrderParameters = {
  offerer: Address;
  zone: Address;
  offer: readonly OfferItem[];
  consideration: readonly ConsiderationItem[];
  orderType: number;
  startTime: bigint;
  endTime: bigint;
  zoneHash: Hex;
  salt: bigint;
  conduitKey: Hex;
  totalOriginalConsiderationItems: bigint;
};

export type LenderRepaymentTerms = {
  consideration: readonly ConsiderationItem[];
  duration: bigint;
};

export type BorrowerRepaymentTerms = {
  offer: readonly OfferItem[];
  duration: bigint;
};

const OFFER_ITEM_TUPLE =
  '(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[]';
const CONSIDERATION_ITEM_TUPLE =
  '(uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[]';

/**
 * `keccak256(abi.encode(terms.consideration, terms.duration))`. This is the value
 * that must appear as the lender order's `zoneHash`, and the reason Pinkwhale can
 * trust terms passed to it as plain calldata.
 *
 * Mirrors `PinkwhaleUtils._getLenderTermsHash`.
 */
export function getLenderTermsHash(terms: LenderRepaymentTerms): Hex {
  return keccak256(
    encodeAbiParameters(parseAbiParameters(`${CONSIDERATION_ITEM_TUPLE}, uint256`), [
      terms.consideration as never,
      terms.duration
    ])
  );
}

/** Mirrors `PinkwhaleUtils._getBorrowerTermsHash`. */
export function getBorrowerTermsHash(terms: BorrowerRepaymentTerms): Hex {
  return keccak256(
    encodeAbiParameters(parseAbiParameters(`${OFFER_ITEM_TUPLE}, uint256`), [
      terms.offer as never,
      terms.duration
    ])
  );
}

/**
 * `keccak256(abi.encodePacked(upstreamOrderHash, authorisedCaller))`, the zoneHash
 * carried by a resolution order.
 *
 * Note what it does *not* commit to: the collateral token or id. Those are pinned by
 * the order's own offer items, which Seaport folds into the order hash.
 *
 * Mirrors `PinkwhaleUtils._getZoneHash`.
 */
export function getZoneHash(upstreamOrderHash: Hex, authorisedCaller: Address): Hex {
  return keccak256(concatHex([upstreamOrderHash, authorisedCaller]));
}

/**
 * The `extraData` a resolution order must carry.
 *
 * `0x00…00` for a repayment order; the repayment order's hash for the default order
 * derived from it. Creation orders deliberately carry nothing, because Pinkwhale's
 * `abi.decode` of an empty `extraData` is what stops anyone matching them outside
 * `executeLoan`.
 */
export function encodeResolutionExtraData(upstreamOrderHash: Hex): Hex {
  return encodeAbiParameters(parseAbiParameters('bytes32'), [upstreamOrderHash]);
}

/**
 * The EIP-712 types Seaport signs orders under.
 *
 * `EIP712Domain` is spelled out even though viem infers it from the domain, because
 * not every signer does: CDP's embedded wallet rejects a payload whose types omit
 * it. Declaring it does not move the digest — the domain separator is built from
 * these four fields either way — so both signers hash the same bytes.
 */
export const SEAPORT_ORDER_TYPES = {
  EIP712Domain: [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'}
  ],
  OrderComponents: [
    {name: 'offerer', type: 'address'},
    {name: 'zone', type: 'address'},
    {name: 'offer', type: 'OfferItem[]'},
    {name: 'consideration', type: 'ConsiderationItem[]'},
    {name: 'orderType', type: 'uint8'},
    {name: 'startTime', type: 'uint256'},
    {name: 'endTime', type: 'uint256'},
    {name: 'zoneHash', type: 'bytes32'},
    {name: 'salt', type: 'uint256'},
    {name: 'conduitKey', type: 'bytes32'},
    {name: 'counter', type: 'uint256'}
  ],
  OfferItem: [
    {name: 'itemType', type: 'uint8'},
    {name: 'token', type: 'address'},
    {name: 'identifierOrCriteria', type: 'uint256'},
    {name: 'startAmount', type: 'uint256'},
    {name: 'endAmount', type: 'uint256'}
  ],
  ConsiderationItem: [
    {name: 'itemType', type: 'uint8'},
    {name: 'token', type: 'address'},
    {name: 'identifierOrCriteria', type: 'uint256'},
    {name: 'startAmount', type: 'uint256'},
    {name: 'endAmount', type: 'uint256'},
    {name: 'recipient', type: 'address'}
  ]
} as const;

/**
 * The EIP-712 payload Seaport verifies an order against.
 *
 * Split out from `signOrder` because not every wallet is a viem `WalletClient`:
 * the playground signs through CDP's embedded wallet, which takes this same
 * `{domain, types, primaryType, message}` object. Keeping the payload in one place
 * means the browser and the test suite sign the identical bytes.
 */
export function buildOrderTypedData(
  seaportAddress: Address,
  chainId: number,
  params: OrderParameters,
  counter: bigint
) {
  return {
    domain: {
      name: 'Seaport',
      version: '1.6',
      chainId,
      verifyingContract: seaportAddress
    },
    types: SEAPORT_ORDER_TYPES,
    primaryType: 'OrderComponents',
    message: {
      offerer: params.offerer,
      zone: params.zone,
      offer: params.offer,
      consideration: params.consideration,
      orderType: params.orderType,
      startTime: params.startTime,
      endTime: params.endTime,
      zoneHash: params.zoneHash,
      salt: params.salt,
      conduitKey: params.conduitKey,
      counter
    }
  } as const;
}

export async function signOrder(
  walletClient: WalletClient,
  seaportAddress: Address,
  chainId: number,
  params: OrderParameters,
  counter: bigint
): Promise<Hex> {
  const account = walletClient.account;

  if (!account) throw new Error('signOrder needs a wallet client with an account');

  return walletClient.signTypedData({
    account,
    ...buildOrderTypedData(seaportAddress, chainId, params, counter)
  } as never);
}

/**
 * Index-aligned cross-matching: each side's offer item i pays the other side's
 * consideration item i. `executeLoan` always passes [lenderOrder, borrowerOrder],
 * so the lender is order 0 and the borrower is order 1.
 */
export function buildFulfillments(lenderOfferCount: number, borrowerOfferCount: number) {
  const fulfillment = (
    offerOrderIndex: number,
    offerItemIndex: number,
    considerationOrderIndex: number,
    considerationItemIndex: number
  ) => ({
    offerComponents: [{orderIndex: BigInt(offerOrderIndex), itemIndex: BigInt(offerItemIndex)}],
    considerationComponents: [
      {orderIndex: BigInt(considerationOrderIndex), itemIndex: BigInt(considerationItemIndex)}
    ]
  });

  return [
    ...Array.from({length: lenderOfferCount}, (_, i) => fulfillment(0, i, 1, i)),
    ...Array.from({length: borrowerOfferCount}, (_, i) => fulfillment(1, i, 0, i))
  ];
}

export function toAdvancedOrder(params: OrderParameters, signature: Hex, extraData: Hex = '0x') {
  return {parameters: params, numerator: 1n, denominator: 1n, signature, extraData};
}
