'use client';

import type {ReactNode} from 'react';

import {ICON_SIZE, punkIconStyle} from '../lib/punks';

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
      <img className="pill-icon" src="/usdc.png" alt="" width={ICON_SIZE} height={ICON_SIZE} />
    ) : (
      <span className="pill-icon pill-icon--punk" style={punkIconStyle(punk)} />
    )}
    {children}
  </span>
);
