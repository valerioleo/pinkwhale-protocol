import {IBM_Plex_Mono, Instrument_Sans, Petrona} from 'next/font/google';

/**
 * The same trio as valeriohq: serif to read, sans for the interface, mono for
 * anything the machine says.
 *
 * Petrona reads rather than performs, and it was chosen there for a reason that
 * matters just as much here: its `1` is unmistakable, and this page is full of
 * ids, amounts and hashes.
 */
export const fontSerif = Petrona({
  subsets: ['latin'],
  variable: '--font-petrona',
  display: 'swap',
  style: ['normal', 'italic']
});

export const fontSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap'
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  display: 'swap',
  weight: ['400', '500']
});
