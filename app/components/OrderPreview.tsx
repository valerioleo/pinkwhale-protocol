'use client';

import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC} from '../lib/loan';

const usdc = (amount: bigint) => formatUnits(amount, USDC_DECIMALS);

/**
 * What each side is about to sign.
 *
 * The two are not mirror images, and the difference is the point: the borrower
 * names the punk they are putting up, while the lender names none at all. A
 * criteria item saying "any token in this collection" is what makes the lender's
 * order a standing offer rather than a reply to one particular borrower.
 */
export const OrderPreview = ({collateral, signed = false}: {collateral: number[]; signed?: boolean}) => (
  <div className={`preview${signed ? ' preview--signed' : ''}`}>
    <div className="preview-side preview-side--borrower">
      <span className="preview-role">
        borrower {signed ? <b>signed ✓</b> : 'signs'}
      </span>
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
      <span className="preview-role">
        lender {signed ? <b>signed ✓</b> : 'signs'}
      </span>
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
