/**
 * Builds docs/public/favicon.ico from the whale in docs/public/icon.svg.
 *
 *   pnpm docs:favicon
 *
 * Modern browsers take the SVG from `iconUrl`, so this is purely the long-tail
 * fallback: clients that request /favicon.ico at the root without ever parsing
 * the HTML — feed readers, older crawlers, link unfurlers. Rendering it from the
 * same SVG keeps it from drifting the way the social card did.
 *
 * The .ico carries PNGs rather than BMPs, which every browser and Windows since
 * Vista reads, and skips the AND-mask that raw-BMP icons need for transparency.
 */
import {writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {screenshot} from './lib/headless';

/** 16 and 32 are what tabs and taskbars actually use; 48 covers Windows lists. */
const SIZES = [16, 32, 48];

const ICONDIR_BYTES = 6;
const ICONDIRENTRY_BYTES = 16;

const root = resolve(fileURLToPath(import.meta.url), '../..');
const source = join(root, 'docs/public/icon.svg');
const output = join(root, 'docs/public/favicon.ico');

type Icon = {size: number; data: Buffer};

const buildDirectoryEntry = (icon: Icon, offset: number) => {
  const entry = Buffer.alloc(ICONDIRENTRY_BYTES);
  // 0 means 256 in this field; nothing here is that big, but be honest about it.
  entry.writeUInt8(icon.size === 256 ? 0 : icon.size, 0);
  entry.writeUInt8(icon.size === 256 ? 0 : icon.size, 1);
  entry.writeUInt8(0, 2); // palette size: 0 for truecolour
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(icon.data.length, 8);
  entry.writeUInt32LE(offset, 12);
  return entry;
};

const packIco = (icons: Icon[]) => {
  const header = Buffer.alloc(ICONDIR_BYTES);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 is icon
  header.writeUInt16LE(icons.length, 4);

  const firstOffset = ICONDIR_BYTES + ICONDIRENTRY_BYTES * icons.length;
  const placed = icons.map((icon, index) => ({
    icon,
    offset:
      firstOffset +
      icons.slice(0, index).reduce((total, earlier) => total + earlier.data.length, 0)
  }));

  return Buffer.concat([
    header,
    ...placed.map(({icon, offset}) => buildDirectoryEntry(icon, offset)),
    ...placed.map(({icon}) => icon.data)
  ]);
};

const icons = await Promise.all(
  SIZES.map(async (size) => ({
    size,
    data: await screenshot({source, width: size, height: size, transparent: true})
  }))
);

writeFileSync(output, packIco(icons));

console.log(`Wrote ${output} (${SIZES.join(', ')}px)`);
