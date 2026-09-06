import type {Metadata} from 'next';
import type {ReactNode} from 'react';

import './globals.css';
import './prose.css';
import '../components/article/pinkwhale.css';
import {Nav} from '../components/Nav';
import {fontMono, fontSans, fontSerif} from '../lib/fonts';
import {Providers} from './providers';

const BASE_URL = 'https://pinkwhale.valeriohq.com';

/**
 * Site-wide defaults. Each page's own title and description come from its
 * frontmatter, which `remark-mdx-frontmatter` exports under the name Next already
 * reads — so a page only appears here if it has nothing of its own to say.
 *
 * The `?v=` on the card is deliberate. X retired its card validator in 2022, so
 * there is no way left to purge a stale preview by hand; a new URL at least
 * guarantees a scraper fetches new bytes when it next reads the page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {default: 'Pinkwhale', template: '%s · Pinkwhale'},
  description: 'An NFT lending protocol built entirely out of Seaport orders.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Pinkwhale',
    images: [
      {
        url: '/og.png?v=2',
        width: 1200,
        height: 630,
        type: 'image/png',
        // Read out by screen readers on X and Slack, so it describes the card
        // rather than the page — the description already covers the page.
        alt: 'The Pinkwhale loan lifecycle: a repayment order and a default order, separated by one second.'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    site: '@valeriohq',
    creator: '@valeriohq'
  },
  icons: {
    icon: [
      {url: '/icon.svg', type: 'image/svg+xml'},
      {url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon'}
    ],
    apple: [{url: '/apple-touch-icon.png', sizes: '180x180'}]
  }
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
