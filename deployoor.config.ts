import {defineConfig} from 'deployoor';

export default defineConfig({
  // Detected from foundry.toml: artifacts land in `out/`.
  out: './deployers', // generated deployers — commit them
  deploymentsPath: './deployments', // the deployment record — commit it

  // `out/` also holds every Seaport internal and forge-std helper. Only these five
  // are ours to deploy; the mock tokens exist so a local anvil has something to lend
  // against, and Seaport 1.6 is deployed alongside on anvil (on live networks we
  // `register` the canonical instance instead — see scripts/deploy.ts).
  include: [
    'Pinkwhale',
    'Seaport16',
    'ConduitController16',
    'ERC20Token',
    'ERC721Token',
    'ERC1155Token'
  ],

  plugins: [],

  // Bytecode-driven idempotency: redeploy only when the deploy identity moves
  // (runtime bytecode + constructor args), reuse the record otherwise. Every
  // redeploy appends to the record's history rather than overwriting it.
  redeploymentStrategy: 'on-change'
});
