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
  funding,
  onTopUp,
  toppingUp
}: {
  persona: 'lender' | 'borrower';
  address: string;
  holdings: Holdings;
  funding: boolean;
  onTopUp: () => void;
  toppingUp: boolean;
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
        {/* Not "collateral": the lender's punks are ones they claimed, and calling
            them collateral would describe the borrower's side of a loan. */}
        <dt>CryptoPunks</dt>
        <dd>
          <PunkStack ids={holdings.punks} />
        </dd>
      </div>
    </dl>

    <div className="wallet-foot">
      <button className="btn btn--small btn--quiet" onClick={onTopUp} disabled={funding || toppingUp}>
        {toppingUp ? 'Minting…' : 'Mint more'}
      </button>
      {funding ? <span className="wallet-note">funding…</span> : null}
    </div>
  </div>
);
