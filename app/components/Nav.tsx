import Link from 'next/link';

/**
 * The whole of the site's navigation. Three pages and a demo do not need a
 * sidebar, and the article reads better without one competing for the width.
 *
 * The playground is an anchor rather than a route because it is part of the
 * article — the link scrolls to the bottom of the page it is already on when you
 * are reading, and lands there from anywhere else.
 */
const LINKS = [
  {label: 'Article', href: '/'},
  {label: 'Reference', href: '/reference'},
  {label: 'Run it', href: '/run'},
  {label: 'Playground', href: '/#playground'}
] as const;

export const Nav = () => (
  <nav className="nav">
    <Link className="nav-mark" href="/">
      Pinkwhale
    </Link>

    <ul className="nav-links">
      {LINKS.map(({label, href}) => (
        <li key={href}>
          <Link href={href}>{label}</Link>
        </li>
      ))}
      <li className="nav-away">
        <a href="https://valeriohq.com" target="_blank" rel="noreferrer">
          valeriohq.com ↗
        </a>
      </li>
    </ul>
  </nav>
);
