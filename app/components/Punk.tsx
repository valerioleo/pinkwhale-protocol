/**
 * A punk, cropped out of the composite grid.
 *
 * There is no per-token image anywhere: CryptoPunks ships as one 2400x2400 sheet
 * whose sha256 the real contract commits to on chain, so cell N *is* punk N's art.
 * That makes this a background-position and nothing else — no crop endpoint, no
 * object store, no IPFS gateway to be blocked by somebody's ISP.
 */
import {punkCell, GRID_COLUMNS, PUNK_SIZE} from '../lib/punks';

export const Punk = ({id, scale = 3}: {id: number; scale?: number}) => {
  const {x, y} = punkCell(id);

  return (
    <span
      className="punk"
      role="img"
      aria-label={`CryptoPunk #${id}`}
      style={{
        width: PUNK_SIZE * scale,
        height: PUNK_SIZE * scale,
        backgroundPosition: `-${x * scale}px -${y * scale}px`,
        backgroundSize: `${GRID_COLUMNS * PUNK_SIZE * scale}px`
      }}
    />
  );
};
