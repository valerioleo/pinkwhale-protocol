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

/**
 * A punk as a background, at whatever pixel size the caller needs.
 *
 * The sheet's cells are 24px, so the offsets have to be scaled by the same factor
 * as the artwork — otherwise the punk shows up cropped and off by a fraction of a
 * neighbour. Shared so a punk is the same size wherever it appears.
 */
const ICON_SIZE = 22;

export const punkIconStyle = (id: number, size = ICON_SIZE) => {
  const scale = size / PUNK_SIZE;
  const {x, y} = punkCell(id);

  return {
    width: size,
    height: size,
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${GRID_COLUMNS * PUNK_SIZE * scale}px`
  };
};
