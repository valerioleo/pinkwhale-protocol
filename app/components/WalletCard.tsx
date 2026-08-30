'use client';

import {Blobatar} from '@blobatar/react';

import {Amount} from './Amount';
import {LedgerHead, LedgerRow} from './Ledger';
import {PunkStack} from './PunkStack';
import type {Holdings} from '../lib/holdings';
import {PERSONA_HUE} from '../lib/personas';
import {explorerUrl} from '../lib/txLog';

const short = (address: string) => `${address.slice(0, 10)}…${address.slice(-4)}`;

/** What one persona is and what it holds, as a two-line statement. */
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
  <div className="wallet">
    <LedgerHead
      avatar={<Blobatar name={address} size={76} hue={PERSONA_HUE[persona]} />}
      name={persona}
      under={
        <a href={explorerUrl(address, 'address')} target="_blank" rel="noreferrer">
          {short(address)} →
        </a>
      }
    />

    <LedgerRow label="USDC">
      <Amount value={holdings.usdc} animated={false} unit={false} />
    </LedgerRow>

    <LedgerRow label="CryptoPunks">
      <span className="count-and-stack">
        {holdings.punks.length}
        <PunkStack ids={holdings.punks} size={34} />
      </span>
    </LedgerRow>

    {funding ? <p className="wallet-note">funding…</p> : null}
  </div>
);
