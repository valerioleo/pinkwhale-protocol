'use client';

import {punkIconStyle} from '../lib/punks';

/**
 * Overlapping punks, the way a row of avatars usually reads: a count you can see
 * at a glance without the row growing without bound.
 */
export const PunkStack = ({
  ids,
  max = 5,
  size = 22
}: {
  ids: number[];
  max?: number;
  size?: number;
}) => {
  if (ids.length === 0) return <span className="stack-empty">none</span>;

  const shown = ids.slice(0, max);
  return (
    <span className="stack-icons">
      {shown.map((id, index) => (
        <span key={id} className="stack-icon" style={{zIndex: shown.length - index}}>
          <span className="pill-icon pill-icon--punk" style={punkIconStyle(id, size)} />
        </span>
      ))}

    </span>
  );
};
