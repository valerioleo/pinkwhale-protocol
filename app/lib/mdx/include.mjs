import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import {visit} from 'unist-util-visit';

/**
 * `[!include ~/path/to/File.sol:region]`, the way vocs did it.
 *
 * The article quotes nine pieces of Solidity and not one of them is typed into the
 * prose: each is lifted out of the contract it documents, from between a matching
 * pair of `[!region name]` / `[!endregion name]` comments. Rename a region and the
 * block empties, which is the point — the article cannot quietly drift from the
 * repo.
 *
 * `~` is the repository root. Under vocs it meant docs/src, which is why the old
 * markers all began `~/../../` — a relative hop that only parsed if you knew where
 * the file had been.
 *
 * Plain JavaScript rather than TypeScript because Turbopack hands MDX plugins to
 * Rust as module paths and imports them itself, with no compile step in between.
 */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

const INCLUDE = /^\s*\/\/\s*\[!include\s+(\S+?)(?::(\S+))?\]\s*$/;

/** The lines between the region markers, with the markers themselves dropped. */
const region = (source, name) => {
  const lines = source.split('\n');
  const start = lines.findIndex((line) => line.includes(`[!region ${name}]`));
  const end = lines.findIndex((line) => line.includes(`[!endregion ${name}]`));

  if (start === -1 || end === -1) {
    throw new Error(`[!include] no region "${name}" — it was renamed or removed`);
  }

  return lines
    .slice(start + 1, end)
    .filter((line) => !line.includes('[!region ') && !line.includes('[!endregion '))
    .join('\n');
};

/** Strip the shortest leading indent shared by every non-blank line. */
const dedent = (source) => {
  const indents = source
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.length - line.trimStart().length);

  const shortest = Math.min(...indents, Infinity);

  return shortest === Infinity || shortest === 0
    ? source
    : source
        .split('\n')
        .map((line) => line.slice(shortest))
        .join('\n');
};

const remarkInclude = () => (tree) => {
  visit(tree, 'code', (node) => {
    const match = node.value.match(INCLUDE);

    if (!match) return;

    const [, target, name] = match;
    const source = readFileSync(resolve(ROOT, target.replace(/^~\//, '')), 'utf8');

    node.value = dedent(name ? region(source, name) : source).trim();
  });
};

export default remarkInclude;
