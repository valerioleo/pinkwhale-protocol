import {createPublicClient, http} from 'viem';
import {baseSepolia} from 'viem/chains';

/** Reads go through our own route, so the CDP token never reaches the browser. */
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('/api/rpc')
});
