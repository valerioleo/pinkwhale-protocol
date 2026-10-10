'use client';

import dynamic from 'next/dynamic';
import {Component, useState, type ReactNode} from 'react';

const LivePlayground = dynamic(() => import('./LivePlayground'), {
  ssr: false,
  loading: () => <p className="live-loading" role="status">Opening the testnet playground…</p>
});

export class DemoBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() { return {failed: true}; }
  render() {
    if (this.state.failed) return <div className="live-loading" role="alert"><p>The live demo could not load. The article’s experiments still work.</p><button className="essay-button essay-button--quiet" onClick={() => window.location.reload()}>Reload page</button></div>;
    return this.props.children;
  }
}

export function LiveDemo() {
  const [open, setOpen] = useState(false);
  return <section className="live-demo" id="playground" aria-labelledby="live-title">
    <span className="eyebrow">The epilogue / On chain</span>
    <h2 id="live-title">Now let the real clock decide.</h2>
    <p>The same mechanism, running on Base Sepolia. This version uses a test CryptoPunk and a five-minute loan, so you can watch a real ending without waiting thirty days.</p>
    <div className="live-steps"><span><b>01</b> Get two funded actors</span><span><b>02</b> Sign & match</span><span><b>03</b> Repay or claim</span></div>
    <p className="research-note">Test assets only. Research code, unaudited. Don’t put real money in it.</p>
    {!open ? <button className="essay-button" onClick={() => setOpen(true)}>Open the live demo <span aria-hidden="true">↗</span></button>
      : <DemoBoundary><LivePlayground /></DemoBoundary>}
  </section>;
}
