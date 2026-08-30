/**
 * Seaport 1.6 ships at the same address on every chain it is deployed to. Where it
 * already exists we record it rather than deploying a second copy, because Pinkwhale
 * must point at the marketplace real orders live on rather than one of our own.
 */
import {getContract, type Address} from 'viem';

import {
  getOrDeployConduitController16,
  getOrDeploySeaport16,
  register
} from '../../deployers/index.js';
// The same ABI Foundry compiled and the tests ran against, not hand-copied JSON.
import {seaport16Artifact} from '../../deployers/types/Seaport16.js';
import {getAdminWallet, getDeployClients, network, publicClient} from '../clients.js';

export const CANONICAL_SEAPORT: Address = '0x0000000000000068F116a894984e2DB1123eB395';

/**
 * Use the canonical Seaport when the chain has one; otherwise stand up our own
 * (a bare anvil has neither Seaport nor a ConduitController).
 */
export const resolveSeaport = async (): Promise<Address> => {
  const clients = await getDeployClients();
  const deployedCode = await publicClient.getCode({address: CANONICAL_SEAPORT});

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
};

/**
 * A writable Seaport handle at whatever address this chain resolved to. Callers
 * override `account` per write, the way the deployoor contract objects do.
 */
export const getSeaportContract = async () => {
  const address = await resolveSeaport();

  return getContract({
    address,
    abi: seaport16Artifact.abi,
    client: {public: publicClient, wallet: await getAdminWallet()}
  });
};
