'use client';

import {Blobatar} from '@blobatar/react';
import {useState} from 'react';
import {formatUnits} from 'viem';

import {Amount} from './Amount';
import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import type {Loan} from '../lib/loans';
import {PERSONA_HUE, type Personas} from '../lib/personas';
import {punkIconStyle} from '../lib/punks';
import {explorerUrl} from '../lib/txLog';

/**
 * One card per loan: what is in escrow, what is owed, and the one thing left to
 * do about it.
 *
 * A loan has exactly two futures, but only ever one of them is open, so the card
 * offers one button rather than a disabled pair. The orders themselves are a
 * click away, which is where the pair does need showing — that is the point at
 * which "why can I not press the other one" has an answer.
 */
const owedAt = (at: bigint, loan: Loan) => {
  if (at <= loan.opensAt || loan.closesAt <= loan.opensAt) return loan.owed.start;
  if (at >= loan.closesAt) return loan.owed.end;

  return (
    loan.owed.start +
    ((loan.owed.end - loan.owed.start) * (at - loan.opensAt)) / (loan.closesAt - loan.opensAt)
  );
};

const countdown = (seconds: bigint) => {
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);

  return minutes > 0 ? `${minutes}m ${total % 60}s` : `${total}s`;
};

const usdc = (amount: bigint) => formatUnits(amount, USDC_DECIMALS);


const shortId = (id: string) => `${id.slice(0, 8)}…${id.slice(-4)}`;

const Filler = ({persona, personas}: {persona: 'lender' | 'borrower'; personas: Personas}) => (
  <span className="filler">
    {personas ? (
      <span className="avatar-disc avatar-disc--small">
        <Blobatar name={personas[persona]} size={20} hue={PERSONA_HUE[persona]} />
      </span>
    ) : null}
    only the {persona}
  </span>
);

const Orders = ({loan, now, personas}: {loan: Loan; now: bigint; personas: Personas}) => {
  const expired = now > loan.closesAt;

  const rows = [
    {
      title: 'repayment order',
      state: loan.repaid ? 'filled' : expired ? 'expired' : 'live',
      wants: (
        <>
          <Pill token="usdc">{usdc(loan.owed.start)}</Pill> rising to{' '}
          <Pill token="usdc">{usdc(loan.owed.end)} USDC</Pill>
        </>
      ),
      who: <Filler persona="borrower" personas={personas} />,
      // Said as time remaining rather than a wall clock: what matters is whether
      // there is any left.
      window: expired ? 'closed' : `open for another ${countdown(loan.closesAt - now)}`
    },
    {
      title: 'default order',
      state: loan.claimed ? 'filled' : expired ? 'live' : 'not live yet',
      wants: <span className="muted">nothing at all — it costs the lender only gas</span>,
      who: <Filler persona="lender" personas={personas} />,
      // It never closes: an unclaimed default stays claimable forever.
      window: expired ? 'open, and never closes' : 'opens when the repayment order expires'
    }
  ];

  return (
    <div className="orders">
      {rows.map((order) => (
        <div key={order.title} className="order">
          <div className="order-head">
            <strong>{order.title}</strong>
            <span className={`status status--${order.state.replace(/ /g, '-')}`}>{order.state}</span>
          </div>
          <dl className="order-facts">
            <div>
              <dt>offers</dt>
              <dd>
                <span className="pills">
                  {loan.punks.map((id) => (
                    <Pill key={id} punk={id}>
                      #{id}
                    </Pill>
                  ))}
                </span>
              </dd>
            </div>
            <div>
              <dt>wants</dt>
              <dd>{order.wants}</dd>
            </div>
            <div>
              <dt>who may fill</dt>
              <dd>{order.who}</dd>
            </div>
            <div>
              <dt>window</dt>
              <dd>{order.window}</dd>
            </div>
          </dl>
        </div>
      ))}
      <p className="hint">
        Pinkwhale minted both of these when the loan opened and left them on Seaport. Each is locked
        to one address by its <code>zoneHash</code>, so the wrong side is turned away before
        anything moves — and the clock alone decides which is open.
      </p>
    </div>
  );
};

const LoanCard = ({
  loan,
  now,
  personas,
  onRepay,
  onClaim,
  busy
}: {
  loan: Loan;
  now: bigint;
  personas: Personas;
  onRepay: () => void;
  onClaim: () => void;
  busy: boolean;
}) => {
  const [showOrders, setShowOrders] = useState(false);

  const expired = now > loan.closesAt;
  const status = loan.repaid ? 'repaid' : loan.claimed ? 'claimed' : expired ? 'defaulted' : 'live';

  // What it settled at: the curve evaluated when the fill landed, not the total
  // agreed. A claim pays nothing, so the figure there is the debt left unpaid.
  const amount = loan.repaid
    ? owedAt(loan.resolvedAt ?? loan.closesAt, loan)
    : loan.claimed
      ? loan.owed.end
      : owedAt(now, loan);

  return (
    <li className={`loan-card loan-card--${status}`}>
      <div className="loan-card-head">
        <span className="loan-id">order {shortId(loan.loanId)}</span>
        <span className={`status status--${status}`}>{status}</span>
      </div>

      <div className="loan-figures">
        <div className="figure figure--owed">
          <dt>{loan.claimed ? 'Unpaid' : 'Owed'}</dt>
          <dd>
            <Amount value={amount} animated={!loan.settled} />
          </dd>
        </div>

        <div className="figure">
          <dt>Collateral</dt>
          <dd className="collateral">
            {loan.punks.map((id) => (
              <span key={id} className="collateral-item">
                <span className="pill-icon pill-icon--punk collateral-art" style={punkIconStyle(id, 40)} />
                #{id}
              </span>
            ))}
          </dd>
        </div>
      </div>

      {loan.settled ? (
        <a
          className="btn btn--wide btn--quiet"
          href={loan.resolutionHash ? explorerUrl(loan.resolutionHash) : undefined}
          target="_blank"
          rel="noreferrer"
        >
          View {loan.repaid ? 'repay' : 'claim'} tx ↗
        </a>
      ) : expired ? (
        <button className="btn btn--wide" disabled={busy} onClick={onClaim}>
          Claim collateral
        </button>
      ) : (
        <button className="btn btn--wide" disabled={busy} onClick={onRepay}>
          Repay within {countdown(loan.closesAt - now)}
        </button>
      )}

      <button className="orders-toggle" onClick={() => setShowOrders((open) => !open)}>
        <span className="info" aria-hidden="true">
          i
        </span>
        {showOrders ? 'Hide' : 'See'} Pinkwhale orders
      </button>

      {showOrders ? <Orders loan={loan} now={now} personas={personas} /> : null}
    </li>
  );
};

export const LoanList = ({
  loans,
  now,
  personas,
  onRepay,
  onClaim,
  busy
}: {
  loans: Loan[];
  now: bigint;
  personas: Personas;
  onRepay: (loan: Loan) => void;
  onClaim: (loan: Loan) => void;
  busy: boolean;
}) => {
  if (loans.length === 0) {
    return <p className="hint">No loans yet. Create a pair of orders and match them.</p>;
  }

  return (
    <ul className="loans">
      {[...loans].reverse().map((loan) => (
        <LoanCard
          key={loan.loanId}
          loan={loan}
          now={now}
          personas={personas}
          busy={busy}
          onRepay={() => onRepay(loan)}
          onClaim={() => onClaim(loan)}
        />
      ))}
    </ul>
  );
};
