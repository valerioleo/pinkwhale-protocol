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

  // One static card for every page: the lifecycle axis at 1200x630, built by
  // `pnpm docs:og` from docs/og/card.html.
  //
  // Bump the `?v=` whenever the card changes. X retired its card validator in
  // 2022, so there is no way left to purge a preview by hand; a new image URL at
  // least guarantees that when a scraper does re-read the page it fetches the
  // new bytes instead of serving a cached og.png. It cannot fix posts that are
  // already up — those carry X's own copy until it expires, about a week.
  ogImageUrl: (_path, {baseUrl}) => `${baseUrl ?? ''}/og.png?v=2`,

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
    meta: {
      // vocs emits og:image itself but not its dimensions. Without them a
      // scraper has to download the file before it can lay the card out, and
      // Slack and Facebook will both render a small preview on the first fetch
      // and only correct it later.
      ogImageWidth: 1200,
      ogImageHeight: 630,
      ogImageType: 'image/png',

      // og:image:alt is what screen readers on X and Slack read out. Describe
      // the card, not the page — the description meta already covers the page.
      ogImageAlt:
        'The Pinkwhale loan lifecycle: a repayment order and a default order, separated by one second.',
      twitterImageAlt:
        'The Pinkwhale loan lifecycle: a repayment order and a default order, separated by one second.',

      ogLocale: 'en_US',

      // Both of these are @handles, not URLs. twitter:site is the account X
      // credits under the card and twitter:creator is the byline; with no
      // separate project account they are the same person. Point site at a
      // @pinkwhale account if one ever exists.
      twitterSite: '@valeriohq',
      twitterCreator: '@valeriohq'

      // No theme-color. It wants a light/dark pair differing only by `media`,
      // and React 19 dedupes hoisted <meta name> down to the last one, so only
      // half the pair survives — which tints the mobile chrome wrongly in the
      // other scheme. Better nothing than half. color-scheme already tells the
      // browser to use its own dark UI.
    },

    link: [
      // Full-bleed square; iOS applies its own corner mask.
      {rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png'},

      // vocs' iconUrl already emits the SVG, which is what every current browser
      // uses. This is for the clients that ask for /favicon.ico and never read
      // the HTML. Built by `pnpm docs:favicon`.
      {rel: 'icon', sizes: '16x16 32x32 48x48', type: 'image/x-icon', href: '/favicon.ico'}
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
