# Frame packet: 06-guard

## Project inputs

- Project: /Users/valeriohq/conductor/workspaces/pinkwhale-protocol/amsterdam/videos/pinkwhale-three-fields
- Design tokens: /Users/valeriohq/conductor/workspaces/pinkwhale-protocol/amsterdam/videos/pinkwhale-three-fields/frame.md
- RULES_DIR: /Users/valeriohq/.claude/skills/hyperframes-animation/rules

## Assigned storyboard block

## Frame 6 — The guard

- scene: A short scenario strip (Alice repays → borrows again → same ape back in custody → Bob's old default still valid), then the authorizeOrder code with the upstream check lighting up and a revert stamping the claim.
- voiceover: ""
- onscreen: "Alice repays, then borrows again. The same ape is back in custody. Bob's old default order is still valid." / code: "function authorizeOrder(ZoneParameters calldata zoneParameters) …" · "(bool isValidated,, uint256 totalFilled,) = seaport.getOrderStatus(upstreamOrderHash);" · "if (totalFilled != 0) revert UpstreamOrderAlreadyFulfilled();" / "The default names its repayment. If that was filled, the zone reverts — before any token moves."
- duration: 9s
- transition_in: blur-crossfade
- status: outline
- src: compositions/frames/06-guard.html
- type: feature_showcase
- persuasion: Counterexample (here is when it would break) + demonstration
- beat: unease → confidence
- blueprint: compose
- focal: the upstream check inside `authorizeOrder`
- roles: scenario lines = supporting (upper stage) · authorizeOrder code card = foreground subject · revert chip = the one danger accent · caption = supporting
- sfx: none

narrativeRole: Answers the obvious attack a Seaport developer will think of — a stale default order — and shows the one check in the zone that closes it.
keyMessage: A default order is only fillable while the repayment it names is unfilled; the zone enforces it before settlement.


Compose (code-highlight block for the sweep; `waterfall-entry` for the scenario lines).
Scene 1 (0.0–2.8s): three short scenario lines arrive one by one in the upper stage (~0.8s apart): "Alice repays, then borrows again." · "The same ape is back in custody." · "Bob's old default order is still valid." Each 26px Inter `body`; a tiny BAYC→whale glyph pair beside the second line is optional.
Scene 2 (2.8–5.2s): a code card rises below with the verified snippet: `function authorizeOrder(ZoneParameters calldata zoneParameters) …` · `(bool isValidated,, uint256 totalFilled,) = seaport.getOrderStatus(upstreamOrderHash);` · `if (totalFilled != 0) revert UpstreamOrderAlreadyFulfilled();` (wraps allowed, never truncated). A highlight band sweeps to the `getOrderStatus` line, then to the `if` line; the rest dims to ~50% (`code-highlight`).
Scene 3 (5.2–6.6s): a chip stamps beside the `if` line: `revert UpstreamOrderAlreadyFulfilled()` in `danger` on a pale danger tint (opacity + scale 0.96→1, strong ease-out — no shake).
Scene 4 (6.6–9.0s): caption "The default names its repayment. If that was filled, the zone reverts — before any token moves." fades up in the footnote zone; hold.

## Selected motion rule: waterfall-entry

---
name: waterfall-entry
description: Staggered ARRIVAL cascade — words/elements whip in from below (one consistent direction), each starting before the previous settles, an accelerating wave that resolves into a composed layout. Title cards, segment openers, list/feature intros. Opacity is BINARY 0→1 via tl.set — never fade an arrival.
metadata:
  tags: entrance, cascade, stagger, kinetic-text, title-card, segment-opener, arrival, waterfall, whip
---

# Waterfall Entry

Staggered ARRIVAL cascade: words/elements whip in from below (one consistent direction),
each starting before the previous settles — an accelerating wave that resolves into a
composed layout. Title cards, segment openers, list/feature intros.

**This is an in-scene arrival, not a seam.** Its seam sibling is the waterfall CUT
(`cut-the-curve` doctrine skill, `seams/waterfall-cut.md`); do not mix their rules:

|               | Entry (this rule — arrival)                   | Waterfall Cut (seam)                                      |
| ------------- | --------------------------------------------- | --------------------------------------------------------- |
| Opacity       | BINARY 0→1 via `tl.set` at entry — never fade | ignites at 0.35 mid-path — the fade IS the velocity trick |
| Axis default  | Y, from below                                 | X, riding the current                                     |
| Outgoing side | none                                          | words ramp out on mirrored power4.in                      |

## Choreography

- **Overlap, don't queue** — next element starts within ±2 frames of the previous
  settling; gaps SHRINK across the cascade; the last element snaps.
- **Velocity varies by weight** — heavy/anchor elements travel further and longer;
  light words/punctuation snap in tight:

| Parameter | Anchor/heavy | Normal word | Light/punctuation |
| --------- | ------------ | ----------- | ----------------- |
| Y offset  | 60–80px      | 40–50px     | 30–48px           |
| Duration  | 0.16–0.20s   | 0.13–0.16s  | 0.10–0.13s        |
| Overlap   | 0–2f gap     | 1f overlap  | 1–2f overlap      |

- Ease `power4.out` (`expo.out` for extra snap); never `.inOut` on an entry.
- One direction per cascade.
- Split the FINAL word into fragments to extend the climax; fragments travel further.
- Post-settle, the group usually slides to make room for the next beat — that's
  [nudge-curve.md](nudge-curve.md).

## JS

Each element: `tl.set` (instant reveal + offset) then `tl.to` (whip to rest).
`nextStart = prevStart + prevDuration − (overlapFrames × F)`; +overlap = cascade,
−overlap = deliberate gap. CSS: elements start `opacity: 0; display: inline-block`.

```js
var F = 1 / 60;
var t0 = 0.1;
// anchor (heaviest): biggest travel, longest settle
tl.set("#el-1", { opacity: 1, y: 80 }, t0);
tl.to("#el-1", { y: 0, duration: 0.18, ease: "power4.out" }, t0);
// normal word: 2 frames after the anchor finishes
var t1 = t0 + 0.18 + 2 * F;
tl.set("#el-2", { opacity: 1, y: 45 }, t1);
tl.to("#el-2", { y: 0, duration: 0.15, ease: "power4.out" }, t1);
// light word: 1 frame BEFORE the previous finishes (overlap)
var t2 = t1 + 0.15 - F;
tl.set("#el-3", { opacity: 1, y: 40 }, t2);
tl.to("#el-3", { y: 0, duration: 0.14, ease: "power4.out" }, t2);
// split final-word fragments: tightest overlap, extra travel (lighter)
var t3 = t2 + 0.14 - F;
tl.set("#frag-a", { opacity: 1, y: 70 }, t3);
tl.to("#frag-a", { y: 0, duration: 0.16, ease: "power4.out" }, t3);
var t4 = t3 + 0.14 - F;
tl.set("#frag-b", { opacity: 1, y: 70 }, t4);
tl.to("#frag-b", { y: 0, duration: 0.15, ease: "power4.out" }, t4);
// punctuation: lightest, fastest
var t5 = t4 + 0.13 - 2 * F;
tl.set("#dot", { opacity: 1, y: 48 }, t5);
tl.to("#dot", { y: 0, duration: 0.12, ease: "power4.out" }, t5);
```

## Anti-patterns

| Don't                                                  | Instead                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Queued entries (each waits for the previous to settle) | Overlap ±1–2 frames — the cascade is a wave, not a queue                          |
| Same offset/duration for every cascade element         | Vary by weight: anchors travel further, punctuation snaps                         |
| Gradual opacity fade on an arrival                     | Binary 0→1 via `tl.set` — fading fights the snap (seam cuts fade; arrivals don't) |
