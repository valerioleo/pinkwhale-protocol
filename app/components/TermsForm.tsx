'use client';

import {Punk} from './Punk';
import {apr, DURATIONS, PRINCIPAL, REPAYMENT_RANGE, type LoanTerms} from '../lib/loan';
import {USDC_DECIMALS} from '../lib/chain';
import {formatUnits} from 'viem';

/**
 * Step 3's controls. Principal is fixed and everything else is bounded, so no
 * setting here can produce an order that reverts for a boring reason.
 */
export const TermsForm = ({
  owned,
  terms,
  onChange
}: {
  owned: number[];
  terms: LoanTerms;
  onChange: (next: LoanTerms) => void;
}) => {
  const toggle = (id: number) =>
    onChange({
      ...terms,
      collateral: terms.collateral.includes(id)
        ? terms.collateral.filter((held) => held !== id)
        : [...terms.collateral, id]
    });

  const flat = terms.repaymentUsdc === Number(formatUnits(PRINCIPAL, USDC_DECIMALS));

  return (
    <div className="terms">
      <label className="field">
        <span className="field-label">pledge</span>
        <span className="pledge">
          {owned.map((id) => (
            <button
              key={id}
              type="button"
              className={`pledge-item${terms.collateral.includes(id) ? ' pledge-item--on' : ''}`}
              onClick={() => toggle(id)}
              aria-pressed={terms.collateral.includes(id)}
            >
              <Punk id={id} scale={2} />
              <span>#{id}</span>
            </button>
          ))}
        </span>
      </label>

      <label className="field">
        <span className="field-label">borrow</span>
        <span className="fixed-amount">{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</span>
        <span className="hint hint--inline">fixed, so the demo cannot mis-price itself</span>
      </label>

      <label className="field">
        <span className="field-label">repay</span>
        <input
          type="range"
          min={REPAYMENT_RANGE.min}
          max={REPAYMENT_RANGE.max}
          step={REPAYMENT_RANGE.step}
          value={terms.repaymentUsdc}
          onChange={(event) => onChange({...terms, repaymentUsdc: Number(event.target.value)})}
        />
        <span className="fixed-amount">{terms.repaymentUsdc} USDC</span>
        <span className="hint hint--inline">
          {flat ? 'a flat fee of nothing' : `${apr(terms).toFixed(0)}% a year, accruing by the second`}
        </span>
      </label>

      <div className="field">
        <span className="field-label">within</span>
        <span className="seg">
          {DURATIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className={terms.durationSeconds === option.seconds ? 'on' : ''}
              onClick={() => onChange({...terms, durationSeconds: option.seconds})}
            >
              {option.label}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
};
