'use client';

import {formatUnits} from 'viem';

import {PunkStack} from './PunkStack';
import {USDC_DECIMALS} from '../lib/chain';
import {PRINCIPAL, REPAYMENT_USDC} from '../lib/loan';
import type {StoredLoan} from '../lib/orderStore';

/**
 * All four orders that make a loan, and where each one has got to.
 *
 * Two are signed by people and spent the moment they match; two are minted by
 * Pinkwhale and left on Seaport waiting to see how it ends. Showing them in one
 * table is the point — they are the same kind of object, and the only difference
 * is who put a signature on them.
 */
type Status = 'unsigned' | 'signed' | 'filled' | 'live' | 'waiting' | 'expired' | 'settled';

const LABEL: Record<Status, string> = {
  unsigned: 'not signed',
  signed: 'signed, off chain',
  filled: 'matched',
  live: 'fillable now',
  waiting: 'opens at expiry',
  expired: 'window shut',
  settled: 'filled'
};

const Cell = ({status}: {status: Status}) => (
  <span className={`status status--${status}`}>{LABEL[status]}</span>
);

export const OrderBook = ({
  stored,
  loan,
  now
}: {
  stored: StoredLoan | null;
  loan:
    | {
        punks: number[];
        owed: {start: bigint; end: bigint};
        closesAt: bigint;
        repaid: boolean;
        claimed: boolean;
      }
    | null
    | undefined;
  now: bigint;
}) => {
  const signed = (side: 'lender' | 'borrower') =>
    stored?.orders.some((order) => order.side === side) ?? false;

  const creation = (side: 'lender' | 'borrower'): Status =>
    loan ? 'filled' : signed(side) ? 'signed' : 'unsigned';

  const expired = loan ? now > loan.closesAt : false;

  const repayment: Status = !loan
    ? 'unsigned'
    : loan.repaid
      ? 'settled'
      : expired
        ? 'expired'
        : 'live';

  const fallback: Status = !loan ? 'unsigned' : loan.claimed ? 'settled' : expired ? 'live' : 'waiting';

  const collateral = loan?.punks ?? stored?.terms.collateral ?? [];

  return (
    <table className="book">
      <thead>
        <tr>
          <th>order</th>
          <th>offers</th>
          <th>wants</th>
          <th>who may fill</th>
          <th>state</th>
        </tr>
      </thead>
      <tbody>
        <tr className="row--lender">
          <td>lender creation</td>
          <td>{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</td>
          <td>collateral → escrow</td>
          <td>matched in executeLoan</td>
          <td>
            <Cell status={creation('lender')} />
          </td>
        </tr>
        <tr className="row--borrower">
          <td>borrower creation</td>
          <td>
            <PunkStack ids={collateral} />
          </td>
          <td>{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</td>
          <td>matched in executeLoan</td>
          <td>
            <Cell status={creation('borrower')} />
          </td>
        </tr>
        <tr className="row--minted">
          <td>repayment</td>
          <td>the collateral back</td>
          <td>
            {formatUnits(PRINCIPAL, USDC_DECIMALS)} → {REPAYMENT_USDC} USDC
          </td>
          <td>only the borrower</td>
          <td>
            <Cell status={repayment} />
          </td>
        </tr>
        <tr className="row--minted">
          <td>default</td>
          <td>the collateral</td>
          <td>
            <strong>nothing</strong>
          </td>
          <td>only the lender</td>
          <td>
            <Cell status={fallback} />
          </td>
        </tr>
      </tbody>
    </table>
  );
};
