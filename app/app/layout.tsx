import type {Metadata} from 'next';

import './globals.css';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: 'Pinkwhale playground',
  description: 'Open, repay and default on a loan built entirely out of Seaport orders.'
};

export default function RootLayout({children}: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
