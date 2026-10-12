import Link from 'next/link';

import {LandingCode} from './LandingCode';
import {LoanPlayer} from './LoanPlayer';

/**
 * The home page, cut down to what the loan story already shows: one claim, the
 * figure that proves it, the four reasons it works, and the code behind them. The
 * site's bar and foot come from the layout.
 */

const REASONS = [
  {
    title: 'Three small configs',
    body: (
      <>
        Lender and borrower sign standard Seaport orders. A <code>zone</code>, a{' '}
        <code>recipient</code> and a <code>zoneHash</code> are all that make them a loan offer.
      </>
    )
  },
  {
    title: 'Interest is a straight line',
    body: (
      <>
        The repayment asks for 100 USDC when the loan opens and 110 at the deadline. Seaport
        interpolates linearly between them; Pinkwhale has no interest code.
      </>
    )
  },
  {
    title: 'Liquidation is an empty array',
    body: (
      <>
        The default order’s consideration is <code>[]</code>. The lender takes the collateral for
        nothing, from the second the repayment window closes.
      </>
    )
  },
  {
    title: 'Orders order',
    body: (
      <>
        A default order names the repayment it depends on. If that repayment was filled, the zone
        refuses the claim before any token moves.
      </>
    )
  }
] as const;

export const Landing = () => (
  <div className="ld">
    <section className="ld-hero">
      <p className="ld-kicker">An experiment in composability</p>
      <h1 className="ld-title">Seaport as a loan book</h1>
      <p className="ld-deck">
        Pinkwhale expands Seaport’s functionality using a clever combination of orders and zones.
      </p>
    </section>

    <div className="lc">
      <section className="lc-band" aria-labelledby="ld-story-title">
        <div className="lc-band-head">
          <h2 className="lc-band-title" id="ld-story-title">
            One loan, start to finish.
          </h2>
          <p className="lc-band-text">
            Match the two orders. Then repay as Alice, or let the window close and watch Bob claim.
          </p>
        </div>

        <LoanPlayer />
      </section>
    </div>

    <section className="ld-section" aria-labelledby="ld-why-title">
      <p className="ld-kicker">Why it works</p>
      <h2 className="ld-h2" id="ld-why-title">
        Nothing new. Just Seaport orders.
      </h2>
      <ol className="ld-reasons">
        {REASONS.map((reason, index) => (
          <li className="ld-reason" key={reason.title}>
            <span className="ld-reason-num">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="ld-reason-title">{reason.title}</h3>
            <p className="ld-reason-body">{reason.body}</p>
          </li>
        ))}
      </ol>
    </section>

    <LandingCode />

    <section className="ld-play" aria-labelledby="ld-play-title">
      <p className="ld-kicker">On chain</p>
      <h2 className="ld-h2" id="ld-play-title">
        Try it yourself.
      </h2>
      <p className="ld-text">
        The same orders on Base Sepolia, with a test CryptoPunk and a five-minute loan, so a real
        ending arrives while you watch.
      </p>
      <Link className="ld-button" href="/playground">
        Open the playground
      </Link>
    </section>
  </div>
);
