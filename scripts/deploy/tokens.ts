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

import {getOrDeployERC20Token, getOrDeployERC721Token} from '../../deployers/index.js';
import {getDeployClients} from '../clients.js';

/**
 * The real collections' metadata directory CIDs, read off mainnet with `tokenURI`.
 * The mocks use them verbatim, so `tokenURI(6734)` here returns exactly what Bored
 * Ape Yacht Club returns there.
 *
 * That is the point: the contracts commit to content, not to a host. Whatever
 * resolves `ipfs://` today can be replaced tomorrow without touching a deployment,
 * because a CID is not an address anyone has to keep alive at a particular URL.
 */
const METADATA_CID = {
  BoredApeYachtClub: 'QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq',
  PudgyPenguins: 'bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna'
} as const;

/** name, symbol, decimals. Six for USDC, matching the token it stands in for. */
const CURRENCIES = {
  USDC: ['USD Coin', 'USDC', 6],
  ApeCoin: ['ApeCoin', 'APE', 18]
} as const satisfies Record<string, readonly [string, string, number]>;

/** name, symbol, collection size. Sizes match the real collections. */
const COLLECTIONS = {
  BoredApeYachtClub: ['Bored Ape Yacht Club', 'BAYC', 10_000n],
  PudgyPenguins: ['Pudgy Penguins', 'PPG', 8_888n]
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
    args: [tokenName, symbol, `ipfs://${METADATA_CID[name]}/`, size]
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

  return [
    ['USDC', usdc.address],
    ['ApeCoin', apecoin.address],
    ['BoredApeYachtClub', apes.address],
    ['PudgyPenguins', penguins.address]
  ];
};
