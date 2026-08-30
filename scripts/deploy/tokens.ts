/**
 * What the faucet hands out: one collection to borrow against and one currency to
 * borrow. Nothing else, because nothing else is needed to open a loan.
 *
 * The arg tables are the single source of truth on purpose. deployoor keys a
 * deployment record on its constructor args, so if two callers disagree about one
 * string, running either supersedes the other's record and the addresses move under
 * whatever is already pointing at them.
 */
import type {Address} from 'viem';

import {getOrDeployERC20Token, getOrDeployERC721Token} from '../../deployers/index.js';
import {COLLECTION_SIZE} from '../assets/punks.js';
import {getDeployClients} from '../clients.js';

/**
 * CryptoPunks predates ERC721 and has no `tokenURI` at all: its art is one
 * composite image whose sha256 the contract commits to. So the mock carries a
 * `tokenURI` only because ERC721 wants one, and nothing reads it — the frontend
 * takes punk N straight out of cell N of that grid. See `scripts/assets/punks.ts`.
 */
const PUNK_METADATA_BASE = 'https://pinkwhale.valeriohq.com/api/punk/';

/** name, symbol, decimals. Six for USDC, matching the token it stands in for. */
const CURRENCIES = {
  USDC: ['USD Coin', 'USDC', 6]
} as const satisfies Record<string, readonly [string, string, number]>;

/** name, symbol, collection size. */
const COLLECTIONS = {
  CryptoPunks: ['CRYPTOPUNKS', 'PUNK', BigInt(COLLECTION_SIZE)]
} as const satisfies Record<string, readonly [string, string, bigint]>;

export type CurrencyName = keyof typeof CURRENCIES;
export type CollectionName = keyof typeof COLLECTIONS;

export const deployCurrency = async (name: CurrencyName, owner: Address) => {
  const [tokenName, symbol, decimals] = CURRENCIES[name];

  const {contract} = await getOrDeployERC20Token({
    ...(await getDeployClients()),
    deploymentName: name,
    args: [tokenName, symbol, decimals, 0n, owner]
  });

  return contract;
};

export const deployCollection = async (name: CollectionName) => {
  const [tokenName, symbol, size] = COLLECTIONS[name];

  const {contract} = await getOrDeployERC721Token({
    ...(await getDeployClients()),
    deploymentName: name,
    args: [tokenName, symbol, PUNK_METADATA_BASE, size]
  });

  return contract;
};

/**
 * @dev Sequential, not `Promise.all`: these share one account, so concurrent
 *      deploys all read the same nonce and every one after the first is rejected.
 */
export const deployMockTokens = async (owner: Address): Promise<[string, Address][]> => {
  const usdc = await deployCurrency('USDC', owner);
  const punks = await deployCollection('CryptoPunks');

  return [
    ['USDC', usdc.address],
    ['CryptoPunks', punks.address]
  ];
};
