/**
 * Every viem client in the repo, and the only place a chain, an RPC URL or a key
 * is resolved. Scripts import `publicClient` and `getAdminWallet()`; none of them
 * construct a transport or read an env var of their own.
 */
import 'dotenv/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Chain,
  type Hex,
  type LocalAccount,
  type PublicClient,
  type Transport,
  type WalletClient
} from 'viem';
import {privateKeyToAccount, toAccount} from 'viem/accounts';
import {anvil, baseSepolia, mainnet, sepolia} from 'viem/chains';

import {ADMIN_ACCOUNT} from './lib/admin';

export type WalletWithAccount = WalletClient & {account: LocalAccount};

export type NetworkName = 'anvil' | 'sepolia' | 'base-sepolia' | 'mainnet-fork';

type NetworkConfig = {
  chain: Chain;
  rpcEnvVar: string;
  /** Live networks lend against real collections; local ones need mocks to exist. */
  deployMocks: boolean;
  /** Anvil signs with a raw key. Everything else goes through the CDP server account. */
  signsLocally: boolean;
};

export const NETWORKS: Record<NetworkName, NetworkConfig> = {
  anvil: {chain: anvil, rpcEnvVar: 'ANVIL_RPC_URL', deployMocks: true, signsLocally: true},
  sepolia: {chain: sepolia, rpcEnvVar: 'SEPOLIA_RPC_URL', deployMocks: true, signsLocally: false},
  'base-sepolia': {
    chain: baseSepolia,
    rpcEnvVar: 'BASE_SEPOLIA_RPC_URL',
    deployMocks: true,
    signsLocally: false
  },
  // A mainnet fork served by `anvil --fork-url`: mainnet chain data, local money.
  'mainnet-fork': {chain: mainnet, rpcEnvVar: 'ANVIL_RPC_URL', deployMocks: false, signsLocally: true}
};

const required = (name: string): string => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);

  return value;
};

/** `--network base-sepolia`, or NETWORK in the environment. Anvil by default. */
export const getNetwork = (): NetworkName => {
  const flagIndex = process.argv.indexOf('--network');
  const name = (flagIndex === -1 ? process.env.NETWORK : process.argv[flagIndex + 1]) ?? 'anvil';

  if (!(name in NETWORKS)) {
    throw new Error(`Unknown network "${name}". Expected one of: ${Object.keys(NETWORKS).join(', ')}`);
  }

  return name as NetworkName;
};

export const network = getNetwork();

export const {chain, deployMocks} = NETWORKS[network];

export const transport: Transport = http(required(NETWORKS[network].rpcEnvVar));

export const publicClient: PublicClient = createPublicClient({chain, transport});

/** A wallet for a key we hold. Local chains only, where the keys are public knowledge. */
export const localWallet = (key: Hex): WalletWithAccount =>
  createWalletClient({account: privateKeyToAccount(key), chain, transport}) as WalletWithAccount;

/**
 * Live networks sign through a CDP server account, so no deployer key is ever on
 * disk or in CI. Anvil keeps a raw key: its default account is public knowledge and
 * a local chain should not need an account with a vendor.
 */
const resolveAdminAccount = async (): Promise<LocalAccount> => {
  if (NETWORKS[network].signsLocally) {
    return privateKeyToAccount(required('DEPLOYER_PRIVATE_KEY') as Hex);
  }

  const {CdpClient} = await import('@coinbase/cdp-sdk');

  const cdp = new CdpClient({
    apiKeyId: required('CDP_API_KEY_ID'),
    apiKeySecret: required('CDP_API_KEY_SECRET'),
    walletSecret: required('CDP_WALLET_SECRET')
  });

  return toAccount(await cdp.evm.getOrCreateAccount({name: ADMIN_ACCOUNT}));
};

let cachedAdminWallet: WalletWithAccount | null = null;

/** The account that deploys, and that the faucet mints from. */
export const getAdminWallet = async (): Promise<WalletWithAccount> => {
  cachedAdminWallet ??= createWalletClient({
    account: await resolveAdminAccount(),
    chain,
    transport
  }) as WalletWithAccount;

  return cachedAdminWallet;
};

/** The pair every generated deployer takes. */
export const getDeployClients = async () => ({
  walletClient: await getAdminWallet(),
  publicClient
});
