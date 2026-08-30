/**
 * Which chain the playground runs against, and the bits of it worth naming.
 *
 * Addresses and ABIs are not here on purpose: they come from `lib/generated.ts`,
 * which `@deployoor/wagmi` writes out of the deployment records. Everything is
 * keyed by chain id, so pointing the app at anvil instead is a one-line change.
 */
import {baseSepolia} from 'viem/chains';

export const chain = baseSepolia;

export const CHAIN_ID = baseSepolia.id;

/** USDC is six decimals here, like the token it stands in for. */
export const USDC_DECIMALS = 6;
