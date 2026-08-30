'use client';

import NumberFlow from '@number-flow/react';
import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import type {Loan} from '../lib/loans';

/**
 * Where each loan has got to, and how long is left to do something about it.
 *
 * Only matched loans appear: an order nobody has settled is not a loan, and a
 * table of unfilled intentions reads like somebody else's order book rather than
 * anything the visitor did.
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

const state = (loan: Loan, now: bigint) => {
  if (loan.repaid) return {label: 'repaid', tone: 'settled'} as const;
  if (loan.claimed) return {label: 'collateral claimed', tone: 'settled'} as const;
  if (now > loan.closesAt) return {label: 'defaulted', tone: 'expired'} as const;

  return {label: 'live', tone: 'live'} as const;
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
    return <p className="hint">No loans yet. Open one above and it will appear here.</p>;
  }

  return (
    <table className="book">
      <thead>
        <tr>
          <th>collateral</th>
          <th>owed</th>
          <th>state</th>
          <th>clock</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {[...loans].reverse().map((loan) => {
          const {label, tone} = state(loan, now);
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
                {loan.repaid ? (
                  <span className="muted">paid in full</span>
                ) : loan.claimed ? (
                  /* Nothing was ever paid: the default order asks for nothing. */
                  <span className="muted">nothing — collateral taken</span>
                ) : (
                  <Pill token="usdc">
                    <NumberFlow
                      value={Number(formatUnits(owedAt(now, loan), USDC_DECIMALS))}
                      format={{maximumFractionDigits: 0}}
                      // The number only means anything while it is still moving.
                      animated={!loan.settled}
                    />{' '}
                    USDC
                  </Pill>
                )}
              </td>
              <td>
                <span className={`status status--${tone}`}>{label}</span>
              </td>
              <td className="clock">
                {loan.settled
                  ? '—'
                  : expired
                    ? 'lender may claim, free'
                    : `${countdown(loan.closesAt - now)} to repay`}
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
