'use client';

import './pinkwhale.css';

import {TokenIcon, type TokenKind} from './icons.js';

/**
 * An inline token chip for use in prose, so "offers the ape back" can show the
 * actual ape and the actual currency.
 */
export const Pill = ({token, children}: {token: TokenKind; children: React.ReactNode}) => (
  <span className="pw-inline-pill">
    <TokenIcon kind={token} />
    {children}
  </span>
);
