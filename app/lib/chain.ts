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
  // A range that ends before it starts has nothing in it. A node behind a load
  // balancer can report a head a block or two short of the last one it gave.
  toBlock < fromBlock
    ? []
    : Array.from({length: Number((toBlock - fromBlock) / MAX_LOG_RANGE) + 1}, (_, index) => {
        const start = fromBlock + BigInt(index) * MAX_LOG_RANGE;
        const end = start + MAX_LOG_RANGE - 1n;

        return {fromBlock: start, toBlock: end < toBlock ? end : toBlock};
      });

type LogWindow = ReturnType<typeof logWindows>[number];

/**
 * Requests in flight at once from the visitor's browser. The node meters by work
 * rather than by count, and a wide `eth_getLogs` is heavy work: a few dozen of them
 * together is how it starts answering 'rate limited'.
 */
const AT_ONCE = 4;

const groupsOf = <T>(items: T[]) =>
  Array.from({length: Math.ceil(items.length / AT_ONCE)}, (_, index) =>
    items.slice(index * AT_ONCE, (index + 1) * AT_ONCE)
  );

/** `run` over every item, a few at a time, answers in the items' order. */
export const fewAtATime = <T, R>(items: T[], run: (item: T) => Promise<R>) =>
  groupsOf(items).reduce<Promise<R[]>>(
    async (done, group) => [...(await done), ...(await Promise.all(group.map(run)))],
    Promise.resolve([])
  );

/** Every log in the range. */
export const scanLogs = async <T>(
  fromBlock: bigint,
  toBlock: bigint,
  fetch: (window: LogWindow) => Promise<T[]>
) => (await fewAtATime(logWindows(fromBlock, toBlock), fetch)).flat();

/**
 * The first log in the range, stopping at the window that holds it. What is being
 * looked for usually sits in the first window, so that one is asked alone, and the
 * rest of the range only if it comes back empty.
 */
export const findFirstLog = <T>(
  fromBlock: bigint,
  toBlock: bigint,
  fetch: (window: LogWindow) => Promise<T[]>
) => {
  const search = async ([group, ...rest]: LogWindow[][]): Promise<T | null> => {
    if (!group) return null;

    const [first] = (await Promise.all(group.map(fetch))).flat();

    return first ?? search(rest);
  };

  const [head, ...tail] = logWindows(fromBlock, toBlock);

  return search(head ? [[head], ...groupsOf(tail)] : []);
};

/**
 * The block minted at `timestamp`. An OP Stack chain mints one every `blockTime`
 * without exception, so this is arithmetic from any block already in hand rather
 * than a search.
 */
export const blockAt = (timestamp: bigint, head: {number: bigint; timestamp: bigint}) =>
  head.number - ((head.timestamp - timestamp) * 1000n) / BigInt(chain.blockTime);
