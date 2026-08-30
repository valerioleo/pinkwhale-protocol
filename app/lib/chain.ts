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
