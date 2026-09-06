'use client';

import {Blobatar} from '@blobatar/react';

import {Amount} from './Amount';
import {LedgerHead, LedgerRow} from './Ledger';
import {PunkStack} from './PunkStack';
import {Skeleton} from './Skeleton';
import type {Balance} from '../lib/holdings';
import {PERSONA_HUE} from '../lib/personas';
import {explorerUrl} from '../lib/txLog';

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

/** What one persona is and what it holds, as a two-line statement. */
export const ActorCard = ({
  persona,
  address,
  holdings,
  funding
}: {
  persona: 'lender' | 'borrower';
  address: string;
  holdings: Balance;
  funding: boolean;
}) => (
  <div className="actor">
    <LedgerHead
      avatar={<Blobatar name={address} size={48} hue={PERSONA_HUE[persona]} />}
      name={persona}
      under={
        <a href={explorerUrl(address, 'address')} target="_blank" rel="noreferrer">
          {short(address)} →
        </a>
      }
    />

    {/* An unread balance is not a zero balance, and rendering it as one tells the
        visitor their brand new actor is empty. */}
    <LedgerRow label="USDC">
      {holdings.loaded ? (
        <Amount value={holdings.usdc} animated={false} unit={false} />
      ) : (
        <Skeleton style={{width: 72, height: 19}} />
      )}
    </LedgerRow>

    <LedgerRow label="CryptoPunks">
      {holdings.loaded ? (
        <span className="count-and-stack">
          {/* Past five the exact figure stops being the point, and five faces is
              already more than anyone counts. */}
          {holdings.punks.length > 5 ? '5+' : holdings.punks.length}
          <PunkStack ids={holdings.punks} size={28} />
        </span>
      ) : (
        <Skeleton style={{width: 58, height: 28}} />
      )}
    </LedgerRow>

    {funding ? <p className="actor-note">funding…</p> : null}
  </div>
);

/** The card's shape, held while the actor itself is still being created. */
export const ActorCardSkeleton = () => (
  <div className="actor">
    <div className="ledger-head">
      <Skeleton style={{width: 48, height: 48, borderRadius: '50%'}} />
      <span className="ledger-titles skeleton-stack">
        <Skeleton style={{width: 92, height: 22}} />
        <Skeleton style={{width: 116, height: 12}} />
      </span>
    </div>

    <LedgerRow label="USDC">
      <Skeleton style={{width: 72, height: 19}} />
    </LedgerRow>

    <LedgerRow label="CryptoPunks">
      <Skeleton style={{width: 58, height: 28}} />
    </LedgerRow>
  </div>
);
