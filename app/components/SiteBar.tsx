'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

import {REPO_URL} from '../lib/site';
import {Whale} from './sandbox/marks';

/** The pages that make up the docs: the reference, and how to run it yourself. */
const DOCS = ['/reference', '/run'];

/**
 * The one bar every page shares: the mark on the left, which goes home; the docs
 * and the source; and the playground, the one action, as a button.
 */
export const SiteBar = () => {
  const pathname = usePathname();

  return (
    <header className="site-bar">
      <div className="site-bar-inner">
        <Link className="site-brand" href="/" aria-label="Pinkwhale home">
          <Whale />
          Pinkwhale
        </Link>
        <nav className="site-links" aria-label="Main navigation">
          <Link href="/reference" aria-current={DOCS.includes(pathname) ? 'page' : undefined}>
            Docs
          </Link>
          <a href={REPO_URL}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <Link
            className="site-button"
            href="/playground"
            aria-current={pathname === '/playground' ? 'page' : undefined}
          >
            Playground
          </Link>
        </nav>
      </div>
    </header>
  );
};
