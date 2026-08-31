'use client';

import {Blobatar} from '@blobatar/react';
import {formatUnits} from 'viem';

import {Amount} from './Amount';
import {LedgerHead, LedgerNote, LedgerRow} from './Ledger';
import {PunkStack} from './PunkStack';
import {COLLECTION_SIZE} from '../lib/punks';
import {USDC_DECIMALS} from '../lib/chain';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC} from '../lib/loan';
import {PERSONA_HUE, type Personas} from '../lib/personas';

const interest = REPAYMENT_USDC - Number(formatUnits(PRINCIPAL, USDC_DECIMALS));

const SHOWCASE = 5;

/**
 * Five arbitrary punks to stand behind the word "any".
 *
 * Drawn from the lender's own address rather than at random, so the row holds
 * still between renders: what the picture is saying is that the identity is
 * unspecified, and a row that reshuffles says something else entirely.
 */
const showcasePunks = (seed?: string) =>
  Array.from({length: SHOWCASE}, (_, index) =>
    Number(((BigInt(seed ?? '0x0') >> BigInt(index * 17)) % BigInt(COLLECTION_SIZE)))
  );

/**
 * What each side is about to sign, read as a statement of the deal.
 *
 * The two are not mirror images and the difference is the point: the borrower
 * names the punk they are putting up, the lender names none at all. An
 * `ERC721_WITH_CRITERIA` item saying "any token in this collection" is what makes
 * the lender's order something that could sit in a book and wait.
 */
const Money = () => (
  <>
    <LedgerRow label="USDC">
      <Amount value={PRINCIPAL} animated={false} unit={false} />
    </LedgerRow>
    <LedgerNote label="Plus interest">Up to {interest} USDC</LedgerNote>
    <LedgerNote label="Duration">{DURATION_LABEL}</LedgerNote>
  </>
);

const Side = ({
  persona,
  personas,
  signed,
  children
}: {
  persona: 'lender' | 'borrower';
  personas: Personas;
  signed: boolean;
  children: React.ReactNode;
}) => (
  <div className={`side side--${persona}`}>
    <LedgerHead
      avatar={
        personas ? <Blobatar name={personas[persona]} size={44} hue={PERSONA_HUE[persona]} /> : null
      }
      name={persona}
      under={signed ? <span className="signed">signed ✓</span> : undefined}
    />
    {children}
  </div>
);

export const OrderPreview = ({
  collateral,
  personas,
  signed = false
}: {
  collateral: number[];
  personas: Personas;
  signed?: boolean;
}) => (
  <div className="preview">
    <Side persona="borrower" personas={personas} signed={signed}>
      <span className="ledger-caption">Offers</span>
      <LedgerRow label="CryptoPunks">
        {collateral.length > 0 ? (
          <span className="count-and-stack">
            #{collateral[0]}
            <PunkStack ids={collateral} size={28} />
          </span>
        ) : (
          <span className="muted">one of yours</span>
        )}
      </LedgerRow>

      <span className="ledger-caption">For</span>
      <Money />
    </Side>

    <Side persona="lender" personas={personas} signed={signed}>
      <span className="ledger-caption">Offers</span>
      <Money />

      <span className="ledger-caption">For</span>
      <LedgerRow label="CryptoPunks">
        <span className="count-and-stack">
          any
          <PunkStack ids={showcasePunks(personas?.lender)} max={SHOWCASE} size={28} />
        </span>
      </LedgerRow>
    </Side>
  </div>
);
