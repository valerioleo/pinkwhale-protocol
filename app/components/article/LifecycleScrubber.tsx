'use client';

import './pinkwhale.css';

import {useState} from 'react';

import {TokenIcon} from './icons';
import {DURATION, EXPIRY, INTEREST, PRINCIPAL, T0, TOKEN_ID} from './loan';

type Outcome = {ok: boolean; message: string};

/**
 * The whole lifecycle on one axis. Start with two signed orders, match them, then
 * drag the playhead and try to fulfil as either actor.
 *
 * The checks run in the same order the chain runs them: Seaport's time window
 * first, then the zone's caller binding, then the upstream order. The revert
 * names are the ones the Foundry suite asserts on.
 *
 * The axis is drawn 50/50. The default order actually runs to type(uint256).max,
 * so no honest scale exists; the slider maps its right half to the five days
 * after expiry, and the readout reports the real timestamp either way.
 */
const TAIL = 5n * 24n * 60n * 60n;

/** Slider position (0 to 1000) to a real timestamp, piecewise around expiry. */
const toTimestamp = (position: number) => {
  if (position <= 500) return T0 + (DURATION * BigInt(position)) / 500n;
  return EXPIRY + 1n + (TAIL * BigInt(position - 500)) / 500n;
};

const principal = `${Number(PRINCIPAL) / 1e6} USDC`;
const usdc = (amount: bigint) => `${(Number(amount) / 1e6).toFixed(2)} USDC`;

/**
 * What the borrower owes right now. Seaport interpolates a consideration item
 * linearly from `startAmount` to `endAmount` across the order's window, and the
 * repayment order carries the lender's terms untouched, so the interest simply
 * grows with the clock. Nothing in Pinkwhale computes it.
 */
const amountDue = (now: bigint) => {
  if (now <= T0) return PRINCIPAL;
  if (now >= EXPIRY) return PRINCIPAL + INTEREST;
  return PRINCIPAL + (INTEREST * (now - T0)) / DURATION;
};

export const LifecycleScrubber = () => {
  const [matched, setMatched] = useState(false);
  const [position, setPosition] = useState(300);
  const [repaid, setRepaid] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const now = toTimestamp(position);
  const due = amountDue(now);
  const accrued = due - PRINCIPAL;
  // Seaport treats endTime as exclusive, so at exactly EXPIRY neither window is open.
  const inRepaymentWindow = now >= T0 && now < EXPIRY;
  const inDefaultWindow = now >= EXPIRY + 1n;
  const settled = repaid || claimed;

  const match = () => {
    setMatched(true);
    setOutcome({
      ok: true,
      message:
        'LoanExecuted. The ape is in Pinkwhale custody, the borrower has the 100 USDC, and Pinkwhale has just minted the two orders below.'
    });
  };

  const fulfilAsBorrower = () => {
    if (repaid) return setOutcome({ok: false, message: 'OrderAlreadyFilled. This loan is closed.'});
    if (!inRepaymentWindow) {
      return setOutcome({
        ok: false,
        message: `InvalidTime(${T0}, ${EXPIRY}). Seaport rejects it before the zone is even called.`
      });
    }
    setRepaid(true);
    setOutcome({
      ok: true,
      message: `LoanRepaid. The borrower paid ${usdc(due)}, being ${usdc(PRINCIPAL)} of principal plus ${usdc(accrued)} of interest accrued so far, and the ape went home.`
    });
  };

  const fulfilAsLender = () => {
    if (claimed) return setOutcome({ok: false, message: 'OrderAlreadyFilled. Already claimed.'});
    if (!inDefaultWindow) {
      return setOutcome({
        ok: false,
        message: `InvalidTime(${EXPIRY + 1n}, type(uint256).max). The default order has not opened yet.`
      });
    }
    if (repaid) {
      return setOutcome({
        ok: false,
        message:
          'UpstreamOrderAlreadyFulfilled. authorizeOrder sees that the repayment order was filled and turns the claim away before anything moves.'
      });
    }
    setClaimed(true);
    setOutcome({
      ok: true,
      message: 'DefaultedCollateralClaimed. The lender takes the collateral and pays nothing for it.'
    });
  };

  const reset = () => {
    setMatched(false);
    setRepaid(false);
    setClaimed(false);
    setOutcome(null);
    setPosition(300);
  };

  return (
    <div className="pw-widget pw-scrubber">
      <div className="pw-widget__body">
        {matched ? (
          <div className="pw-custody" data-settled={settled}>
            <TokenIcon kind="bayc" />
            <span>
              BAYC #{TOKEN_ID.toString()}{' '}
              {repaid
                ? 'is back with the borrower'
                : claimed
                  ? 'now belongs to the lender'
                  : 'is in Pinkwhale custody'}
            </span>
          </div>
        ) : (
          <CreationOrders />
        )}

        <div className="pw-axis" data-pending={!matched}>
          <div className={`pw-bar pw-bar--repayment${repaid ? ' pw-bar--filled' : ''}`}>
            <strong>REPAYMENT</strong>
            <span className="pw-bar__line">
              <TokenIcon kind="bayc" /> back to the borrower for <TokenIcon kind="usdc" />{' '}
              {matched ? usdc(due) : '100.00 to 110.00 USDC'}
            </span>
            <span className="pw-bar__time">principal + interest, accruing to expiry</span>
          </div>

          {/* The gap is real: the default order starts at endTime + 1. */}
          <div className="pw-gap" title="endTime + 1 second" />

          <div
            className={`pw-bar pw-bar--default${repaid ? ' pw-bar--dead' : ''}${
              claimed ? ' pw-bar--filled' : ''
            }`}
          >
            <strong>DEFAULT</strong>
            <span className="pw-bar__line">
              <TokenIcon kind="bayc" /> to the lender, for free
            </span>
            <span className="pw-bar__time">expiry + 1 to forever</span>
          </div>

          {matched ? <div className="pw-playhead" style={{left: `${position / 10}%`}} /> : null}
        </div>

        {matched ? (
          <>
            <input
              className="pw-slider"
              type="range"
              min={0}
              max={1000}
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              aria-label="block.timestamp"
            />

            <dl className="pw-kv">
              <dt>block.timestamp</dt>
              <dd className="pw-hex">{now.toString()}</dd>
              <dt>amount due now</dt>
              <dd className="pw-hex">
                {usdc(due)}
                <span className="pw-due"> ({usdc(PRINCIPAL)} principal + {usdc(accrued)} interest)</span>
              </dd>
              <dt>repayment order</dt>
              <dd>
                {repaid
                  ? 'filled'
                  : inRepaymentWindow
                    ? 'fulfillable by the borrower'
                    : 'outside its window'}
              </dd>
              <dt>default order</dt>
              <dd>
                {repaid
                  ? 'dead, because its upstream order was filled'
                  : claimed
                    ? 'filled'
                    : inDefaultWindow
                      ? 'fulfillable by the lender'
                      : 'not open yet'}
              </dd>
            </dl>
          </>
        ) : (
          <p className="pw-pending">
            Neither order exists yet. Pinkwhale mints them in the same transaction that matches the
            two signed orders above.
          </p>
        )}

        <div className="pw-actions">
          {matched ? (
            <>
              <button className="pw-button pw-button--borrower" onClick={fulfilAsBorrower}>
                Fulfil as Borrower
              </button>
              <button className="pw-button pw-button--lender" onClick={fulfilAsLender}>
                Fulfil as Lender
              </button>
            </>
          ) : (
            <button className="pw-button pw-button--match" onClick={match}>
              Match the two orders
            </button>
          )}
          <button className="pw-button pw-button--ghost" onClick={reset}>
            Reset
          </button>
        </div>

        {outcome ? (
          <p className={outcome.ok ? 'pw-verdict pw-verdict--ok' : 'pw-verdict pw-verdict--bad'}>
            {outcome.message}
          </p>
        ) : null}
      </div>
    </div>
  );
};

/** The two signed orders, before anyone has matched them. */
const CreationOrders = () => (
  <div className="pw-creation">
    <div className="pw-creation__order pw-creation__order--lender">
      <span className="pw-creation__who">Lender signed</span>
      <span className="pw-creation__flow">
        <TokenIcon kind="usdc" /> {principal}
        <span className="pw-creation__arrow">for</span>
        <TokenIcon kind="bayc" /> BAYC #{TOKEN_ID.toString()}
      </span>
    </div>
    <div className="pw-creation__order pw-creation__order--borrower">
      <span className="pw-creation__who">Borrower signed</span>
      <span className="pw-creation__flow">
        <TokenIcon kind="bayc" /> BAYC #{TOKEN_ID.toString()}
        <span className="pw-creation__arrow">for</span>
        <TokenIcon kind="usdc" /> {principal}
      </span>
    </div>
  </div>
);
