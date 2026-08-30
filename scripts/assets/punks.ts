/**
 * The CryptoPunks composite: all ten thousand punks in one 2400x2400 image, laid
 * out as a 100-wide grid of 24x24 cells.
 *
 * `imageHash` on the CryptoPunks contract is the sha256 of exactly these bytes,
 * which is why this is the right artifact to serve rather than a shortcut around
 * the art: the collection vouches for the file on chain. `pnpm verify:punks`
 * re-checks the copy in `docs/public` against that hash.
 *
 * Punk N sits at row floor(N / 100), column N % 100.
 */
export const PUNKS_IMAGE_SHA256 = 'ac39af4793119ee46bbff351d8cb6b5f23da60222126add4268e261199a2921b';

export const PUNKS_CONTRACT = '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB';

export const PUNKS_SOURCE = 'https://raw.githubusercontent.com/larvalabs/cryptopunks/master/punks.png';

export const GRID_COLUMNS = 100;

export const PUNK_SIZE = 24;

export const COLLECTION_SIZE = 10_000;

/** Top-left pixel of punk `id` inside the composite. */
export const punkCell = (id: number) => ({
  x: (id % GRID_COLUMNS) * PUNK_SIZE,
  y: Math.floor(id / GRID_COLUMNS) * PUNK_SIZE
});

/**
 * A CSS sprite, which is all the frontend needs: no crop endpoint, no per-token
 * asset, no object store. `scale` stays a whole number so the pixels stay square.
 */
export const punkSpriteStyle = (id: number, scale = 4) => {
  const {x, y} = punkCell(id);

  return {
    width: `${PUNK_SIZE * scale}px`,
    height: `${PUNK_SIZE * scale}px`,
    backgroundImage: 'url(/punks.png)',
    backgroundPosition: `-${x * scale}px -${y * scale}px`,
    backgroundSize: `${GRID_COLUMNS * PUNK_SIZE * scale}px`,
    imageRendering: 'pixelated' as const
  };
};
