import {createPublicClient, http} from 'viem';

import {chain, CHAIN_ID} from './chain';
import {
  cryptoPunksAbi,
  cryptoPunksAddress,
  pinkwhaleAbi,
  pinkwhaleAddress,
  usdcAbi,
  usdcAddress
} from './generated';

/**
 * Server-side reads talk to CDP directly; only the browser goes through
 * `/api/rpc`, and only because that URL carries a token.
 */
const serverClient = createPublicClient({chain, transport: http(process.env.BASE_SEPOLIA_RPC_URL)});

/**
 * Spread rather than a helper: viem infers each return type from the ABI's literal
 * type, and anything that widens `abi` on the way through loses that.
 */
export const readDeployment = async () => {
  const [seaport, usdcSymbol, usdcDecimals, punkName, collectionSize] = await Promise.all([
    serverClient.readContract({
      abi: pinkwhaleAbi,
      address: pinkwhaleAddress[CHAIN_ID],
      functionName: 'seaport'
    }),
    serverClient.readContract({abi: usdcAbi, address: usdcAddress[CHAIN_ID], functionName: 'symbol'}),
    serverClient.readContract({abi: usdcAbi, address: usdcAddress[CHAIN_ID], functionName: 'decimals'}),
    serverClient.readContract({
      abi: cryptoPunksAbi,
      address: cryptoPunksAddress[CHAIN_ID],
      functionName: 'name'
    }),
    serverClient.readContract({
      abi: cryptoPunksAbi,
      address: cryptoPunksAddress[CHAIN_ID],
      functionName: 'collectionSize'
    })
  ]);

  return {seaport, usdcSymbol, usdcDecimals, punkName, collectionSize};
};
