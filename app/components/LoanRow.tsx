'use client';

import {useEffect, useState} from 'react';
import {formatUnits} from 'viem';

import {Punk} from './Punk';
import {USDC_DECIMALS} from '../lib/chain';

/**
 * What is owed right now.
 *
 * Seaport interpolates linearly from `startAmount` to `endAmount` across the
 * order's window, so this is not an estimate of the contract's behaviour — it is
 * the same arithmetic, and the number the borrower will actually pay.
 */
const owedAt = (
  now: bigint,
  owed: {start: bigint; end: bigint},
  opensAt: bigint,
  closesAt: bigint
) => {
  if (now <= opensAt || closesAt <= opensAt) return owed.start;
  if (now >= closesAt) return owed.end;

  return owed.start + ((owed.end - owed.start) * (now - opensAt)) / (closesAt - opensAt);
};

const countdown = (seconds: bigint) => {
  if (seconds <= 0n) return 'expired';

  const total = Number(seconds);
  const minutes = Math.floor(total / 60);

  return minutes > 0 ? `${minutes}m ${total % 60}s` : `${total}s`;
};

export const LoanRow = ({
  loan,
  viewAs,
  onRepay,
  onClaim,
  busy
}: {
  loan: {
    loanId: `0x${string}`;
    punks: number[];
    owed: {start: bigint; end: bigint};
    opensAt: bigint;
    closesAt: bigint;
  };
  viewAs: 'lender' | 'borrower';
  onRepay: () => void;
  onClaim: () => void;
  busy: boolean;
}) => {
  // The whole point is that the clock decides, so the clock has to be running.
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const timer = setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);

    return () => clearInterval(timer);
  }, []);

  const expired = now > loan.closesAt;
  const due = owedAt(now, loan.owed, loan.opensAt, loan.closesAt);

  return (
    <div className={`loan loan--${viewAs}`}>
      <dl className="loan-facts">
        <div>
          <dt>collateral</dt>
          <dd className="punks-inline">
            {loan.punks.map((id) => (
              <Punk key={id} id={id} scale={1} />
            ))}
            {loan.punks.map((id) => `#${id}`).join(' · ')}
          </dd>
        </div>
        <div>
          <dt>owed now</dt>
          <dd className="owed">{formatUnits(due, USDC_DECIMALS)} USDC</dd>
        </div>
        <div>
          <dt>{expired ? 'repayment window' : 'time left'}</dt>
          <dd>{expired ? 'shut' : countdown(loan.closesAt - now)}</dd>
        </div>
      </dl>

      {viewAs === 'borrower' ? (
        <button className="btn" onClick={onRepay} disabled={busy || expired}>
          {expired ? 'Window shut' : `Repay ${formatUnits(due, USDC_DECIMALS)} USDC`}
        </button>
      ) : (
        <button className="btn" onClick={onClaim} disabled={busy || !expired}>
          {expired ? 'Claim collateral — free' : 'Claim opens at expiry'}
        </button>
      )}

      <p className="hint">
        {viewAs === 'borrower'
          ? 'Only this address can fulfil the repayment order — its zoneHash names you.'
          : 'The default order asks for nothing at all, and only you can fill it. That is the entire liquidation engine.'}
      </p>
    </div>
  );
};
