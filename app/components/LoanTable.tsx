'use client';

import NumberFlow from '@number-flow/react';
import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import type {Loan} from '../lib/loans';

/**
 * Where each loan has got to.
 *
 * Only matched loans appear: an order nobody has settled is not a loan, and a
 * table of unfilled intentions reads like somebody else's order book.
 *
 * There is no separate state column because the amount already says it. A number
 * climbing with a countdown under it is a live loan; the same number stopped with
 * "window shut" is a default; and a settled loan has no amount to show at all.
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

const Owed = ({loan, now}: {loan: Loan; now: bigint}) => {
  if (loan.repaid) return <span className="muted">repaid in full</span>;

  // Nothing was ever paid: the default order asks for nothing at all.
  if (loan.claimed) return <span className="muted">nothing — collateral taken</span>;

  const expired = now > loan.closesAt;

  return (
    <span className="owed-cell">
      <Pill token="usdc">
        <NumberFlow
          value={Number(formatUnits(owedAt(now, loan), USDC_DECIMALS))}
          format={{maximumFractionDigits: 0}}
        />{' '}
        USDC
      </Pill>
      <span className={`owed-note${expired ? ' owed-note--shut' : ''}`}>
        {expired ? 'window shut · lender may claim, free' : `${countdown(loan.closesAt - now)} left to repay`}
      </span>
    </span>
  );
};

export const LoanTable = ({
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
  if (loans.length === 0) {
    return <p className="hint">No loans yet. Create a pair of orders and match them.</p>;
  }

  return (
    <table className="book">
      <thead>
        <tr>
          <th>collateral</th>
          <th>owed</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {[...loans].reverse().map((loan) => {
          const expired = now > loan.closesAt;

          return (
            <tr key={loan.loanId}>
              <td>
                <span className="pills">
                  {loan.punks.map((id) => (
                    <Pill key={id} punk={id}>
                      #{id}
                    </Pill>
                  ))}
                </span>
              </td>
              <td>
                <Owed loan={loan} now={now} />
              </td>
              <td>
                {/* One control, decided by the clock: the zone would refuse the
                    other one anyway, so offering it would only be a trap. */}
                {loan.settled ? null : expired ? (
                  <button className="btn btn--small" disabled={busy} onClick={() => onClaim(loan)}>
                    Claim collateral
                  </button>
                ) : (
                  <button className="btn btn--small" disabled={busy} onClick={() => onRepay(loan)}>
                    Repay
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
