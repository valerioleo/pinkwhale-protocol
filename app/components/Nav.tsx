"use client";

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {PinkwhaleMark} from './article/icons';

export function Nav() {
  const pathname = usePathname();
  return <nav className="nav" aria-label="Main navigation">
    <div className="nav-inner">
      <Link className="nav-mark" href="/" aria-label="Pinkwhale home"><PinkwhaleMark /><span>Pinkwhale<span className="nav-descriptor"> / a research note</span></span></Link>
      <div className="nav-links">
        <Link href="/essay" aria-current={pathname === '/essay' ? 'page' : undefined}>Essay</Link>
        <Link href="/reference" aria-current={pathname === '/reference' ? 'page' : undefined}>Reference</Link>
        <a className="nav-source" href="https://github.com/valerioleo/pinkwhale-protocol">Source <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </nav>;
}
