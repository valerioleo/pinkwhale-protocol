'use client';

import {formatUnits} from 'viem';

import {PunkStack} from './PunkStack';
import {USDC_DECIMALS} from '../lib/chain';
import type {Holdings} from '../lib/holdings';

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export const WalletCard = ({
  persona,
  address,
  holdings,
  funding
}: {
  persona: 'lender' | 'borrower';
  address: string;
  holdings: Holdings;
  funding: boolean;
}) => (
  <div className={`wallet wallet--${persona}`}>
    <div className="wallet-head">
      <span className="wallet-role">{persona}</span>
      <span className="wallet-address">{short(address)}</span>
    </div>

    <dl className="wallet-balances">
      <div>
        <dt>USDC</dt>
        <dd>{formatUnits(holdings.usdc, USDC_DECIMALS)}</dd>
      </div>
      <div>
        <dt>collateral</dt>
        <dd>
          <PunkStack ids={holdings.punks} />
        </dd>
      </div>
    </dl>

    {funding ? <p className="wallet-note">funding…</p> : null}
  </div>
);
