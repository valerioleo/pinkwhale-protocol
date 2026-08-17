import {transformerMetaHighlight} from '@shikijs/transformers';
import type {ShikiTransformer} from 'shiki';
import {defineConfig} from 'vocs/config';

/**
 * vocs only turns line numbers on via a `[!code line-numbers]` comment in the
 * source, and the Solidity here is pulled from the real contracts, which should
 * stay free of documentation markup. The prose points at specific lines, so every
 * Solidity block gets them.
 */
const solidityLineNumbers = (): ShikiTransformer => ({
  name: 'pinkwhale:solidity-line-numbers',
  code(node) {
    if (this.options.lang !== 'solidity') return;
    const existing = String(node.properties.class ?? '');
    node.properties.class = `${existing} line-numbers`.trim();
  }
});

export default defineConfig({
  title: 'Pinkwhale',
  description: 'An NFT lending protocol built entirely out of Seaport orders.',
  rootDir: '.',

  // Pink, used sparingly. The rest of the actor colour system lives in
  // src/components/pinkwhale.css.
  accentColor: 'light-dark(#c2185b, #ff5fa2)',

  // `[!code highlight]` would mean documentation markup inside the contracts, so
  // enable ```solidity {3-5} instead and keep the emphasis in the prose.
  codeHighlight: {
    transformers: [transformerMetaHighlight(), solidityLineNumbers()]
  },

  iconUrl: '/icon.svg',
  // vocs renders the logo as an <img>, so `currentColor` inside the SVG resolves
  // to black rather than the page's text colour. Two files instead.
  logoUrl: {light: '/logo-light.svg', dark: '/logo-dark.svg'},

  // Absolutises the canonical URL, og:url and the og:image below — scrapers
  // prefer absolute URLs.
  baseUrl: 'https://pinkwhale.valeriohq.com',

  // One static card for every page: the two-bars motif at 1200x630.
  ogImageUrl: (_path, {baseUrl}) => `${baseUrl ?? ''}/og.png`,

  socials: [
    {
      icon: 'github',
      link: 'https://github.com/valerioleo/pinkwhale-protocol'
    }
  ],

  topNav: [
    {text: 'The article', link: '/'},
    {text: 'Reference', link: '/reference'},
    {text: 'Run it', link: '/run'},
    {text: 'valeriohq.com', link: 'https://valeriohq.com'}
  ],

  sidebar: [
    {
      text: 'Seaport as a loan book',
      link: '/',
      items: [
        {text: 'Loans as orders', link: '/#loans-as-orders'},
        {text: 'Anatomy of a Seaport order', link: '/#anatomy-of-a-seaport-order'},
        {text: 'The loan lifecycle', link: '/#the-loan-lifecycle'},
        {text: 'Possible improvements', link: '/#possible-improvements'}
      ]
    },
    {text: 'Reference', link: '/reference'},
    {text: 'Run it yourself', link: '/run'}
  ],

  head: {
    link: [
      // Full-bleed square; iOS applies its own corner mask.
      {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'}
    ],
    style: [
      {
        textContent: `
/* Warm the neutrals. vocs' light scheme is pure achromatic grey, which reads as
   anonymous next to a pink accent; these are the same lightness values with a
   little warm chroma, so contrast ratios are unchanged. */
:root {
  --vocs-color-gray12: oklch(0.930 0.008 76);
  --vocs-color-gray13: oklch(0.958 0.007 76);
  --vocs-color-gray14: oklch(0.978 0.006 76);
  --vocs-background-color-surface: light-dark(oklch(0.995 0.003 76), var(--vocs-color-gray4));
}

/* Highlighted lines are the point of the surrounding paragraph, so give them an
   accent marker rather than the default near-invisible tint. */
.line.highlighted {
  box-shadow: inset 2px 0 0 var(--vocs-color-accent);
}

/* One article and a couple of reference pages. Previous/next paging between them
   is noise, and it drags the Copy-for-AI and edit-link rail along with it. */
[data-v-content-footer] {
  display: none;
}
        `.trim()
      }
    ]
  }
});
