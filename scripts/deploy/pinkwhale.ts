import {getOrDeployPinkwhale} from '../../deployers/index';
import {getDeployClients} from '../clients';
import {resolveSeaport} from './seaport';

/** Pinkwhale, pointed at whichever Seaport this chain has. */
export const deployPinkwhale = async () => {
  const seaportAddress = await resolveSeaport();

  const {contract, freshDeploy} = await getOrDeployPinkwhale({
    ...(await getDeployClients()),
    args: [seaportAddress]
  });

  return {contract, freshDeploy, seaportAddress};
};
