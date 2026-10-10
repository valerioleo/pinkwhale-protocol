import {LoanPlayer} from './LoanPlayer';
import {Sys} from './marks';

/**
 * Fig. 1 — the loan lifecycle, as one player: the orders that open the loan and
 * the two that close it, on a single clock.
 */
export const Lifecycle = () => (
  <article className="lc">
    <div className="lc-frame">
      <header className="lc-head">
        <div className="lc-head-main">
          <p className="lc-kicker">PINKWHALE / THE LOAN LIFECYCLE</p>
          <h1 className="lc-title">
            Clear rules.
            <br />
            Certain outcomes.
          </h1>
        </div>
        <p className="lc-context">
          Execute loan <Sys>→</Sys> Resolve
          <br />A loan built from standard Seaport orders.
        </p>
      </header>

      <section className="lc-band">
        <div className="lc-band-head">
          <h2 className="lc-band-title">The loan, from execution to outcome.</h2>
          <p className="lc-band-text">
            Alice and Bob’s orders match, and execution leaves two new orders in their place. Each
            one owns its stretch of time. Scrub the clock, then repay or let the window close.
          </p>
        </div>

        <LoanPlayer />
      </section>
    </div>
  </article>
);
