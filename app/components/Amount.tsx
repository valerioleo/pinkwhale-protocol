'use client';

import NumberFlow from '@number-flow/react';

import {USDC_DECIMALS} from '../lib/chain';

/**
 * A USDC figure, with the pennies played down.
 *
 * Interest here accrues by the second, so the fraction is where the movement
 * actually is — worth showing, but not worth reading. The whole part animates and
 * the fraction trails behind it in grey.
 */
export const Amount = ({
  value,
  animated = true,
  unit = true
}: {
  value: bigint;
  animated?: boolean;
  unit?: boolean;
}) => {
  const scale = 10n ** BigInt(USDC_DECIMALS);
  const whole = value / scale;
  const fraction = ((value % scale) * 100n) / scale;

  return (
    <span className="amount-big">
      <NumberFlow value={Number(whole)} format={{maximumFractionDigits: 0}} animated={animated} />
      <span className="amount-fraction">.{String(fraction).padStart(2, '0')}</span>
      {unit ? <span className="amount-unit">USDC</span> : null}
    </span>
  );
};
