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
  http,
  parseEther,
  parseEventLogs,
  type Address,
  type Hash,
  type Hex
} from 'viem';

import {ADMIN_ACCOUNT} from '../../../scripts/lib/admin';
import {chain} from '../chain';
import {FAUCET_USDC, PUNKS_PER_BORROWER, isShort} from '../faucet';
import {cryptoPunksAbi, cryptoPunksAddress, usdcAbi, usdcAddress} from '../generated';

/** `chain`, in the name CDP knows it by. */
const NETWORK = 'base-sepolia';

/**
 * Below this, claim more from the faucet. A claim is 0.0001 ETH and a match costs
 * about 0.0000023 with its L1 fee, so the floor still covers a few loans and each
 * claim lasts dozens.
 */
const GAS_FLOOR = parseEther('0.00002');

export type Persona = 'lender' | 'borrower';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}`);

  return value;
};

const reader = () => createPublicClient({chain, transport: http(required('BASE_SEPOLIA_RPC_URL'))});

type Reader = ReturnType<typeof reader>;

const admin = async () => {
  const {CdpClient} = await import('@coinbase/cdp-sdk');

  const cdp = new CdpClient({
    apiKeyId: required('CDP_API_KEY_ID'),
    apiKeySecret: required('CDP_API_KEY_SECRET'),
    walletSecret: required('CDP_WALLET_SECRET')
  });

  const {address} = await cdp.evm.getOrCreateAccount({name: ADMIN_ACCOUNT});

  return {cdp, address};
};

/**
 * The collection is enumerable, so ownership is a read rather than a replay of
 * Transfer logs over a block range that only ever grows.
 */
const ownedPunks = async (owner: Address): Promise<number[]> => {
  const client = reader();
  const config = {abi: cryptoPunksAbi, address: cryptoPunksAddress[chain.id]} as const;

  const balance = await client.readContract({...config, functionName: 'balanceOf', args: [owner]});

  const ids = await Promise.all(
    Array.from({length: Number(balance)}, (_, index) =>
      client.readContract({...config, functionName: 'tokenOfOwnerByIndex', args: [owner, BigInt(index)]})
    )
  );

  return ids.map(Number);
};

/**
 * What this actor already holds, or null if it is still short. Balances are the
 * record: there is no database here, and the chain already knows.
 */
const hasBeenFunded = async (address: Address, persona: Persona) => {
  const client = reader();

  const [usdc, punks] = await Promise.all([
    client.readContract({
      abi: usdcAbi,
      address: usdcAddress[chain.id],
      functionName: 'balanceOf',
      args: [address]
    }),
    persona === 'borrower' ? ownedPunks(address) : Promise.resolve([] as number[])
  ]);

  return isShort(persona, {usdc, punks}) ? null : {usdc: usdc.toString(), punks};
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

export const fundPersona = async (address: Address, persona: Persona, force = false) => {
  // Idempotent on purpose. Without this every click mints again, and since the
  // mints are paid for by one shared account, a held-down button is a drain.
  // `force` is the visitor asking for more, which is a different question from
  // 'has this address been set up', and only the second one is automatic.
  const alreadyFunded = force ? null : await hasBeenFunded(address, persona);

  if (alreadyFunded) return {sent: [], ...alreadyFunded};

  const client = reader();
  const {cdp, address: from} = await admin();
  const claim = topUp(cdp, client);
  const send = sendFrom(cdp, client, from);

  // Together: both claims come out of CDP's faucet, so neither waits on the other.
  const claims = (await Promise.all([claim(address), claim(from)])).flat();

  // Both sides, not just the lender: the borrower receives the principal from the
  // loan itself, which is short of the repayment by exactly the interest.
  const usdc = send(
    usdcAddress[chain.id],
    encodeFunctionData({abi: usdcAbi, functionName: 'mint', args: [address, FAUCET_USDC]})
  );

  const punkMints = Array.from({length: persona === 'borrower' ? PUNKS_PER_BORROWER : 0}, () =>
    send(
      cryptoPunksAddress[chain.id],
      encodeFunctionData({abi: cryptoPunksAbi, functionName: 'mintRandom', args: [address]})
    )
  );

  const [usdcReceipt, ...punkReceipts] = await Promise.all([usdc, ...punkMints]);

  // `mintRandom` picks the id on chain, so which punk lands is only knowable from
  // the receipt: read it off the Transfer event rather than guessing.
  const punks = parseEventLogs({
    abi: cryptoPunksAbi,
    eventName: 'Transfer',
    logs: punkReceipts.flatMap((receipt) => receipt.logs)
  }).map((log) => Number(log.args.tokenId));

  return {
    sent: [...claims, usdcReceipt.transactionHash, ...punkReceipts.map((receipt) => receipt.transactionHash)],
    usdc: FAUCET_USDC.toString(),
    punks
  };
};
