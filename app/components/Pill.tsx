'use client';

import type {ReactNode} from 'react';

import {punkCell, GRID_COLUMNS, PUNK_SIZE} from '../lib/punks';

/**
 * The icon is a fixed pixel size, not an em: the sheet's cells are 24px, so the
 * offsets have to be scaled by the same factor as the artwork or the punk shows
 * up cropped and off by a fraction of a neighbour.
 */
const ICON = 20;

const SCALE = ICON / PUNK_SIZE;

/**
 * The inline token chip from the article, so an amount in the playground looks
 * like the same thing the article was describing.
 *
 * USDC is an image; a punk is a cell of the composite, so the icon is either an
 * `img` or a positioned background depending on which it is.
 */
export const Pill = ({
  token,
  punk,
  children
}: {
  token?: 'usdc';
  punk?: number;
  children: ReactNode;
}) => (
  <span className="pill">
    {punk === undefined ? (
      <img className="pill-icon" src="/usdc.png" alt="" width={20} height={20} />
    ) : (
      <span
        className="pill-icon pill-icon--punk"
        style={{
          width: ICON,
          height: ICON,
          backgroundPosition: `-${punkCell(punk).x * SCALE}px -${punkCell(punk).y * SCALE}px`,
          backgroundSize: `${GRID_COLUMNS * PUNK_SIZE * SCALE}px`
        }}
      />
    )}
    {children}
  </span>
);
