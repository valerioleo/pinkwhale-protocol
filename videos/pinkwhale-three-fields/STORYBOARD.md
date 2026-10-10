---
format: 1080x1080
duration: 42s
message: "A Pinkwhale loan is an ordinary Seaport order plus three fields — and the liquidation engine is an empty array."
arc: concept-explainer with process
audience: Developers who know Seaport / OpenSea orders
mode: collaborative
music: none
---

<!--
Silent video (music: none + no SCRIPT.md). Every frame's words are on screen: `onscreen`
holds the exact copy, in reveal order. Code on screen is verified against
contracts/Pinkwhale (see capture/extracted/visible-text.txt § SOURCE 3) — do not paraphrase
identifiers. One consistent stage: a single light order card (frame.md § Pinkwhale adaptation)
that is edited, matched, and split across frames 1–5.
-->


## Video direction

**Stage.** One continuous "order card" stage on a 1080×1080 square. Full-bleed ground `cream` (#FAFAFB) with a faint hairline grid (ink@4%, 40px) as the environmental layer. Three fixed zones on every frame so the cuts read as one film: **headline zone** (top, y≈80–230, left-aligned at x=80), **stage zone** (y≈250–860, the card or diagram, 40–60% of the frame), **footnote zone** (y≈860–900, one muted line). Nothing important below y≈900 (bottom-edge consistency). A tiny mono index sits top-right on every frame (`01/06` … `06/06`, `mono-label`, `muted`) — the only chrome.

**Palette by role (frame.md, never invent).** Headlines `ink` #24252A · code identifiers `body` #343A43 · code punctuation/keys `code` #59616E · captions `muted` #737B87 · cards `paper` #FFFFFF with 1px ink@12% hairline, radius 12, the essay shadow `0 18px 32px #1d22300a` · added diff lines `diff-bg` #EAF6EE with a 2px `diff-bar` #28A36B left rule, `diff-sign` "+", `diff-text` #286349 · removed lines: `muted` text with a 1px strike on `tile` #F2F3F5 (never red) · Repayment = `go` #8ABDAB / `go-text` #4F8A75 / border #BFDCD0 · Default = `claim` #C2A987 / `claim-text` #8C7456 / border #E3D6C2 · `coral` #FF5FA2 ONLY on the Pinkwhale whale mark, which sits before every visible "pinkwhale" (spec: .hyperframes/frame-packets/_whale.md). Pending cards: transparent fill, 1px #DADDE2 border.

**Type by role.** Headline = `display` role in Inter weight 500, ~54px, tracking −0.03em, max two lines, sentence case. Code = `code` role, IBM Plex Mono 400, 26–28px, line-height 1.6, `tabular-nums` on every amount. Captions = `body` Inter 400 ~26px `muted`. Index = `mono-label`. `≥ ≤ →` glyphs render in the system face if the webfont lacks them. Identifiers on screen are copied verbatim from `onscreen` — never re-typed from memory.

**Motion grammar (Emil Kowalski's design-engineering taste, applied).** Motion exists only to explain; if it doesn't teach, it doesn't move.
- Entrances: opacity 0→1 + translateY 8–12px (or scale 0.96→1) — **never from scale(0)**, never from nowhere — on a strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` (≈ `expo.out`/`power4.out`), 300–500ms for UI-sized elements, up to ~700ms for a hero.
- On-screen movement (a card sliding, chips travelling, the camera): ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` (≈ `power3.inOut`), 500–900ms. **Time itself is linear** (rails, counters driven by the day).
- No `ease-in` on anything. No bounce, overshoot, elastic, or spring-with-bounce anywhere.
- Staggers 40–70ms between siblings; a group's whole cascade ≤ 500ms.
- Text swaps in place use a short blur-crossfade (≤ 4px blur, 200–250ms) so old and new read as one transformation, not two overlapping objects.
- Exits are faster than entrances (≈ 60% of the entrance duration). Frame exits are the injected `transition_in` of the next frame — no mid-video exit choreography.
- Reveal on the beat: nothing enters before its cue; each frame develops across its whole duration, the back half included.

**Rhythm / held frames.** Held reads (content resolved, perfectly still, at most subtle jitter): end of frame 1 (the familiar order, a beat to recognise it), the first ~1.5s of frame 5 (tight on `[]` — the held tension before the pull-back), end of frame 5 (the thesis lands), all of frame 7's last 1.5s. Frame 3 is the busiest; frames 4 and 5 breathe more.

**Negative list.** No slideshow (front-load then freeze), no screensaver (independent floating), no lazy breathing, no back-half slow pan/push, no neon/crypto gradients, glows, particles, 3D coins, or "AI" purple-blue. No marketing copy, no copy that isn't in the frame's `onscreen`. No dark IDE chrome — code lives on the light order card. No red anywhere. No `repeat`/`yoyo`, no `Math.random`, no CSS transitions/keyframes.

## Frame 1 — You've signed this before

- scene: One light Seaport order card, centred. Bob's plain OpenSea offer — 100 USDC for BAYC #8263 — its fields typing in line by line.
- voiceover: ""
- onscreen: "You've signed this before." / "Bob offers 100 USDC for Alice's ape. An ordinary Seaport order." / code: "offerer: bob · zone: address(0) · offer: [ 100 USDC ] · consideration: [ BAYC #8263 → bob ] · orderType: FULL_RESTRICTED · zoneHash: 0x0"
- duration: 4s
- transition_in: cut
- status: animated
- src: compositions/frames/01-signed-before.html
- type: hook
- persuasion: Anchoring on a familiar referent + direct address
- beat: recognition
- blueprint: typewriter-reveal (Adapt)
- focal: the order card (Bob's plain Seaport offer)
- roles: order card = foreground subject · headline = supporting (top zone) · caption = supporting (footnote zone) · hairline grid = background
- sfx: none

narrativeRole: Opens on the most familiar object a Seaport developer has — an NFT offer — so everything after reads as a small edit to something they already trust.
keyMessage: This is a normal Seaport order; nothing about it is new.


Adapt (typewriter-reveal → code-typing block): keep the typed-line signature; the typed thing is the order's fields, not a sentence, and the payoff is the headline, not a logo. Registry: `code-typing` restyled to the light card.
Scene 1 (0.0–0.8s): headline "You've signed this before." enters per-word (`dynamic-content-sequencing`), top zone, left-aligned — the hook is readable in the first second. Ground + grid already present.
Scene 2 (0.5–2.9s): the order card rises into the stage zone (opacity + 12px, strong ease-out), centred, ~780px wide; a small card header reads `OrderParameters` in `mono-label`. The six field lines type in one after another, caret on the frontier (`discrete-text-sequence` + `context-sensitive-cursor`): `offerer: bob` · `zone: address(0)` · `offer: [ 100 USDC ]` · `consideration: [ BAYC #8263 → bob ]` · `orderType: FULL_RESTRICTED` · `zoneHash: 0x0`. Keys in `code`, values in `body`.
Scene 3 (2.9–4.0s): caption "Bob offers 100 USDC for Alice's ape. An ordinary Seaport order." fades up in the footnote zone; caret stops; held read, still. **End state is frame 2's start state exactly** (same card, same position, same line order) so the seam disappears.

## Frame 2 — Three fields

- scene: The same card, same position. Three values change as green diff lines — three small configs (orderType is already FULL_RESTRICTED in the plain order); a small `terms` note hashes into zoneHash.
- voiceover: ""
- onscreen: "Three small configs make it a loan offer." / diff: "- zone: address(0) → + zone: pinkwhale" · "- consideration: [ BAYC #8263 → bob ] → + consideration: [ BAYC #8263 → pinkwhale ]" · "- zoneHash: 0x0 → + zoneHash: keccak256(abi.encode(terms.consideration, terms.duration))" / note: "terms = { consideration: [ USDC 100 → 110 → bob ], duration: 30 days }" / labels: "① the zone  ② the collateral's recipient  ③ the terms, hashed"
- duration: 9s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/02-three-fields.html
- type: product_intro
- persuasion: Progressive disclosure + before/after (a literal diff)
- beat: surprise + clarity
- blueprint: panel-edit-live-sync (Adapt)
- focal: the diff on the order card
- roles: order card with diff = foreground subject · three numbered margin labels = supporting · `terms` note = supporting · headline = supporting
- sfx: none

narrativeRole: Lands the thesis by beat 2 — the whole of Pinkwhale's footprint on a Seaport order is three conventions on fields Seaport already has.
keyMessage: A Pinkwhale loan offer is a Seaport order with zone, recipient, and zoneHash set — nothing else.


Adapt (panel-edit-live-sync → code-diff block): keep the signature — the edit and its consequence land in the same beat (the `terms` note hashing into `zoneHash`); the "panel" is the order itself. Registry: `code-diff` restyled to the light card (removed = muted strike on `tile`, added = the essay's green diff).
Scene 1 (0.0–0.8s): identical to frame 1's end. The headline blur-crossfades in place to "Three small configs make it a loan offer."; the caption fades out.
Scene 2 (0.8–2.8s): ① `zone: address(0)` strikes and collapses; `+ zone: (whale) pinkwhale` expands in green beneath it. A small circled "①" and "the zone" appear in the card's right margin.
Scene 3 (2.8–4.8s): ② on the consideration line only the recipient token swaps in place, `bob` → `pinkwhale` (in-place token cycle, `discrete-text-sequence`), and the line turns into an added green line. Margin: "②  the collateral's recipient".
Scene 4 (4.8–7.2s): ③ `zoneHash: 0x0` strikes; a small `terms` note card slides in beside/below the order (ease-in-out) reading `terms = { consideration: [ USDC 100 → 110 → bob ], duration: 30 days }`; a 1px connector draws from the note into the zoneHash line (`svg-path-draw`) and `+ zoneHash: keccak256(abi.encode(terms.consideration, terms.duration))` expands in green (wraps to two lines if needed; never truncated). Margin: "③  the terms, hashed".
Scene 5 (7.2–9.0s): held read of the finished diff — still. The three margin labels are the only emphasis (no glow). Layout: card left-weighted 70/30 with the margin labels in the 30.

## Frame 3 — The match

- scene: Bob's edited card slides left and shrinks; Alice's mirror order (offer BAYC, consideration 100 USDC → alice, borrower zoneHash) arrives beside it. An `executeLoan(...)` line runs a short checklist that ticks row by row, then the pair collapses into two new cards.
- voiceover: ""
- onscreen: "executeLoan checks both terms, then matches the pair." / checklist: "✓ lenderTerms hash to lenderOrder.zoneHash" · "✓ borrowerTerms hash to borrowerOrder.zoneHash" · "✓ collateral recipient is pinkwhale" · "→ seaport.matchAdvancedOrders(…)  100 USDC → alice · BAYC #8263 → pinkwhale" · "→ seaport.validate([repayment, default])" / "It leaves two orders behind. No signatures: Pinkwhale validates them on chain."
- duration: 8s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/03-match.html
- type: feature_showcase
- persuasion: Demonstration (show the mechanism running) + signposting
- beat: momentum
- blueprint: agent-progress-theater (Adapt)
- focal: the `executeLoan` checklist
- roles: Bob's order (compact) + Alice's order (compact) = supporting (top of stage) · executeLoan panel = foreground subject · asset chips + whale badge = supporting · two pending cards = supporting
- sfx: none

narrativeRole: Shows the one function that turns two signed orders into a loan, and that its output is two more Seaport orders — not a loan object.
keyMessage: Matching moves the assets and writes two resolution orders that Seaport itself holds.


Adapt (agent-progress-theater): keep the receipt-cascade signature — rows arrive and check off; the trigger is the `executeLoan(…)` call itself, no cursor, no loaders.
Scene 1 (0.0–1.2s): the diffed order compacts (scale to ~0.55 + move, ease-in-out) into the upper-left of the stage, labelled `lenderOrder · bob`; Alice's mirror order enters upper-right in the same compact style (`borrowerOrder · alice`: `offer: [ BAYC #8263 ]`, `consideration: [ 100 USDC → alice ]`, `zone: pinkwhale`, `zoneHash: keccak256(abi.encode(terms.offer, terms.duration))`). Headline swaps to "executeLoan checks both terms, then matches the pair."
Scene 2 (1.2–4.2s): beneath them a mono panel opens with `executeLoan(lenderOrder, borrowerOrder, lenderTerms, borrowerTerms, …)`; three rows arrive and check off ~0.8s apart (`success-check`-style path-draw tick in `diff-bar` green): `lenderTerms hash to lenderOrder.zoneHash` · `borrowerTerms hash to borrowerOrder.zoneHash` · `collateral recipient is pinkwhale`.
Scene 3 (4.2–5.8s): row 4 `seaport.matchAdvancedOrders(…)` arrives; two asset chips travel on short ease-in-out paths — a USDC chip from Bob's order to the word `alice`, a BAYC chip from Alice's order to a small pink whale badge `pinkwhale` — then the two compact orders dim to 40% (spent).
Scene 4 (5.8–8.0s): row 5 `seaport.validate([repayment, default])`; two pending card outlines rise below (transparent fill, #DADDE2 border) titled `Repayment` (go-text) and `Default` (claim-text). Caption "It leaves two orders behind. No signatures: Pinkwhale validates them on chain." fades up; hold.

## Frame 4 — Repayment

- scene: The first of the two new cards fills the stage in repayment green. Its consideration amount counts 100 → 110 while a thin time rail under the card runs from startTime to endTime.
- voiceover: ""
- onscreen: "Repayment" / code: "offer: [ BAYC #8263 ]" · "consideration: [ USDC 100 → 110 → bob ]" · "startTime: now" · "endTime: now + 30 days" · "zoneHash: keccak256(abi.encodePacked(bytes32(0), alice))" / "Only Alice can fill it, until endTime." / "Seaport interpolates startAmount → endAmount. That's the interest. Pinkwhale has no interest code."
- duration: 8s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/04-repayment.html
- type: feature_showcase
- persuasion: Worked example with real numbers (100 → 110 over 30 days)
- beat: "aha"
- blueprint: dataviz-countup (Adapt)
- focal: the Repayment order and its rising amount
- roles: Repayment card = foreground subject · time rail = foreground (tied to the count) · headline + captions = supporting
- sfx: none

narrativeRole: First of the two futures; reveals that interest is a Seaport feature (amount interpolation) rather than protocol code.
keyMessage: The repayment order is fillable only by the borrower, only inside the window, and its rising price is the interest.


Adapt (dataviz-countup → count-up block): keep the count-up signature, but the counter lives inside the code line (`USDC 100 → 110`) and is driven by a linear time rail rather than a ring; no camera push-through.
Scene 1 (0.0–1.0s): the Repayment card (paper, border #BFDCD0, title `Repayment` in go-text) fills the stage; headline "Only Alice can fill it, until endTime." per-word.
Scene 2 (1.0–2.8s): five lines reveal top to bottom (stagger): `offer: [ BAYC #8263 ]` · `consideration: [ USDC 100 → 110 → bob ]` · `startTime: now` · `endTime: now + 30 days` · `zoneHash: keccak256(abi.encodePacked(bytes32(0), alice))`.
Scene 3 (2.8–6.0s): a 4px rail under the card fills linearly in `go` from `now` to `now + 30 days` (labels in `mono-label`), a 14px marker riding its head; in lockstep, a live amount on the consideration line counts `100.00 → 110.00` (tabular-nums, linear with the rail — the amount IS the time).
Scene 4 (6.0–8.0s): caption "Seaport interpolates startAmount → endAmount. That's the interest." then, 0.8s later, a second line "(whale) Pinkwhale has no interest code."; hold still at 110.00.

## Frame 5 — The empty array

- scene: Push to the second card, in claim tan. The camera opens tight on `consideration: []`, then pulls back to the whole Default order and a two-segment time rail — Repayment's window ending, Default's starting one second later and running open-ended.
- voiceover: ""
- onscreen: "consideration: []" / code: "offer: [ BAYC #8263 ]" · "consideration: []" · "startTime: repayment.endTime + 1" · "endTime: type(uint256).max" · "zoneHash: keccak256(abi.encodePacked(repaymentOrderHash, bob))" / "Default: opens the second repayment closes. Only Bob can fill it, for nothing." / "That empty array is the whole liquidation engine."
- duration: 9s
- transition_in: push-slide LEFT
- status: animated
- src: compositions/frames/05-empty-array.html
- type: benefit_highlight
- persuasion: Distillation (compress the mechanism to one token) + contrast (adjacent windows)
- beat: surprise + inevitability
- blueprint: zoom-out-workspace-reveal (Reproduce)
- focal: `consideration: []`
- roles: the `[]` token = foreground subject (hero) · Default card = foreground after the pull-back · two-window time rail = supporting · headline + caption = supporting
- sfx: none

narrativeRole: The memorable payoff — default needs no liquidation logic, just an order that costs nothing and opens when the other closes.
keyMessage: The clock decides which order is fillable; an empty consideration array makes the claim free.


Reproduce (zoom-out-workspace-reveal): signature — open tight on one full-bleed detail, then ONE continuous decelerating zoom-out reveals the containing whole; no zoom-in anywhere.
Scene 1 (0.0–1.6s): full-bleed and still: `consideration: []` in mono at hero size, `[]` in claim-text, filling ~60% of the width, centred at y≈454. Nothing else. Held tension.
Scene 2 (1.6–3.6s): one continuous decelerating pull-back (strong ease-out, `viewport-change`) until the token sits in its line inside the whole Default card (paper, border #E3D6C2, title `Default` in claim-text): `offer: [ BAYC #8263 ]` · `consideration: []` · `startTime: repayment.endTime + 1` · `endTime: type(uint256).max` · `zoneHash: keccak256(abi.encodePacked(repaymentOrderHash, bob))`. The `[]` keeps a soft claim tile behind it.
Scene 3 (3.6–6.2s): beneath the card a two-window rail builds left→right: a `go` segment labelled `repayment · until endTime`, a 1px seam labelled `+1`, then a `claim` segment fading to transparent labelled `default · from endTime + 1 · open`. Caption "Default: opens the second repayment closes. Only Bob can fill it, for nothing." fades up.
Scene 4 (6.2–9.0s): headline "That empty array is the whole liquidation engine." per-word in the top zone; on its last word the `[]` tile deepens once (claim tone, one step, no glow); hold still.

## Frame 6 — Two trades

- scene: The stage clears to the ground. The pink whale mark settles centred with the wordmark; the thesis line sits beneath, a small mono footer below it.
- voiceover: ""
- onscreen: "A loan is just two trades that haven't happened yet." / "Pinkwhale" / "Built on Seaport 1.6"
- duration: 4s
- transition_in: blur-crossfade
- status: animated
- src: compositions/frames/07-two-trades.html
- type: branding
- persuasion: Distillation + callback (the two orders from frames 4–5)
- beat: "now I get it"
- blueprint: logo-assemble-lockup (Adapt)
- focal: the whale mark + thesis line
- roles: whale mark = foreground subject · wordmark = foreground · thesis line = supporting · footer = supporting · grid = background (fading to plain ground)
- sfx: none

narrativeRole: Compresses the whole mechanism into the README's own line and signs off.
keyMessage: A loan is two pre-written trades; the clock picks one.


Adapt (logo-assemble-lockup): keep "the mark comes to exist and resolves into a centred lockup"; the mark simply arrives (opacity + scale 0.92→1), no part-assembly, no orbit.
Scene 1 (0.0–1.0s): the hairline grid fades out; the pink whale mark (`coral`, ~120px) arrives centred at y≈400 with the wordmark "Pinkwhale" (Inter 500, ink) beside/below it.
Scene 2 (1.0–2.4s): the thesis line "A loan is just two trades that haven't happened yet." reveals per-word beneath the lockup (headline role, ~48px, centred).
Scene 3 (2.4–4.0s): footer "Built on Seaport 1.6" (`mono-label`, muted) fades in low in the stage zone; everything holds perfectly still to the end (feed loop friendly).
