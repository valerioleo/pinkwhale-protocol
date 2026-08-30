'use client';

import NumberFlow from '@number-flow/react';
import {useState} from 'react';
import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import type {Loan} from '../lib/loans';

/**
 * Where each loan has got to, and the two orders that can end it.
 *
 * Both buttons are always shown, because the pair of them is the point: a loan
 * has exactly two futures, each an order Pinkwhale minted and locked to one
 * address, and only the clock decides which one is fillable. Hiding the one you
 * cannot use would hide half the design.
 */
const owedAt = (now: bigint, loan: Loan) => {
  if (now <= loan.opensAt || loan.closesAt <= loan.opensAt) return loan.owed.start;
  if (now >= loan.closesAt) return loan.owed.end;

  return (
    loan.owed.start +
    ((loan.owed.end - loan.owed.start) * (now - loan.opensAt)) / (loan.closesAt - loan.opensAt)
  );
};

const countdown = (seconds: bigint) => {
  const total = Number(seconds);
  const minutes = Math.floor(total / 60);

  return minutes > 0 ? `${minutes}m ${total % 60}s` : `${total}s`;
};

const clock = (at: bigint) => new Date(Number(at) * 1000).toLocaleTimeString();

type Which = 'repayment' | 'default';

const OrderDetail = ({loan, which, now}: {loan: Loan; which: Which; now: bigint}) => {
  const expired = now > loan.closesAt;

  const collateral = (
    <span className="pills">
      {loan.punks.map((id) => (
        <Pill key={id} punk={id}>
          #{id}
        </Pill>
      ))}
    </span>
  );

  const repayment = {
    title: 'repayment order',
    wants: (
      <span className="pills">
        <Pill token="usdc">{formatUnits(loan.owed.start, USDC_DECIMALS)}</Pill>
        <span className="muted">→</span>
        <Pill token="usdc">{formatUnits(loan.owed.end, USDC_DECIMALS)} USDC</Pill>
        <span className="muted">rising by the second</span>
      </span>
    ),
    who: 'only the borrower',
    window: `open until ${clock(loan.closesAt)}`,
    state: loan.repaid ? 'filled' : expired ? 'expired' : 'live'
  };

  const fallback = {
    title: 'default order',
    wants: <span className="muted">nothing at all — it costs the lender only gas</span>,
    who: 'only the lender',
    // It never closes: an unclaimed default stays claimable forever.
    window: `opens ${clock(loan.closesAt + 1n)}, never closes`,
    state: loan.claimed ? 'filled' : expired ? 'live' : 'not live yet'
  };

  const order = which === 'repayment' ? repayment : fallback;

  return (
    <div className="detail">
      <div className="detail-head">
        <strong>{order.title}</strong>
        <span className={`status status--${order.state.replace(/ /g, '-')}`}>{order.state}</span>
      </div>
      <dl className="detail-facts">
        <div>
          <dt>offers</dt>
          <dd>{collateral}</dd>
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
      <p className="hint">
        Pinkwhale minted this when the loan opened and left it on Seaport. It is locked to one
        address by its <code>zoneHash</code>, so the other side pressing this gets turned away
        before anything moves.
      </p>
    </div>
  );
};

export const LoanList = ({
  loans,
  now,
  onRepay,
  onClaim,
  busy
}: {
  loans: Loan[];
  now: bigint;
  onRepay: (loan: Loan) => void;
  onClaim: (loan: Loan) => void;
  busy: boolean;
}) => {
  const [open, setOpen] = useState<string | null>(null);

  if (loans.length === 0) {
    return <p className="hint">No loans yet. Create a pair of orders and match them.</p>;
  }

  return (
    <ul className="loans">
      {[...loans].reverse().map((loan) => {
        const expired = now > loan.closesAt;
        const key = (which: Which) => `${loan.loanId}:${which}`;

        const toggle = (which: Which) =>
          setOpen((current) => (current === key(which) ? null : key(which)));

        return (
          <li key={loan.loanId} className="loan-item">
            <div className="loan-line">
              <span className="pills">
                {loan.punks.map((id) => (
                  <Pill key={id} punk={id}>
                    #{id}
                  </Pill>
                ))}
              </span>

              <span className="loan-owed">
                {loan.repaid ? (
                  <span className="muted">repaid in full</span>
                ) : loan.claimed ? (
                  <span className="muted">nothing — collateral taken</span>
                ) : (
                  <>
                    <Pill token="usdc">
                      <NumberFlow
                        value={Number(formatUnits(owedAt(now, loan), USDC_DECIMALS))}
                        format={{maximumFractionDigits: 0}}
                      />{' '}
                      USDC
                    </Pill>
                    <span className={`owed-note${expired ? ' owed-note--shut' : ''}`}>
                      {expired ? 'window shut' : `${countdown(loan.closesAt - now)} left to repay`}
                    </span>
                  </>
                )}
              </span>
            </div>

            <div className="loan-actions">
              {(
                [
                  ['repayment', 'Repay', () => onRepay(loan), !loan.settled && !expired],
                  ['default', 'Claim collateral', () => onClaim(loan), !loan.settled && expired]
                ] as const
              ).map(([which, label, act, enabled]) => (
                <span key={which} className="action">
                  <button className="btn btn--small" disabled={busy || !enabled} onClick={act}>
                    {label}
                  </button>
                  <button
                    className="info"
                    aria-expanded={open === key(which)}
                    aria-label={`About the ${which} order`}
                    onClick={() => toggle(which)}
                  >
                    i
                  </button>
                </span>
              ))}
            </div>

            {open?.startsWith(loan.loanId) ? (
              <OrderDetail loan={loan} which={open.endsWith('repayment') ? 'repayment' : 'default'} now={now} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};
