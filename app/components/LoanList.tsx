'use client';

import {Blobatar} from '@blobatar/react';
import {useState} from 'react';
import {formatUnits} from 'viem';

import {Amount} from './Amount';
import {LedgerHead, LedgerNote, LedgerRow} from './Ledger';
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

/**
 * The two orders Pinkwhale minted, read from the point of view of whoever is
 * allowed to fill them: what they pay, what they get, and how long they have.
 *
 * The default order is *cancelled* once the repayment order is filled, not merely
 * closed. Its zoneHash commits to the repayment order, and the zone checks that
 * order's status before letting a claim through — so a repaid loan makes the
 * claim unfillable forever, whatever the clock says.
 */
const Order = ({
  persona,
  personas,
  pays,
  collateral,
  window: validity
}: {
  persona: 'lender' | 'borrower';
  personas: Personas;
  pays: React.ReactNode;
  collateral: number[];
  window: string;
}) => (
  <div className="order">
    <span className="ledger-caption">Who can fill</span>
    <LedgerHead
      avatar={
        personas ? <Blobatar name={personas[persona]} size={30} hue={PERSONA_HUE[persona]} /> : null
      }
      name={persona}
      compact
    />

    <span className="ledger-caption">Pays</span>
    {pays}

    <span className="ledger-caption">Gets</span>
    <LedgerRow label="CryptoPunks">
      <span className="count-and-stack">
        #{collateral[0]}
        <span
          className="pill-icon pill-icon--punk stack-solo"
          style={punkIconStyle(collateral[0] ?? 0, 28)}
        />
      </span>
    </LedgerRow>

    <span className="ledger-caption">Validity window</span>
    <p className="order-window">{validity}</p>
  </div>
);

const Orders = ({loan, now, personas}: {loan: Loan; now: bigint; personas: Personas}) => {
  const expired = now > loan.closesAt;

  const repaymentWindow = loan.repaid
    ? 'Filled — the loan was repaid'
    : expired
      ? 'Expired'
      : `Expires in ${countdown(loan.closesAt - now)}`;

  const defaultWindow = loan.claimed
    ? 'Filled — the collateral was claimed'
    : loan.repaid
      ? 'Cancelled — the repayment order was filled first'
      : expired
        ? 'Open, never expires'
        : 'Opens after the repayment order closes, and never expires';

  return (
    <div className="orders">
      <Order
        persona="borrower"
        personas={personas}
        collateral={loan.punks}
        window={repaymentWindow}
        pays={
          <>
            <LedgerRow label="USDC">
              <Amount value={loan.owed.end} animated={false} unit={false} />
            </LedgerRow>
            <LedgerNote label="Rising by the second from">{usdc(loan.owed.start)} USDC</LedgerNote>
          </>
        }
      />

      <Order
        persona="lender"
        personas={personas}
        collateral={loan.punks}
        window={defaultWindow}
        pays={<LedgerRow label="Nothing, just gas">{null}</LedgerRow>}
      />

      <p className="hint">
        Pinkwhale created these orders on-chain when the loan was executed. Each is locked to one
        address by its <code>zoneHash</code>, so only the authorised party can fulfil it.
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
