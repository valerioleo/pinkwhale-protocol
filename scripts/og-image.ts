/**
 * Renders the social card.
 *
 *   pnpm docs:og
 *
 * `docs/og/card.html` is the source of truth; this only rasterises it. The card
 * is deliberately a real page rather than a hand-drawn image, so it inherits the
 * font vocs ships and resolves the same oklch and color-mix tokens the site uses
 * — the og.png this replaces was a one-off PNG with no source, and it drifted
 * onto a different logo, palette and typeface without anything noticing.
 *
 * The output is committed. `vocs build` only copies docs/public, so nothing at
 * build or deploy time needs a browser; run this when the card changes.
 */
import {spawn} from 'node:child_process';
import {existsSync, mkdtempSync, renameSync, rmSync, statSync} from 'node:fs';
import {homedir, tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {setTimeout as sleep} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

const WIDTH = 1200;
const HEIGHT = 630;

/** How long to wait for the PNG to land before giving up. */
const RENDER_TIMEOUT_MS = 30_000;
const POLL_MS = 100;

const root = resolve(fileURLToPath(import.meta.url), '../..');
const source = join(root, 'docs/og/card.html');
const output = join(root, 'docs/public/og.png');

/**
 * No browser is a dependency of this repo, so use whichever one is already on
 * the machine. chrome-headless-shell first: it is built for exactly this and
 * exits when it is done, where full Chrome (151, at least) writes the screenshot
 * and then stays up forever. CHROME_PATH covers anything not on this list.
 */
const BROWSER_CANDIDATES = [
  process.env.CHROME_PATH,
  ...['1234', '1217', '1208'].map((build) =>
    join(
      homedir(),
      'Library/Caches/ms-playwright',
      `chromium_headless_shell-${build}`,
      'chrome-headless-shell-mac-arm64/chrome-headless-shell'
    )
  ),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/chrome-headless-shell',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
];

const findBrowser = () => {
  const found = BROWSER_CANDIDATES.find((path) => path !== undefined && existsSync(path));
  if (!found) {
    throw new Error(
      `No Chrome found. Tried:\n  ${BROWSER_CANDIDATES.filter(Boolean).join('\n  ')}\nSet CHROME_PATH to override.`
    );
  }
  return found;
};

/**
 * Both browsers write the PNG well before they are willing to exit, so wait on
 * the file rather than on the process: it is the one signal that means the same
 * thing for either binary. Size has to settle too, or a half-flushed file gets
 * moved into place.
 */
const waitForPng = async (path: string, deadline: number): Promise<void> => {
  const size = existsSync(path) ? statSync(path).size : 0;
  if (size > 0) {
    await sleep(POLL_MS);
    if (statSync(path).size === size) return;
  }
  if (Date.now() > deadline) throw new Error(`Timed out waiting for ${path}`);

  await sleep(POLL_MS);
  return waitForPng(path, deadline);
};

const render = async () => {
  const browser = findBrowser();
  // Chrome writes into its profile directory and, for full Chrome, spawns
  // updater children off it. Give it a scratch one and throw it away after.
  const profile = mkdtempSync(join(tmpdir(), 'pinkwhale-og-'));
  const staging = join(profile, 'og.png');

  const child = spawn(
    browser,
    [
      '--headless=new',
      `--user-data-dir=${profile}`,
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-component-update',
      '--disable-background-networking',
      // The card loads the Geist file out of node_modules over file://.
      '--allow-file-access-from-files',
      // Waits for the webfont instead of shooting the fallback face.
      '--virtual-time-budget=5000',
      `--window-size=${WIDTH},${HEIGHT}`,
      `--screenshot=${staging}`,
      `file://${source}`
    ],
    {stdio: 'ignore'}
  );

  try {
    await waitForPng(staging, Date.now() + RENDER_TIMEOUT_MS);
    renameSync(staging, output);
    console.log(`Wrote ${output} (${WIDTH}x${HEIGHT}) via ${browser}`);
  } finally {
    child.kill('SIGKILL');
    rmSync(profile, {recursive: true, force: true});
  }
};

await render();
