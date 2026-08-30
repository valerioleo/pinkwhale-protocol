import type {Metadata} from 'next';
import type {ReactNode} from 'react';

import './globals.css';
import {fontMono, fontSans, fontSerif} from '../lib/fonts';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Pinkwhale playground',
  description: 'Open, repay and default on a loan built entirely out of Seaport orders.'
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en" className={`${fontSerif.variable} ${fontSans.variable} ${fontMono.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
