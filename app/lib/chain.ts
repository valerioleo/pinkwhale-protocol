/**
 * Which chain the playground runs against.
 *
 * Addresses and ABIs are deliberately not here: they come from `lib/generated.ts`,
 * which `@deployoor/wagmi` writes out of the deployment records, keyed by chain id.
 */
import {createPublicClient, http} from 'viem';
import {baseSepolia} from 'viem/chains';

export const chain = baseSepolia;

/** USDC is six decimals here, like the token it stands in for. */
export const USDC_DECIMALS = 6;

/**
 * The CDP node, straight from the browser. The key in that URL is a *client* key:
 * CDP issues it for exactly this, and restricts it by the domain allowlist rather
 * than by keeping it secret. Proxying it would buy nothing.
 */
export const publicClient = createPublicClient({
  chain,
  transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL)
});

/**
 * The widest `eth_getLogs` window the node will accept. Past it the request is
 * rejected outright — "query exceeds max block range 100000" — rather than
 * truncated, so an over-wide query returns nothing at all.
 */
const MAX_LOG_RANGE = 100_000n;

/**
 * A block range split into windows the node will serve.
 *
 * Base Sepolia mints a block every two seconds, which puts 100,000 blocks a little
 * over two days apart. A single-window query written against a fresh deployment
 * therefore works on the day it is written and fails later the same week, having
 * changed nothing — and because the failure is an error rather than a short list,
 * what it looks like from the UI is a load that never finishes.
 */
export const logWindows = (fromBlock: bigint, toBlock: bigint) =>
  Array.from({length: Number((toBlock - fromBlock) / MAX_LOG_RANGE) + 1}, (_, index) => {
    const start = fromBlock + BigInt(index) * MAX_LOG_RANGE;
    const end = start + MAX_LOG_RANGE - 1n;

    return {fromBlock: start, toBlock: end < toBlock ? end : toBlock};
  });
