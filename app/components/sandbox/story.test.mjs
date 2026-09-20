import assert from 'node:assert/strict';
import {test} from 'node:test';

import {ASSETS, HOLDERS, STEPS} from './story.ts';

const frames = STEPS.flatMap((step, index) =>
  step.frames.map((frame, order) => ({frame, where: `step ${index + 1}, moment ${order + 1}`}))
);

const held = (frame) => HOLDERS.flatMap(({id}) => frame.holdings[id]);

test('every asset is in exactly one place at every moment', () => {
  // The invariant the whole figure rests on, and the one the hi-fi itself loses:
  // its step 04 panel lists BAYC #8817 under Pinkwhale *and* under Bob. An asset
  // in two columns is two assets, and a chip animating between them is a lie.
  for (const {frame, where} of frames) {
    const seen = held(frame);

    assert.deepEqual([...new Set(seen)], seen, `${where} holds one asset in two columns`);
  }
});

test('nothing is held that has not been named', () => {
  for (const {frame, where} of frames) {
    for (const id of held(frame)) assert.ok(ASSETS[id], `${where}: unknown asset ${id}`);
  }
});

test('repayment happens in the order the contract enforces', () => {
  // The debt appears, it is paid, and only then is the collateral released.
  // Releasing it alongside the payment would draw a swap, not a repayment — and
  // would also be a lie about Seaport, which frees the ape *because* it was paid.
  const [owes, paid, released] = STEPS[2].frames;

  assert.deepEqual(owes.holdings.alice, ['usdc'], 'the debt should appear on Alice first');
  assert.equal(owes.usdc, '110 USDC');
  assert.deepEqual(owes.holdings.pinkwhale, ['ape'], 'the ape is still in custody while she owes');

  assert.deepEqual(paid.holdings.bob, ['usdc'], 'the money reaches Bob next');
  assert.deepEqual(paid.holdings.pinkwhale, ['ape'], 'and the ape has still not moved');

  assert.deepEqual(released.holdings.alice, ['ape'], 'only then does the ape come back');
  assert.deepEqual(released.holdings.bob, ['usdc'], 'and Bob keeps what he was paid');
});

test('the USDC keeps its identity while its amount changes', () => {
  // One pile, never two. If a step ever held two coin chips the strip would be
  // drawing a second pile into existence rather than letting the first travel.
  for (const {frame, where} of frames) {
    const coins = held(frame).filter((id) => ASSETS[id].kind === 'coin');

    assert.ok(coins.length <= 1, `${where} holds ${coins.length} separate piles of USDC`);
  }
});

test('each step names a move for everything that actually changed', () => {
  // Not a string match on the labels — they are prose. Only that a step which
  // changes the world says so, and a step that says so changes something.
  STEPS.forEach((step, index) => {
    if (index === 0) return;

    const before = STEPS[index - 1].frames.at(-1);
    const after = step.frames.at(-1);

    const changed =
      before.usdc !== after.usdc ||
      HOLDERS.some(({id}) => before.holdings[id].join() !== after.holdings[id].join());

    assert.equal(changed, step.moves.length > 0, `step ${index + 1}: moves and frames disagree`);
  });
});
