/**
 * Renders the social card.
 *
 *   pnpm docs:og
 *
 * `app/og/card.html` is the source of truth; this only rasterises it. The card
 * is deliberately a real page rather than a hand-drawn image, so it inherits the
 * font vocs ships and resolves the same oklch and color-mix tokens the site uses
 * — the og.png this replaces was a one-off PNG with no source, and it drifted
 * onto a different logo, palette and typeface without anything noticing.
 *
 * The output is committed. The build only copies app/public, so nothing at
 * build or deploy time needs a browser; run this when the card changes.
 *
 * Bump the `?v=` on the openGraph image in app/app/layout.tsx whenever the card
 * changes: X retired its card validator, so a new URL is the only way to get a
 * cached preview re-fetched.
 */
import {writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {screenshot} from './lib/headless';

const WIDTH = 1200;
const HEIGHT = 630;

const root = resolve(fileURLToPath(import.meta.url), '../..');
const source = join(root, 'app/og/card.html');
const output = join(root, 'app/public/og.png');

const png = await screenshot({source, width: WIDTH, height: HEIGHT});
writeFileSync(output, png);

console.log(`Wrote ${output} (${WIDTH}x${HEIGHT})`);
