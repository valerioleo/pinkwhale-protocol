/**
 * Deploy Pinkwhale.
 *
 *   pnpm deploy:anvil         # local anvil, deploys its own Seaport + mock tokens
 *   pnpm deploy:sepolia       # sepolia, registers the canonical Seaport 1.6
 *   pnpm deploy:base-sepolia  # what the live playground runs against
 *
 * Everything lands in `deployments/<chainId>-<network>/<Contract>.json`. Re-running
 * is a no-op: `getOrDeploy*` returns the recorded contract without sending a tx.
 */
import 'dotenv/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Chain,
  type LocalAccount
} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {anvil, baseSepolia, mainnet, sepolia} from 'viem/chains';

import {
  getOrDeployConduitController16,
  getOrDeployERC1155Token,
  getOrDeployERC20Token,
  getOrDeployERC721Token,
  getOrDeployPinkwhale,
  getOrDeploySeaport16,
  register
} from '../deployers/index.js';
// The same ABI Foundry compiled and the tests ran against, not hand-copied JSON.
import {seaport16Artifact} from '../deployers/types/Seaport16.js';
import {erc20Args, erc721Args, erc1155Args} from './lib/tokens.ts';

/**
 * Seaport 1.6 ships at the same address on every chain it is deployed to. Where it
 * already exists we record it rather than deploying a second copy, because Pinkwhale
 * must point at the marketplace real orders live on rather than one of our own.
 */
const CANONICAL_SEAPORT: Address = '0x0000000000000068F116a894984e2DB1123eB395';

type NetworkName = 'anvil' | 'sepolia' | 'base-sepolia' | 'mainnet-fork';

const NETWORKS: Record<NetworkName, {chain: Chain; rpcEnvVar: string; deployMocks: boolean}> = {
  anvil: {chain: anvil, rpcEnvVar: 'ANVIL_RPC_URL', deployMocks: true},
  sepolia: {chain: sepolia, rpcEnvVar: 'SEPOLIA_RPC_URL', deployMocks: true},
  'base-sepolia': {chain: baseSepolia, rpcEnvVar: 'BASE_SEPOLIA_RPC_URL', deployMocks: true},
  // A mainnet fork served by `anvil --fork-url`: mainnet chain data, local money.
  'mainnet-fork': {chain: mainnet, rpcEnvVar: 'ANVIL_RPC_URL', deployMocks: false}
};

function parseNetwork(): NetworkName {
  const flagIndex = process.argv.indexOf('--network');
  const name = (flagIndex === -1 ? process.env.NETWORK : process.argv[flagIndex + 1]) ?? 'anvil';

  if (!(name in NETWORKS)) {
    throw new Error(`Unknown network "${name}". Expected one of: ${Object.keys(NETWORKS).join(', ')}`);
  }

  return name as NetworkName;
}

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Copy .env.example to .env and fill it in.`);
  }

  return value;
}

/**
 * Live networks sign through a Privy server wallet, so no deployer key is ever on
 * disk or in CI. Anvil keeps a raw key: its default account is public knowledge and
 * a local chain should not need an account with a vendor.
 */
async function resolveAccount(network: NetworkName): Promise<LocalAccount> {
  if (network === 'anvil' || network === 'mainnet-fork') {
    return privateKeyToAccount(required('DEPLOYER_PRIVATE_KEY') as `0x${string}`);
  }

  const {PrivyClient} = await import('@privy-io/node');
  const {createViemAccount} = await import('@privy-io/node/viem');

  const privy = new PrivyClient({
    appId: required('PRIVY_APP_ID'),
    appSecret: required('PRIVY_APP_SECRET')
  });

  return createViemAccount(privy, {
    walletId: required('PRIVY_ADMIN_WALLET_ID'),
    address: required('PRIVY_ADMIN_WALLET_ADDRESS') as Address
  });
}

/** The pair of viem clients every generated deployer needs. */
function makeClients(chain: Chain, rpcUrl: string, account: LocalAccount) {
  const transport = http(rpcUrl);

  return {
    account,
    walletClient: createWalletClient({account, chain, transport}),
    publicClient: createPublicClient({chain, transport})
  };
}

type Clients = Omit<ReturnType<typeof makeClients>, 'account'>;

/**
 * The faucet's inventory. Two collections from different contracts and two
 * currencies, which is the shape a bundle needs: a loan can be secured by an ape
 * and a penguin and an ERC20 at once.
 */
async function deployMockTokens(clients: Clients, owner: Address): Promise<[string, Address][]> {
  // Sequential, not Promise.all: these share one account, so concurrent deploys
  // all read the same nonce and every one after the first is rejected.
  const usdc = await getOrDeployERC20Token({
    ...clients,
    deploymentName: 'USDC',
    args: erc20Args('USDC', owner)
  });
  const apecoin = await getOrDeployERC20Token({
    ...clients,
    deploymentName: 'ApeCoin',
    args: erc20Args('ApeCoin', owner)
  });
  const apes = await getOrDeployERC721Token({
    ...clients,
    deploymentName: 'BoredApeYachtClub',
    args: erc721Args('BoredApeYachtClub')
  });
  const penguins = await getOrDeployERC721Token({
    ...clients,
    deploymentName: 'PudgyPenguins',
    args: erc721Args('PudgyPenguins')
  });
  const editions = await getOrDeployERC1155Token({
    ...clients,
    deploymentName: 'Editions',
    args: erc1155Args()
  });

  return [
    ['USDC', usdc.contract.address],
    ['ApeCoin', apecoin.contract.address],
    ['BoredApeYachtClub', apes.contract.address],
    ['PudgyPenguins', penguins.contract.address],
    ['Editions', editions.contract.address]
  ];
}

async function main() {
  const network = parseNetwork();
  const {chain, rpcEnvVar, deployMocks} = NETWORKS[network];

  const {account, ...clients} = makeClients(chain, required(rpcEnvVar), await resolveAccount(network));

  console.log(`\nDeploying to ${network} (chain ${chain.id}) as ${account.address}\n`);

  const seaportAddress = await resolveSeaport(network, clients);

  const {contract: pinkwhale, freshDeploy} = await getOrDeployPinkwhale({
    ...clients,
    args: [seaportAddress]
  });

  console.log(`  Pinkwhale           ${pinkwhale.address}${freshDeploy ? '  (new)' : ''}`);

  if (deployMocks) {
    // Something to lend, and several things to lend against. `deploymentName` keys
    // each record separately, so one contract can stand in for two collections.
    const mocks = await deployMockTokens(clients, account.address);

    for (const [label, address] of mocks) {
      console.log(`  ${label.padEnd(20)}${address}`);
    }
  }

  console.log(`\nRecords written to deployments/${chain.id}-*/\n`);
}

/**
 * Use the canonical Seaport when the chain has one; otherwise stand up our own
 * (a bare anvil has neither Seaport nor a ConduitController).
 */
async function resolveSeaport(network: NetworkName, clients: Clients): Promise<Address> {
  const deployedCode = await clients.publicClient.getCode({address: CANONICAL_SEAPORT});

  if (deployedCode && deployedCode !== '0x') {
    const {contract} = await register({
      ...clients,
      name: seaport16Artifact.name,
      deploymentName: 'Seaport16',
      address: CANONICAL_SEAPORT,
      abi: seaport16Artifact.abi
    });

    console.log(`  Seaport 1.6         ${contract.address}  (canonical, registered)`);

    return CANONICAL_SEAPORT;
  }

  console.log(`  no Seaport on ${network}, deploying one`);

  const {contract: conduitController} = await getOrDeployConduitController16({...clients, args: []});
  const {contract: seaport} = await getOrDeploySeaport16({
    ...clients,
    args: [conduitController.address]
  });

  console.log(`  ConduitController16 ${conduitController.address}`);
  console.log(`  Seaport16           ${seaport.address}`);

  // A locally deployed Seaport lands at a different address from the canonical one;
  // that is expected, and the record in deployments/ is the source of truth.
  return seaport.address;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
