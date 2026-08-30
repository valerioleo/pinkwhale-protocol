import {getOrDeployPinkwhale} from '../../deployers/index.js';
import {getDeployClients} from '../clients.js';
import {resolveSeaport} from './seaport.js';

/** Pinkwhale, pointed at whichever Seaport this chain has. */
export const deployPinkwhale = async () => {
  const seaportAddress = await resolveSeaport();

  const {contract, freshDeploy} = await getOrDeployPinkwhale({
    ...(await getDeployClients()),
    args: [seaportAddress]
  });

  return {contract, freshDeploy, seaportAddress};
};
