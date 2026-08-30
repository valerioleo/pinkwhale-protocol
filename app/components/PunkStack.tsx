'use client';

import {Punk} from './Punk';

/**
 * Overlapping punks, the way a row of avatars usually reads: a count you can see
 * at a glance without the row growing without bound.
 */
export const PunkStack = ({ids, max = 4}: {ids: number[]; max?: number}) => {
  if (ids.length === 0) return <span className="stack-empty">none</span>;

  const shown = ids.slice(0, max);
  const rest = ids.length - shown.length;

  return (
    <span className="stack">
      <span className="stack-icons">
        {shown.map((id, index) => (
          <span key={id} className="stack-icon" style={{zIndex: shown.length - index}}>
            <Punk id={id} scale={1} />
          </span>
        ))}
        {rest > 0 ? <span className="stack-more">+{rest}</span> : null}
      </span>
      <span className="stack-label">
        {ids.length} CryptoPunk{ids.length === 1 ? '' : 's'}
      </span>
    </span>
  );
};
