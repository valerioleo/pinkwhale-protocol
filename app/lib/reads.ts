import {createPublicClient, http} from 'viem';
import {baseSepolia} from 'viem/chains';

import {pinkwhale, punks, usdc} from './deployment';

/**
 * Server-side reads talk to CDP directly; only the browser goes through
 * `/api/rpc`, and only because the URL carries a token.
 */
const serverClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.BASE_SEPOLIA_RPC_URL)
});

export const readDeployment = async () => {
  const [seaportAddress, usdcSymbol, usdcDecimals, punkName, collectionSize] = await Promise.all([
    serverClient.readContract({...pinkwhale, functionName: 'seaport'}),
    serverClient.readContract({...usdc, functionName: 'symbol'}),
    serverClient.readContract({...usdc, functionName: 'decimals'}),
    serverClient.readContract({...punks, functionName: 'name'}),
    serverClient.readContract({...punks, functionName: 'collectionSize'})
  ]);

  return {
    seaport: seaportAddress as string,
    usdcSymbol: usdcSymbol as string,
    usdcDecimals: usdcDecimals as number,
    punkName: punkName as string,
    collectionSize: collectionSize as bigint
  };
};
