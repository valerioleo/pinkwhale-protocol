/**
 * Deploy Pinkwhale.
 *
 *   pnpm deploy:anvil         # local anvil, deploys its own Seaport + mock tokens
 *   pnpm deploy:sepolia       # sepolia, registers the canonical Seaport 1.6
 *   pnpm deploy:base-sepolia  # what the live playground runs against
 *
 * Everything lands in `deployments/<chainId>-<network>/<Contract>.json`. Re-running
 * only sends a transaction when a contract's deploy identity moved, because the
 * deployoor config asks for `on-change`.
 */
import {chain, deployMocks, getAdminWallet, network} from '../clients.js';
import {deployPinkwhale} from './pinkwhale.js';
import {deployMockTokens} from './tokens.js';

const main = async () => {
  const admin = await getAdminWallet();

  console.log(`\nDeploying to ${network} (chain ${chain.id}) as ${admin.account.address}\n`);

  const {contract: pinkwhale, freshDeploy} = await deployPinkwhale();

  console.log(`  Pinkwhale           ${pinkwhale.address}${freshDeploy ? '  (new)' : ''}`);

  if (deployMocks) {
    const mocks = await deployMockTokens(admin.account.address);

    mocks.forEach(([label, address]) => console.log(`  ${label.padEnd(20)}${address}`));
  }

  console.log(`\nRecords written to deployments/${chain.id}-*/\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
