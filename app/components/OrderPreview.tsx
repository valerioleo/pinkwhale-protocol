'use client';

import {Blobatar} from '@blobatar/react';
import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC} from '../lib/loan';
import {PERSONA_HUE, type Personas} from '../lib/personas';

const usdc = (amount: bigint) => formatUnits(amount, USDC_DECIMALS);

/**
 * What each side is about to sign.
 *
 * The two are not mirror images, and the difference is the point: the borrower
 * names the punk they are putting up, while the lender names none at all. A
 * criteria item saying "any token in this collection" is what makes the lender's
 * order a standing offer rather than a reply to one particular borrower.
 */
const Role = ({
  persona,
  personas,
  signed
}: {
  persona: 'lender' | 'borrower';
  personas: Personas;
  signed: boolean;
}) => (
  <span className="preview-role">
    {personas ? <Blobatar name={personas[persona]} size={30} hue={PERSONA_HUE[persona]} /> : null}
    <span>
      {persona} {signed ? <b>signed ✓</b> : 'signs'}
    </span>
  </span>
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
  <div className={`preview${signed ? ' preview--signed' : ''}`}>
    <div className="preview-side preview-side--borrower">
      <Role persona="borrower" personas={personas} signed={signed} />
      <p>
        I give{' '}
        {collateral.length > 0 ? (
          <span className="pills">
            {collateral.map((id) => (
              <Pill key={id} punk={id}>
                #{id}
              </Pill>
            ))}
          </span>
        ) : (
          <Pill punk={0}>a CryptoPunk</Pill>
        )}{' '}
        and want <Pill token="usdc">{usdc(PRINCIPAL)} USDC</Pill>
      </p>
      <p className="preview-terms">
        paying back <Pill token="usdc">{REPAYMENT_USDC} USDC</Pill> within {DURATION_LABEL}
      </p>
    </div>

    <div className="preview-side preview-side--lender">
      <Role persona="lender" personas={personas} signed={signed} />
      <p>
        I give <Pill token="usdc">{usdc(PRINCIPAL)} USDC</Pill> for{' '}
        <Pill punk={collateral[0] ?? 0}>any CryptoPunk</Pill> held in escrow
      </p>
      <p className="preview-terms">
        repaid <Pill token="usdc">{REPAYMENT_USDC} USDC</Pill> within {DURATION_LABEL}
      </p>
    </div>
  </div>
);
