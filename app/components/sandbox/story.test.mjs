import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ASSETS, HOLDERS, STEPS} from './story.ts';

const held = (step) => HOLDERS.flatMap(({id}) => step.holdings[id]);

test('every asset is in exactly one place at every step', () => {
  // The invariant the whole figure rests on, and the one the design itself lost:
  // its step 04 panel lists BAYC #8817 under Pinkwhale *and* under Bob. An asset
  // in two columns is two assets, and the chip animating between them is a lie.
  for (const [index, step] of STEPS.entries()) {
    const seen = held(step);

    assert.deepEqual(
      [...new Set(seen)],
      seen,
      `step ${index + 1} holds the same asset in two columns`
    );
  }
});

test('nothing is held that has not been named', () => {
  for (const step of STEPS) {
    for (const id of held(step)) assert.ok(ASSETS[id], `unknown asset ${id}`);
  }
});

test('the repayment only exists while it is being paid', () => {
  // It appears on Alice at step 03 and lands on Bob in the same step. Anywhere
  // else and the strip would be showing money that has not been borrowed yet.
  const carrying = STEPS.map((step) => held(step).includes('repayment'));

  assert.deepEqual(carrying, [false, false, true, false]);
});

test('each step names a move for every asset that actually moved', () => {
  // Not a string match on the labels — they are prose. Only that a step which
  // changes who holds what says so, and a step that says so changes something.
  STEPS.forEach((step, index) => {
    if (index === 0) return;

    const before = STEPS[index - 1];
    const moved = HOLDERS.some(
      ({id}) => step.holdings[id].join() !== before.holdings[id].join()
    );

    assert.equal(
      moved,
      step.moves.length > 0,
      `step ${index + 1}: holdings and declared moves disagree`
    );
  });
});
