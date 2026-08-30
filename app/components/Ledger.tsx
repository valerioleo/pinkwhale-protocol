'use client';

import type {ReactNode} from 'react';

/**
 * A line of a ledger: what it is on the left, how much of it on the right.
 *
 * Shared by the wallets and the orders because they are the same statement read
 * two ways — one says what an address holds, the other what it is willing to
 * trade — and a reader should not have to learn two layouts for that.
 */
export const LedgerRow = ({label, children}: {label: ReactNode; children: ReactNode}) => (
  <div className="ledger-row">
    <span className="ledger-label">{label}</span>
    <span className="ledger-value">{children}</span>
  </div>
);

/** A qualifier hanging off the row above it. */
export const LedgerNote = ({label, children}: {label: ReactNode; children: ReactNode}) => (
  <div className="ledger-note">
    <span>{label}</span>
    <span>{children}</span>
  </div>
);

/** The heading a ledger belongs to: whose it is. */
export const LedgerHead = ({
  avatar,
  name,
  under
}: {
  avatar: ReactNode;
  name: string;
  under?: ReactNode;
}) => (
  <div className="ledger-head">
    {avatar}
    <span className="ledger-titles">
      <span className="ledger-name">{name}</span>
      {under ? <span className="ledger-under">{under}</span> : null}
    </span>
  </div>
);
