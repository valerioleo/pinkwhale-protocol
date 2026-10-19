/**
 * What a visitor is handed so they can open a loan.
 *
 * Mints are sent from the CDP server account that also deploys, so nothing here
 * needs a key on disk. Gas comes from CDP's testnet faucet: CDP sponsors 7702
 * delegations on mainnet but not on testnets, so a fresh persona pays for its
 * transactions the ordinary way, and so does the account minting to it.
 */
import type {CdpClient} from '@coinbase/cdp-sdk';
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
  parseEventLogs,
  type Address,
  type Hash,
  type Hex
} from 'viem';

import {ADMIN_ACCOUNT} from '../../../scripts/lib/admin';
import {chain} from '../chain';
import {GAS_FLOOR, isShort, shortfall} from '../faucet';
import {cryptoPunksAbi, cryptoPunksAddress, usdcAbi, usdcAddress} from '../generated';

/** `chain`, in the name CDP knows it by. */
const NETWORK = 'base-sepolia';

/** How many of a visitor's accounts are the playground's: the lender and the borrower. */
const ACTORS_PER_VISITOR = 2;

/** Below this the admin cannot cover a few borrowers' mints, and the faucet is not refilling it. */
const ADMIN_RESERVE = GAS_FLOOR / 2n;

/** Punks left to mint below which the collection wants redeploying before a visitor finds out. */
const PUNKS_RESERVE = 500n;

export type Persona = 'lender' | 'borrower';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}`);

  return value;
};

const reader = () => createPublicClient({chain, transport: http(required('BASE_SEPOLIA_RPC_URL'))});

type Reader = ReturnType<typeof reader>;

const cdpClient = async () => {
  const {CdpClient} = await import('@coinbase/cdp-sdk');

  return new CdpClient({
    apiKeyId: required('CDP_API_KEY_ID'),
    apiKeySecret: required('CDP_API_KEY_SECRET'),
    walletSecret: required('CDP_WALLET_SECRET')
  });
};

const admin = async () => {
  const cdp = await cdpClient();
  const {address} = await cdp.evm.getOrCreateAccount({name: ADMIN_ACCOUNT});

  return {cdp, address};
};

/** CDP refusing the request, as opposed to CDP being unreachable or broken. */
const isRefusal = (error: unknown) =>
  error instanceof Error &&
  'statusCode' in error &&
  typeof error.statusCode === 'number' &&
  error.statusCode < 500;

/**
 * Whether `accessToken` is a signed-in visitor's and `address` one of the actors
 * the playground made for them. Without it the endpoint funds any address at all,
 * and every one of those spends a faucet claim and a pair of punks.
 *
 * The oldest two rather than all of them: the same token can create more accounts,
 * and only the first pair is the playground's.
 */
export const ownsActor = async (accessToken: string, address: Address) => {
  const cdp = await cdpClient();

  const visitor = await cdp.endUser.validateAccessToken({accessToken}).catch((error: unknown) => {
    if (isRefusal(error)) return null;

    throw error;
  });

  if (!visitor) return false;

  return visitor.evmAccountObjects
    .toSorted((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    .slice(0, ACTORS_PER_VISITOR)
    .some((account) => account.address.toLowerCase() === address.toLowerCase());
};

/**
 * The collection is enumerable, so ownership is a read rather than a replay of
 * Transfer logs over a block range that only ever grows.
 */
const ownedPunks = async (client: Reader, owner: Address): Promise<number[]> => {
  const config = {abi: cryptoPunksAbi, address: cryptoPunksAddress[chain.id]} as const;

  const balance = await client.readContract({...config, functionName: 'balanceOf', args: [owner]});

  const ids = await Promise.all(
    Array.from({length: Number(balance)}, (_, index) =>
      client.readContract({...config, functionName: 'tokenOfOwnerByIndex', args: [owner, BigInt(index)]})
    )
  );

  return ids.map(Number);
};

/** What this actor holds. Balances are the record: there is no database here, and the chain already knows. */
const holdingsOf = async (client: Reader, address: Address, persona: Persona) => {
  const [usdc, punks, eth] = await Promise.all([
    client.readContract({
      abi: usdcAbi,
      address: usdcAddress[chain.id],
      functionName: 'balanceOf',
      args: [address]
    }),
    persona === 'borrower' ? ownedPunks(client, address) : Promise.resolve([] as number[]),
    client.getBalance({address})
  ]);

  return {usdc, punks, eth};
};

/** Gas from the faucet, if this address is low on it. Measured, like everything here. */
const topUp = (cdp: CdpClient, client: Reader) => async (address: Address): Promise<Hash[]> => {
  if ((await client.getBalance({address})) >= GAS_FLOOR) return [];

  const {transactionHash} = await cdp.evm.requestFaucet({address, network: NETWORK, token: 'eth'});

  await client.waitForTransactionReceipt({hash: transactionHash});

  return [transactionHash];
};

/**
 * CDP assigns the nonce, so sends from the one admin account do not race for it —
 * not within a request, and not across the lender's and the borrower's, which the
 * page fires together.
 */
const sendFrom = (cdp: CdpClient, client: Reader, from: Address) => async (to: Address, data: Hex) => {
  const {transactionHash} = await cdp.evm.sendTransaction({
    address: from,
    network: NETWORK,
    transaction: {to, data}
  });

  return client.waitForTransactionReceipt({hash: transactionHash});
};

export const fundPersona = async (address: Address, persona: Persona) => {
  const client = reader();
  const held = await holdingsOf(client, address, persona);

  // Idempotent by measurement. Asking for a funded actor sends nothing, and asking
  // for a short one sends only what it is short of, so neither a held-down button
  // nor a visitor emptying their own actor on purpose drains the account paying.
  if (!isShort(persona, held)) return {sent: [], usdc: held.usdc.toString(), punks: held.punks};

  const short = shortfall(persona, held);
  const {cdp, address: from} = await admin();
  const claim = topUp(cdp, client);
  const send = sendFrom(cdp, client, from);

  // Together: both claims come out of CDP's faucet, so neither waits on the other.
  const claims = (await Promise.all([claim(address), claim(from)])).flat();

  // Both sides, not just the lender: the borrower receives the principal from the
  // loan itself, which is short of the repayment by exactly the interest.
  const usdcMints =
    short.usdc > 0n
      ? [
          send(
            usdcAddress[chain.id],
            encodeFunctionData({abi: usdcAbi, functionName: 'mint', args: [address, short.usdc]})
          )
        ]
      : [];

  const punkMints = Array.from({length: short.punks}, () =>
    send(
      cryptoPunksAddress[chain.id],
      encodeFunctionData({abi: cryptoPunksAbi, functionName: 'mintRandom', args: [address]})
    )
  );

  const [usdcReceipts, punkReceipts] = await Promise.all([Promise.all(usdcMints), Promise.all(punkMints)]);

  // `mintRandom` picks the id on chain, so which punk lands is only knowable from
  // the receipt: read it off the Transfer event rather than guessing.
  const minted = parseEventLogs({
    abi: cryptoPunksAbi,
    eventName: 'Transfer',
    logs: punkReceipts.flatMap((receipt) => receipt.logs)
  }).map((log) => Number(log.args.tokenId));

  return {
    sent: [...claims, ...[...usdcReceipts, ...punkReceipts].map((receipt) => receipt.transactionHash)],
    usdc: (held.usdc + short.usdc).toString(),
    punks: [...held.punks, ...minted]
  };
};

/**
 * Whether the faucet can still do its job, for a scheduled check to ask.
 *
 * Each of these fails quietly from the inside: revoked credentials only surface on
 * a visitor's first click, a refused faucet drains the admin a mint at a time, and
 * the collection runs out a pair of punks per borrower.
 */
export const health = async () => {
  const client = reader();
  const cdp = await cdpClient();
  const collection = {abi: cryptoPunksAbi, address: cryptoPunksAddress[chain.id]} as const;

  const [account, size, minted] = await Promise.all([
    cdp.evm.getAccount({name: ADMIN_ACCOUNT}),
    client.readContract({...collection, functionName: 'collectionSize'}),
    client.readContract({...collection, functionName: 'totalSupply'})
  ]);

  const gas = await client.getBalance({address: account.address});
  const punksLeft = size - minted;

  const problems = [
    gas < ADMIN_RESERVE
      ? `The admin account is down to ${formatEther(gas)} ETH: CDP's faucet may be refusing claims.`
      : null,
    punksLeft < PUNKS_RESERVE ? `Only ${punksLeft} punks are left to mint.` : null
  ].filter((problem) => problem !== null);

  return {
    ok: problems.length === 0,
    problems,
    admin: account.address,
    gas: formatEther(gas),
    punksLeft: Number(punksLeft)
  };
};
