'use client';

import {useId, useReducer, type CSSProperties} from 'react';
import Image from 'next/image';
import {PinkwhaleMark} from './icons';
import {amountDue, DAY, HORIZON, initialLoan, loanReducer, TERM} from './lifecycle';

const labels = {ready: 'Ready to begin', open: 'Loan open', repaid: 'Loan repaid', claimed: 'Collateral claimed'};
const timeLabel = (elapsed: number) => elapsed === TERM + 1 ? 'Expiry + 1 second'
  : elapsed === TERM ? 'At the deadline' : `Day ${Number((elapsed / DAY).toFixed(1))} of 30`;

export function LoanExperiment() {
  const [loan, dispatch] = useReducer(loanReducer, initialLoan);
  const clockId = useId();
  const opened = loan.status !== 'ready';
  const repaid = loan.status === 'repaid';
  const claimed = loan.status === 'claimed';
  const owner = !opened || repaid ? 'borrower' : claimed ? 'lender' : 'pinkwhale';
  const due = amountDue(loan.resolvedAt ?? loan.elapsed);
  const repaymentOpen = opened && !repaid && !claimed && loan.elapsed < TERM;
  const defaultOpen = opened && !repaid && !claimed && loan.elapsed > TERM;

  return <figure className="loan-lab breakout" aria-label="Interactive loan lifecycle">
    <div className="lab-heading">
      <span className="eyebrow">Fig. 01 <span className="lab-heading__separator">/</span> One loan, two futures</span>
      <span className="lab-tag"><span aria-hidden="true">◇</span> Local simulation</span>
    </div>
    <div className="loan-lab__body">
      <div className="loan-terms">
        <span><strong>100</strong> USDC borrowed</span>
        <span><strong>1</strong> Bored Ape as collateral</span>
        <span><strong>30</strong> days to repay</span>
      </div>
      <div className="custody-diagram" data-owner={owner}>
        <div className="custody-person"><span className="actor-letter" aria-hidden="true">B</span>Borrower</div>
        <div className="custody-person custody-person--protocol"><PinkwhaleMark />Pinkwhale</div>
        <div className="custody-person"><span className="actor-letter" aria-hidden="true">L</span>Lender</div>
        <div className="custody-track" aria-hidden="true"><span /><span /><span /></div>
        <div className="collateral-marker" style={{'--owner-position': owner === 'borrower' ? '16.6667%' : owner === 'pinkwhale' ? '50%' : '83.3333%'} as CSSProperties}>
          <Image src="/tokens/bayc.png" alt="BAYC #8817" width={64} height={64} priority />
          <span>BAYC #8817</span>
        </div>
        <span className="custody-caption">{opened ? (repaid ? 'Collateral returned' : 'Received 100 USDC') : 'Puts up an NFT'}</span>
        <span className="custody-caption">{owner === 'pinkwhale' ? 'Holding the collateral' : 'Holds it during the loan'}</span>
        <span className="custody-caption">{claimed ? 'Collateral claimed' : repaid ? `Received ${due.toFixed(2)} USDC` : opened ? 'Lent 100 USDC' : 'Puts up 100 USDC'}</span>
      </div>
      {!opened ? <div className="loan-start">
        <p>Two people sign. One transaction opens the loan.</p>
        <button className="essay-button" onClick={() => dispatch({type: 'open'})}>Match orders & open loan <span aria-hidden="true">→</span></button>
      </div> : <div className="loan-clock">
        <div className="loan-clock__heading">
          <label htmlFor={clockId}>{timeLabel(loan.elapsed)}</label>
          <span>{repaid || claimed ? 'Explore the clock; the loan stays settled' : 'Drag to move time'}</span>
        </div>
        <div className="loan-clock__track">
          <div className="loan-clock__window" aria-hidden="true"><span>Repayment window</span><span>Default</span></div>
          <input id={clockId} type="range" min={0} max={HORIZON} step={1} value={loan.elapsed} aria-valuetext={timeLabel(loan.elapsed)}
            onChange={(event) => dispatch({type: 'advance', elapsed: Number(event.target.value)})} />
        </div>
        <div className="loan-clock__presets" aria-label="Jump to a moment">
          <span>Jump to</span>
          <button onClick={() => dispatch({type: 'advance', elapsed: 0})}>Day 0</button>
          <button onClick={() => dispatch({type: 'advance', elapsed: 15 * DAY})}>Day 15</button>
          <button onClick={() => dispatch({type: 'advance', elapsed: TERM})}>Deadline</button>
          <button onClick={() => dispatch({type: 'advance', elapsed: TERM + 1})}>Expiry + 1s</button>
        </div>
      </div>}
      <div className="future-orders" data-pending={!opened}>
        <div className="future-order" data-active={repaymentOpen} data-settled={repaid}>
          <div className="future-order__head"><span className="eyebrow">01 / Repayment</span><span className="order-state">{!opened ? 'Written at opening' : repaid ? 'Filled ✓' : claimed ? 'Loan closed' : repaymentOpen ? 'Open' : 'Expired'}</span></div>
          <p className="future-order__amount">{due.toFixed(2)} <span>USDC</span></p>
          <p>Borrower pays the lender.<br />The ape goes home.</p>
          <button className="essay-button essay-button--quiet" disabled={!opened} onClick={() => dispatch({type: 'repay'})}>Repay loan <span aria-hidden="true">↗</span></button>
        </div>
        <div className="future-order" data-active={defaultOpen} data-unavailable={repaid} data-settled={claimed}>
          <div className="future-order__head"><span className="eyebrow">02 / Default</span><span className="order-state">{!opened ? 'Written at opening' : claimed ? 'Filled ✓' : repaid ? 'Blocked by repayment' : defaultOpen ? 'Open' : 'Waiting'}</span></div>
          <p className="future-order__amount">0 <span>USDC</span></p>
          <p>Lender pays nothing.<br />The ape becomes theirs.</p>
          <button className="essay-button essay-button--quiet" disabled={!opened} onClick={() => dispatch({type: 'claim'})}>Claim collateral <span aria-hidden="true">↗</span></button>
        </div>
      </div>
      <div className="loan-feedback" aria-live="polite" aria-atomic="true" data-blocked={loan.notice?.blocked ?? false}>
        {loan.notice ? <><strong>{loan.notice.title}</strong><p>{loan.notice.detail}</p>{loan.notice.code && <code>{loan.notice.code}</code>}</>
          : <><strong>{opened ? (repaid || claimed ? 'This ending is already written.' : 'Same collateral. Only one order can be filled.') : 'You control both sides of this example.'}</strong><p>{opened ? 'Try an action at this moment. Seaport checks the time; Pinkwhale checks the permission.' : 'Open the loan, move the clock, and see which future becomes possible. No wallet needed.'}</p></>}
      </div>
    </div>
    <figcaption className="lab-footer"><span><span className={`state-dot${repaid || claimed ? ' state-dot--settled' : ''}`} />{labels[loan.status]}</span><button onClick={() => dispatch({type: 'reset'})} disabled={!opened}>Start again <span aria-hidden="true">↺</span></button></figcaption>
  </figure>;
}
