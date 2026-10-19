import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

import createMDX from '@next/mdx';
import type {NextConfig} from 'next';

/**
 * Local plugins are named by absolute path. @next/mdx resolves plugin strings with
 * `require.resolve(name, {paths: [projectRoot]})`, and `paths` is ignored for a
 * relative specifier — so './lib/mdx/include.mjs' resolves against the loader
 * inside node_modules and is never found.
 */
const here = (path: string) => resolve(dirname(fileURLToPath(import.meta.url)), path);

/**
 * Turbopack hands MDX plugin options to Rust, so everything here has to be
 * serialisable: plugins are named by module rather than imported, and no option
 * can be a function.
 *
 * That ruled out the two shiki transformers vocs used, and neither is missed.
 * `{5-11}` line ranges are native to rehype-pretty-code, and the line numbers on
 * Solidity blocks are a CSS counter keyed on `data-language` — which is better
 * than a transformer anyway, because it keeps the markup free of a concern that
 * was only ever presentational.
 */
const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  // Loaded by Node at runtime rather than bundled. The SDK lazily imports its x402
  // payment packages, which the faucet never uses and nothing installs, and a bundler
  // has to resolve every import it sees whether or not it would ever run.
  serverExternalPackages: ['@coinbase/cdp-sdk']
};

const withMDX = createMDX({
  options: {
    // Order matters: includes are resolved before anything tries to highlight
    // them, or shiki colours an empty block.
    remarkPlugins: [
      here('lib/mdx/include.mjs'),
      'remark-frontmatter',
      // Exported as `metadata`, the name Next's app router already reads, so
      // `title:` and `description:` in the frontmatter become the page's <title>
      // and meta description with nothing in between.
      ['remark-mdx-frontmatter', {name: 'metadata'}],
      'remark-gfm',
      'remark-directive',
      here('lib/mdx/callout.mjs')
    ],
    rehypePlugins: [
      'rehype-slug',
      [
        'rehype-pretty-code',
        {
          // The high-contrast light theme: plain github-light's orange and red
          // tokens fall under 4.5:1 on the code card.
          theme: {light: 'github-light-high-contrast', dark: 'github-dark-high-contrast'},
          defaultLang: 'text'
        }
      ]
    ]
  }
});

export default withMDX(nextConfig);
