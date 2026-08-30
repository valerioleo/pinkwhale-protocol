import {defineConfig} from 'deployoor';

export default defineConfig({
  // Detected from foundry.toml: artifacts land in `out/`.
  out: './deployers', // generated deployers — commit them
  deploymentsPath: './deployments', // the deployment record — commit it

  // `out/` also holds every Seaport internal and forge-std helper. Only these are ours
  // to deploy; the mock tokens exist so a chain has something to lend against, and
  // Seaport 1.6 is deployed alongside on anvil (on live networks we `register` the
  // canonical instance instead — see scripts/deploy/seaport.ts).
  //
  // ERC1155Token is deliberately absent: the protocol supports 1155 collateral and
  // the Foundry suites prove it, but nothing deploys one, so nothing needs a deployer.
  include: [
    'Pinkwhale',
    'Seaport16',
    'ConduitController16',
    'ERC20Token',
    'ERC721Token'
  ],

  plugins: [],

  // Bytecode-driven idempotency: redeploy only when the deploy identity moves
  // (runtime bytecode + constructor args), reuse the record otherwise. Every
  // redeploy appends to the record's history rather than overwriting it.
  redeploymentStrategy: 'on-change'
});
