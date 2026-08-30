/**
 * The faucet's inventory: two collections from different contracts and two
 * currencies, which is the shape a bundle needs, since a loan can be secured by an
 * ape and a penguin and an ERC20 at once.
 *
 * The arg tables are the single source of truth on purpose. deployoor keys a
 * deployment record on its constructor args, so if two callers disagree about one
 * string, running either supersedes the other's record and the addresses move under
 * whatever is already pointing at them.
 */
import type {Address} from 'viem';

import {
  getOrDeployERC1155Token,
  getOrDeployERC20Token,
  getOrDeployERC721Token
} from '../../deployers/index.js';
import {getDeployClients} from '../clients.js';

/**
 * Where `tokenURI` points. The playground serves `/api/nft/<collection>/<id>`,
 * which proxies the real collection's metadata, so a minted id resolves to that
 * collection's own art rather than to a placeholder.
 */
export const metadataBase = process.env.METADATA_BASE_URL ?? 'http://localhost:3000/api/nft';

/** name, symbol, decimals. Six for USDC, matching the token it stands in for. */
const CURRENCIES = {
  USDC: ['USD Coin', 'USDC', 6],
  ApeCoin: ['ApeCoin', 'APE', 18]
} as const satisfies Record<string, readonly [string, string, number]>;

/** name, symbol, metadata slug, collection size. Sizes match the real collections. */
const COLLECTIONS = {
  BoredApeYachtClub: ['Bored Ape Yacht Club', 'BAYC', 'apes', 10_000n],
  PudgyPenguins: ['Pudgy Penguins', 'PPG', 'penguins', 8_888n]
} as const satisfies Record<string, readonly [string, string, string, bigint]>;

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
  const [tokenName, symbol, slug, size] = COLLECTIONS[name];

  const {contract} = await getOrDeployERC721Token({
    ...(await getDeployClients()),
    deploymentName: name,
    args: [tokenName, symbol, `${metadataBase}/${slug}/`, size]
  });

  return contract;
};

export const deployEditions = async () => {
  const {contract} = await getOrDeployERC1155Token({
    ...(await getDeployClients()),
    deploymentName: 'Editions',
    args: [`${metadataBase}/editions/`]
  });

  return contract;
};

/**
 * @dev Sequential, not `Promise.all`: these share one account, so concurrent
 *      deploys all read the same nonce and every one after the first is rejected.
 */
export const deployMockTokens = async (owner: Address): Promise<[string, Address][]> => {
  const usdc = await deployCurrency('USDC', owner);
  const apecoin = await deployCurrency('ApeCoin', owner);
  const apes = await deployCollection('BoredApeYachtClub');
  const penguins = await deployCollection('PudgyPenguins');
  const editions = await deployEditions();

  return [
    ['USDC', usdc.address],
    ['ApeCoin', apecoin.address],
    ['BoredApeYachtClub', apes.address],
    ['PudgyPenguins', penguins.address],
    ['Editions', editions.address]
  ];
};
