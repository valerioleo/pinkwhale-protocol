'use client';

import {formatUnits} from 'viem';

import {Pill} from './Pill';
import {USDC_DECIMALS} from '../lib/chain';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC} from '../lib/loan';

/**
 * What the two orders will say, before either is signed.
 *
 * They are the same deal read from opposite ends, which is exactly what
 * `executeLoan` checks: it matches them only if they agree item for item.
 */
export const OrderPreview = ({collateral}: {collateral: number[]}) => (
  <div className="preview">
    <div className="preview-side preview-side--borrower">
      <span className="preview-role">borrower signs</span>
      <p>
        I give{' '}
        <span className="pills">
          {collateral.map((id) => (
            <Pill key={id} punk={id}>
              #{id}
            </Pill>
          ))}
        </span>{' '}
        and want <Pill token="usdc">{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</Pill>
      </p>
      <p className="preview-terms">
        paying back <Pill token="usdc">{REPAYMENT_USDC} USDC</Pill> within {DURATION_LABEL}
      </p>
    </div>

    <div className="preview-side preview-side--lender">
      <span className="preview-role">lender signs</span>
      <p>
        I give <Pill token="usdc">{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</Pill> and want{' '}
        <span className="pills">
          {collateral.map((id) => (
            <Pill key={id} punk={id}>
              #{id}
            </Pill>
          ))}
        </span>{' '}
        held in escrow
      </p>
      <p className="preview-terms">
        repaid <Pill token="usdc">{REPAYMENT_USDC} USDC</Pill> within {DURATION_LABEL}
      </p>
    </div>
  </div>
);
