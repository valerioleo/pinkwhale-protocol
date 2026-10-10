'use client';

import {useId, useState} from 'react';

const CASES = [
  {label: 'A stranger tries to repay', context: 'Day 15. A stranger offers the money and tries to take the ape.', stop: 1, error: 'ZoneHashMismatch', explanation: 'Paying is not enough. The repayment order belongs to the borrower, and the caller does not match the address committed to its zoneHash.', test: 'test_repayment_byWrongActor_revertsWithZoneHashMismatch'},
  {label: 'The lender claims early', context: 'Day 15. The loan is still open. The lender tries to take the collateral.', stop: 0, error: 'InvalidTime', explanation: 'The default order has not opened. Seaport rejects it before Pinkwhale has to check anything.', test: 'test_claimDefaultBeforeExpiry_revertsWithSeaportInvalidTime'},
  {label: 'An old claim comes back', context: 'The loan was repaid. The borrower posts the same ape for a new loan. The old lender tries their old claim.', stop: 2, error: 'UpstreamOrderAlreadyFulfilled', explanation: 'The old claim still points at the old repayment order. That order was filled, so Pinkwhale refuses the claim before the new collateral can move.', test: 'test_defaultOrderFromRepaidLoan_cannotClaimLaterCollateral'}
] as const;
const CHECKS = ['Is the window open?', 'Is the caller allowed?', 'Is repayment unfilled?'];

export function GuardExperiment() {
  const [selected, setSelected] = useState(2);
  const [ran, setRan] = useState(false);
  const group = useId();
  const scenario = CASES[selected];
  return <figure className="guard-lab breakout" aria-label="Explore the loan's guards">
    <div className="lab-heading"><span className="eyebrow">Fig. 03 <span className="lab-heading__separator">/</span> Try the wrong thing</span><span className="lab-tag">Simulated checks</span></div>
    <div className="guard-lab__body">
      <fieldset className="guard-cases"><legend>Choose a scenario</legend>
        {CASES.map((item, index) => <label key={item.label} data-selected={selected === index}>
          <input type="radio" name={group} checked={selected === index} onChange={() => {setSelected(index); setRan(false);}} />
          <span>{item.label}</span><span aria-hidden="true">↗</span>
        </label>)}
      </fieldset>
      <div className="guard-experiment">
        <p className="guard-context">{scenario.context}</p>
        <ol className="guard-checks">{CHECKS.map((check, index) => <li key={check} data-state={!ran ? 'pending' : index < scenario.stop ? 'passed' : index === scenario.stop ? 'blocked' : 'skipped'}>
          <span className="guard-check__icon" aria-hidden="true">{ran && index <= scenario.stop ? (index === scenario.stop ? '×' : '✓') : String(index + 1).padStart(2, '0')}</span>
          <span>{check}</span><small>{!ran ? 'Waiting' : index < scenario.stop ? 'Pass' : index === scenario.stop ? 'Blocked' : 'Not reached'}</small>
        </li>)}</ol>
        <button className="essay-button essay-button--quiet" onClick={() => setRan(true)}>Try this transaction <span aria-hidden="true">→</span></button>
      </div>
    </div>
    <div className="guard-result" aria-live="polite" aria-atomic="true">{ran ? <>
      <strong>Blocked. The collateral stays put.</strong><p>{scenario.explanation}</p><code>{scenario.error}</code>
    </> : <><strong>Three checks. No collateral moves until they pass.</strong><p>Follow the transaction through Seaport’s time check and Pinkwhale’s two permissions.</p></>}</div>
    <figcaption className="lab-footer"><span>These cases are covered by the Solidity tests.</span><a href="https://github.com/valerioleo/pinkwhale-protocol/blob/main/test/Guards.t.sol" title={scenario.test}>Read the tests ↗</a></figcaption>
  </figure>;
}
