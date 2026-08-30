/**
 * Grid maths for the CryptoPunks composite. Kept in step with
 * `scripts/assets/punks.ts`, which `pnpm verify:punks` checks against the hash the
 * real contract holds; these are the two constants the browser needs.
 */
export const GRID_COLUMNS = 100;

export const PUNK_SIZE = 24;

export const COLLECTION_SIZE = 10_000;

/** Top-left pixel of punk `id` inside the sheet. */
export const punkCell = (id: number) => ({
  x: (id % GRID_COLUMNS) * PUNK_SIZE,
  y: Math.floor(id / GRID_COLUMNS) * PUNK_SIZE
});
