/**
 * What a visitor is handed so they can open a loan.
 *
 * Mints run from the Privy server wallet that also deploys, so nothing here needs
 * a key on disk. The ETH drip is the one piece that cannot be sponsored: CDP
 * sponsors 7702 delegations on mainnet but not on testnets, so the first
 * transaction from a fresh persona has to be paid for the ordinary way.
 */
import {createPublicClient, createWalletClient, http, parseEther, type Address} from 'viem';

import {chain} from '../chain';
import {FAUCET_USDC, PUNKS_PER_BORROWER, isShort} from '../faucet';
import {cryptoPunksAbi, cryptoPunksAddress, usdcAbi, usdcAddress} from '../generated';

/** Enough to sign a 7702 delegation on a chain where gas is free anyway. */
const GAS_DRIP = parseEther('0.0002');

export type Persona = 'lender' | 'borrower';

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}`);

  return value;
};

const transport = () => http(required('BASE_SEPOLIA_RPC_URL'));

const adminWallet = async () => {
  const {PrivyClient} = await import('@privy-io/node');
  const {createViemAccount} = await import('@privy-io/node/viem');

  const privy = new PrivyClient({
    appId: required('PRIVY_APP_ID'),
    appSecret: required('PRIVY_APP_SECRET')
  });

  const account = await createViemAccount(privy, {
    walletId: required('PRIVY_ADMIN_WALLET_ID'),
    address: required('PRIVY_ADMIN_WALLET_ADDRESS') as Address
  });

  return createWalletClient({account, chain, transport: transport()});
};

/**
 * The collection is enumerable, so ownership is a read rather than a replay of
 * Transfer logs over a block range that only ever grows.
 */
const ownedPunks = async (owner: Address): Promise<number[]> => {
  const client = createPublicClient({chain, transport: transport()});
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
  const client = createPublicClient({chain, transport: transport()});

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

/**
 * @dev Sequential, not `Promise.all`. Every one of these is signed by the same
 *      account, so concurrent sends read the same nonce and all but the first are
 *      rejected — the same trap the deploy script hit.
 */
export const fundPersona = async (address: Address, persona: Persona, force = false) => {
  const publicClient = createPublicClient({chain, transport: transport()});

  // Idempotent on purpose. Without this every click mints again, and since the
  // mints are paid for by one shared wallet, a held-down button is a drain.
  // `force` is the visitor asking for more, which is a different question from
  // 'has this address been set up', and only the second one is automatic.
  const alreadyFunded = force ? null : await hasBeenFunded(address, persona);

  if (alreadyFunded) return {sent: [], ...alreadyFunded};

  const wallet = await adminWallet();
  const from = {account: wallet.account, chain};
  const sent: `0x${string}`[] = [];

  const drip = await wallet.sendTransaction({...from, to: address, value: GAS_DRIP});
  sent.push(drip);
  await publicClient.waitForTransactionReceipt({hash: drip});

  // Both sides, not just the lender: the borrower receives the principal from the
  // loan itself, which is short of the repayment by exactly the interest.
  const mint = await wallet.writeContract({
    ...from,
    abi: usdcAbi,
    address: usdcAddress[chain.id],
    functionName: 'mint',
    args: [address, FAUCET_USDC]
  });

  sent.push(mint);
  await publicClient.waitForTransactionReceipt({hash: mint});

  if (persona === 'lender') return {sent, usdc: FAUCET_USDC.toString(), punks: [] as number[]};

  // `mintRandom` picks the id on chain, so which punk lands is only knowable from
  // the receipt: read it off the Transfer topic rather than guessing.
  const punks = await Array.from({length: PUNKS_PER_BORROWER}).reduce<Promise<number[]>>(
    async (previous) => {
      const ids = await previous;

      const hash = await wallet.writeContract({
        ...from,
        abi: cryptoPunksAbi,
        address: cryptoPunksAddress[chain.id],
        functionName: 'mintRandom',
        args: [address]
      });

      sent.push(hash);
      const receipt = await publicClient.waitForTransactionReceipt({hash});
      const transfer = receipt.logs.find((log) => log.topics.length === 4);

      return [...ids, Number(BigInt(transfer!.topics[3]!))];
    },
    Promise.resolve([])
  );

  return {sent, usdc: FAUCET_USDC.toString(), punks};
};
