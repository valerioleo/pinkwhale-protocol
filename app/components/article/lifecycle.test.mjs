import assert from 'node:assert/strict';
import {test} from 'node:test';
import {amountDue, DAY, HORIZON, initialLoan, loanReducer, TERM} from './lifecycle.ts';

const openAt = (elapsed) => loanReducer(loanReducer(initialLoan, {type: 'open'}), {type: 'advance', elapsed});

test('orders do not exist before matching', () => {
  for (const type of ['repay', 'claim']) assert.equal(loanReducer(initialLoan, {type}), initialLoan);
  assert.equal(loanReducer(initialLoan, {type: 'advance', elapsed: TERM}), initialLoan);
});

test('interest follows the signed amount from opening to expiry', () => {
  assert.equal(amountDue(0), 100);
  assert.equal(amountDue(15 * DAY), 105);
  assert.equal(amountDue(TERM), 110);
  assert.equal(amountDue(HORIZON), 110);
});

test('the exact deadline is exclusive, and default opens one second later', () => {
  assert.equal(loanReducer(openAt(TERM - 1), {type: 'repay'}).status, 'repaid');
  for (const type of ['repay', 'claim']) {
    const result = loanReducer(openAt(TERM), {type});
    assert.equal(result.status, 'open');
    assert.equal(result.notice.code, 'InvalidTime');
  }
  assert.equal(loanReducer(openAt(TERM + 1), {type: 'claim'}).status, 'claimed');
});

test('repayment blocks the old claim even when its time window opens', () => {
  const repaid = loanReducer(openAt(15 * DAY), {type: 'repay'});
  const later = loanReducer(repaid, {type: 'advance', elapsed: HORIZON});
  const result = loanReducer(later, {type: 'claim'});
  assert.equal(result.status, 'repaid');
  assert.equal(result.resolvedAt, 15 * DAY);
  assert.equal(result.notice.code, 'UpstreamOrderAlreadyFulfilled');
  assert.equal(amountDue(result.resolvedAt), 105);
});

test('rewinding the clock cannot repay a claimed loan or settle twice', () => {
  const claimed = loanReducer(openAt(TERM + 1), {type: 'claim'});
  const rewound = loanReducer(claimed, {type: 'advance', elapsed: 0});
  assert.equal(loanReducer(rewound, {type: 'repay'}).status, 'claimed');
  assert.equal(loanReducer(rewound, {type: 'claim'}).notice.code, 'OrderAlreadyFilled');
  assert.deepEqual(loanReducer(claimed, {type: 'reset'}), initialLoan);
});

test('the teaching clock remains inside its valid domain', () => {
  assert.equal(openAt(-10).elapsed, 0);
  assert.equal(openAt(HORIZON + DAY).elapsed, HORIZON);
  assert.equal(openAt(NaN).elapsed, 0);
});
