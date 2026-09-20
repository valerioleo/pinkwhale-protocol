import {Geist, Geist_Mono, IBM_Plex_Mono, Instrument_Sans, Petrona} from 'next/font/google';

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

/**
 * Geist, for the sandbox only.
 *
 * The article is set in the valeriohq trio above. The hi-fi the loan story is
 * built from is set in Geist, and a figure being evaluated should look like the
 * thing that was drawn — porting it onto the article's type is a decision for
 * when it moves into the article, not before.
 */
export const fontGeist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap'
});

export const fontGeistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap'
});
