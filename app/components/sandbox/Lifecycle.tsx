'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';

import {OrderDiff} from './OrderDiff';
import {ResolvePlayer} from './ResolvePlayer';
import {MOTION_CUES, PRINCIPAL} from './model';

/**
 * Fig. 1 — the loan lifecycle.
 *
 * Three steps, of which only the last one moves on its own. It starts when it
 * arrives rather than on load, because a clock that ran while the reader was
 * still on step 01 would have finished before they looked at it.
 */

/** A step counts as arrived once this much of it is on screen. */
const SEEN = 0.35;

const useArrived = <T extends Element>() => {
  const stageRef = useRef<T | null>(null);
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    const node = stageRef.current;

    if (!node) return;

    // An observer is right here where it was wrong for the stepper: this is a
    // one-way latch, not a value that has to stay true to the scroll position.
    // Missing a crossing would delay the start, never leave it showing a lie.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setArrived(true);
      },
      {threshold: SEEN}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return {stageRef, arrived};
};

const Exchange = () => (
  <div className="lc-exchange">
    <div className="lc-transfer">
      <p className="lc-transfer-label">Principal released</p>
      <p className="lc-transfer-value">
        <Image src="/tokens/usdc.png" alt="" width={30} height={30} />
        <strong>{PRINCIPAL.toFixed(2)}</strong>
        <span>USDC</span>
      </p>
      <p className="lc-transfer-route">
        <span>Funds transfer</span>
        Bob → Alice
      </p>
    </div>

    <div className="lc-transfer">
      <p className="lc-transfer-label">Collateral locked</p>
      <p className="lc-transfer-value">
        <Image src="/tokens/bayc.png" alt="" width={30} height={30} data-asset="ape" />
        <strong>#8263</strong>
        <span>BAYC</span>
      </p>
      <p className="lc-transfer-route">
        <span>Collateral transfer</span>
        Alice → Pinkwhale
      </p>
    </div>
  </div>
);

export const Lifecycle = () => {
  const {stageRef, arrived} = useArrived<HTMLElement>();

  return (
    <article className="lc">
      <header className="lc-head">
        <p className="lc-kicker">Pinkwhale / the loan lifecycle</p>
        <h1 className="lc-title">
          Clear rules.
          <br />
          Certain outcomes.
        </h1>
        <p className="lc-context">
          Agree → Exchange → Resolve
          <span>A loan built from standard Seaport orders.</span>
        </p>
      </header>

      <section className="lc-band lc-band--open">
        <div className="lc-step">
          <h2 className="lc-step-head">
            <span className="lc-step-num">01</span> Agree
          </h2>
          <p className="lc-step-caption">
            Alice offers her BAYC as collateral; Bob offers {PRINCIPAL} USDC. Each signs a standard
            Seaport order naming Pinkwhale as zone and collateral recipient, with loan terms
            encoded in zoneHash. Their interest and duration bounds overlap at 10% and 30 days. No
            assets move until the orders match.
          </p>
          <OrderDiff />
        </div>

        <div className="lc-step">
          <h2 className="lc-step-head">
            <span className="lc-step-num">02</span> Exchange
          </h2>
          <p className="lc-step-caption">
            The orders match and the loan opens in one transaction: Alice&rsquo;s BAYC enters
            Pinkwhale custody, and Bob&rsquo;s {PRINCIPAL} USDC goes to Alice.
          </p>
          <Exchange />
        </div>
      </section>

      <section className="lc-band lc-band--resolve" ref={stageRef}>
        <div className="lc-resolve-text">
          <h2 className="lc-step-head">
            <span className="lc-step-num">03</span>
          </h2>
          <p className="lc-resolve-title">Resolve</p>
          <p className="lc-step-caption">
            Pinkwhale creates two exit orders in the same transaction that opens the loan.
          </p>
          <p className="lc-step-caption">
            Repay within the window to return the NFT to Alice. If the window closes unpaid, Bob
            can claim it. Only one exit order can ever be filled.
          </p>
        </div>

        <ResolvePlayer running={arrived} />
      </section>

      <section className="lc-band lc-band--notes">
        <div className="lc-notes-head">
          <p className="lc-notes-title">Motion notes</p>
          <p className="lc-notes-rule">On entry → advance → settle → hold</p>
        </div>
        <div className="lc-cues">
          {MOTION_CUES.map((cue) => (
            <div className="lc-cue" key={cue.id}>
              <p className="lc-cue-id">{cue.id}</p>
              <p className="lc-cue-text">{cue.text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
};
