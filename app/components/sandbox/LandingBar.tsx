import Link from 'next/link';
import type {ReactNode} from 'react';

import {Whale} from './marks';

export const REPO_URL = 'https://github.com/valerioleo/pinkwhale-protocol';

/**
 * The bar every page of the new site shares: the mark on the left, which goes
 * home, and on the right the source, then at most one action.
 */
export const LandingBar = ({children}: {children?: ReactNode}) => (
  <header className="ld-bar">
    <div className="ld-bar-inner">
      <Link className="ld-brand" href="/" aria-label="Pinkwhale home">
        <Whale />
        Pinkwhale
      </Link>
      <div className="ld-bar-actions">
        <a className="ld-bar-link" href={REPO_URL}>
          GitHub <span aria-hidden="true">↗</span>
        </a>
        {children}
      </div>
    </div>
  </header>
);
