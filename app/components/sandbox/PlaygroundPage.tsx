'use client';

import dynamic from 'next/dynamic';

import {DemoBoundary} from '../article/LiveDemo';
import {LandingBar} from './LandingBar';

const LivePlayground = dynamic(() => import('../article/LivePlayground'), {
  ssr: false,
  loading: () => (
    <p className="ld-play-loading" role="status">
      Opening the testnet playground…
    </p>
  )
});

/**
 * The live demo on Base Sepolia, on a page of its own. Coming here is the reader
 * asking for it, so it opens straight away rather than behind another button.
 */
export const PlaygroundPage = () => (
  <>
    <div className="ld">
      <LandingBar />

      <section className="ld-hero ld-play-hero">
        <p className="ld-kicker">On chain</p>
        <h1 className="ld-title">Try it yourself.</h1>
        <p className="ld-deck">
          The same orders on Base Sepolia, with a test CryptoPunk and a five-minute loan, so a real
          ending arrives while you watch.
        </p>
        <p className="ld-note">Test assets only. Research code, unaudited.</p>
      </section>
    </div>

    {/* Outside `.ld` on purpose: the playground brings its own type, and the
        page's reset would flatten it. */}
    <section className="ld-play-stage" aria-label="Playground">
      <DemoBoundary>
        <LivePlayground />
      </DemoBoundary>
    </section>

    <div className="ld">
      <footer className="ld-foot">
        <span>An experiment by Valerio Leo. Built on Seaport 1.6.</span>
        <a href="https://github.com/valerioleo/pinkwhale-protocol">
          Source <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  </>
);
