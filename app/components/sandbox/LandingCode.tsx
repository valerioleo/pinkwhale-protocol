import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

import {codeToHtml} from 'shiki';

import {CodeTabs, type CodeTab} from './CodeTabs';
import {REPO_URL} from './LandingBar';

/**
 * The four reasons, in Solidity.
 *
 * Nothing here is typed out by hand: each excerpt is lifted from between a pair of
 * `[!region name]` markers in the contract it quotes, the same markers the essay
 * reads. Rename a region and the build fails, so the page cannot drift from the
 * code it claims to show.
 */

/** The repository root. Next runs from `app/`, both in dev and in a build. */
const ROOT = resolve(process.cwd(), '..');

const SOURCE = `${REPO_URL}/blob/main/`;

type Excerpt = {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly region: string;
  /** Stop after the line containing this text (and its closing brace), eliding the rest. */
  readonly until?: string;
  readonly blurb: string;
};

const EXCERPTS: readonly Excerpt[] = [
  {
    id: 'offer',
    label: 'The offer',
    file: 'contracts/Pinkwhale/Pinkwhale.sol',
    region: 'assert-terms',
    until: 'BorrowerTermsMismatch',
    blurb:
      'executeLoan refuses a pair unless the lender’s collateral goes to Pinkwhale and each side’s terms hash to its own zoneHash.'
  },
  {
    id: 'repayment',
    label: 'Repayment',
    file: 'contracts/Pinkwhale/Utils/SeaportUtils.sol',
    region: 'repayment-order',
    blurb:
      'The lender’s consideration becomes the repayment as it was signed, start amount to end amount, from now until the term ends. Only the borrower can fill it.'
  },
  {
    id: 'default',
    label: 'Default',
    file: 'contracts/Pinkwhale/Utils/SeaportUtils.sol',
    region: 'default-order',
    blurb:
      'The same collateral for no consideration at all, from the second after repayment closes, forever. Only the lender can fill it.'
  },
  {
    id: 'guard',
    label: 'The guard',
    file: 'contracts/Pinkwhale/Utils/SeaportUtils.sol',
    region: 'assert-order-execution',
    blurb:
      'Before any token moves, the zone checks that the repayment a default order names was never filled, and that the caller is the one it was written for.'
  }
];

/** The lines between the region markers, with the markers themselves dropped. */
const region = (source: string, name: string) => {
  const lines = source.split('\n');
  const start = lines.findIndex(line => line.includes(`[!region ${name}]`));
  const end = lines.findIndex(line => line.includes(`[!endregion ${name}]`));

  if (start === -1 || end === -1) throw new Error(`No region "${name}": it was renamed or removed`);

  return lines
    .slice(start + 1, end)
    .filter(line => !line.includes('[!region ') && !line.includes('[!endregion '));
};

/** Strip the shortest leading indent shared by every non-blank line. */
const dedent = (lines: readonly string[]) => {
  const shortest = Math.min(
    ...lines.filter(line => line.trim()).map(line => line.length - line.trimStart().length)
  );

  return lines.map(line => line.slice(shortest));
};

/** Cut after `until` and the brace that closes it, and say that something follows. */
const cut = (lines: readonly string[], until: string | undefined) => {
  const at = until === undefined ? -1 : lines.findIndex(line => line.includes(until));

  return at === -1 ? lines : [...lines.slice(0, at + 2), '', '    // …', '}'];
};

const highlight = (excerpt: Excerpt): Promise<CodeTab> => {
  const source = readFileSync(resolve(ROOT, excerpt.file), 'utf8');
  const code = cut(dedent(region(source, excerpt.region)), excerpt.until).join('\n').trim();

  return codeToHtml(code, {lang: 'solidity', theme: 'github-light'}).then(html => ({
    id: excerpt.id,
    label: excerpt.label,
    file: excerpt.file,
    url: `${SOURCE}${excerpt.file}`,
    blurb: excerpt.blurb,
    html
  }));
};

export const LandingCode = async () => {
  const tabs = await Promise.all(EXCERPTS.map(highlight));

  return (
    <section className="ld-section" aria-labelledby="ld-code-title">
      <p className="ld-kicker">The code</p>
      <h2 className="ld-h2" id="ld-code-title">
        Read it in Solidity.
      </h2>
      <p className="ld-text">
        Four excerpts, lifted straight from the contracts. Everything they don’t do, Seaport does.
      </p>
      <a className="ld-repo-link" href={REPO_URL}>
        github.com/valerioleo/pinkwhale-protocol <span aria-hidden="true">↗</span>
      </a>
      <CodeTabs tabs={tabs} />
    </section>
  );
};
