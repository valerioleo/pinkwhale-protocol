/**
 * The faucet's inventory, in one place.
 *
 * `deploy.ts` and `demo.ts` both stand these up, and deployoor keys a deployment
 * record on its constructor args — so if the two scripts disagree about a single
 * string, running one supersedes the other's record and the addresses move under
 * whatever is already pointing at them.
 */

/**
 * Where `tokenURI` points. The playground serves `/api/nft/<collection>/<id>`,
 * which proxies the real collection's metadata, so a minted id resolves to that
 * collection's own art rather than to a placeholder.
 */
export const metadataBase = process.env.METADATA_BASE_URL ?? 'http://localhost:3000/api/nft';

/** name, symbol, decimals. Six for USDC, matching the token it stands in for. */
export const CURRENCIES = {
  USDC: ['USD Coin', 'USDC', 6],
  ApeCoin: ['ApeCoin', 'APE', 18]
} as const satisfies Record<string, readonly [string, string, number]>;

/** name, symbol, metadata slug, collection size. Sizes match the real collections. */
export const COLLECTIONS = {
  BoredApeYachtClub: ['Bored Ape Yacht Club', 'BAYC', 'apes', 10_000n],
  PudgyPenguins: ['Pudgy Penguins', 'PPG', 'penguins', 8_888n]
} as const satisfies Record<string, readonly [string, string, string, bigint]>;

export const erc20Args = (key: keyof typeof CURRENCIES, owner: `0x${string}`) => {
  const [name, symbol, decimals] = CURRENCIES[key];
  return [name, symbol, decimals, 0n, owner] as const;
};

export const erc721Args = (key: keyof typeof COLLECTIONS) => {
  const [name, symbol, slug, size] = COLLECTIONS[key];
  return [name, symbol, `${metadataBase}/${slug}/`, size] as const;
};

export const erc1155Args = () => [`${metadataBase}/editions/`] as const;
