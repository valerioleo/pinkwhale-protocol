'use client';

import {Blobatar} from '@blobatar/react';
import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {PunkStack} from './PunkStack';
import {USDC_DECIMALS} from '../lib/chain';
import type {Holdings} from '../lib/holdings';
import {PERSONA_HUE} from '../lib/personas';
import {explorerUrl} from '../lib/txLog';

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
      <span className="wallet-who">
        {/* Seeded on the address, so the same wallet always wears the same face. */}
        <Blobatar name={address} size={38} hue={PERSONA_HUE[persona]} />
        <span className="wallet-role">{persona}</span>
      </span>
      <a
        className="wallet-address"
        href={explorerUrl(address, 'address')}
        target="_blank"
        rel="noreferrer"
      >
        {short(address)} ↗
      </a>
    </div>

    <dl className="wallet-balances">
      <div>
        <dt>balance</dt>
        <dd>
          <Pill token="usdc">{formatUnits(holdings.usdc, USDC_DECIMALS)} USDC</Pill>
        </dd>
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
