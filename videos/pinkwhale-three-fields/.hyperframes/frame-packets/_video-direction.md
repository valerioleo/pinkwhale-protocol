# Video direction (shared by every frame — read after your packet)

## Video direction

**Stage.** One continuous "order card" stage on a 1080×1080 square. Full-bleed ground `cream` (#FAFAFB) with a faint hairline grid (ink@4%, 40px) as the environmental layer. Three fixed zones on every frame so the cuts read as one film: **headline zone** (top, y≈80–230, left-aligned at x=80), **stage zone** (y≈250–860, the card or diagram, 40–60% of the frame), **footnote zone** (y≈860–900, one muted line). Nothing important below y≈900 (bottom-edge consistency). A tiny mono index sits top-right on every frame (`01/07` … `07/07`, `mono-label`, `muted`) — the only chrome.

**Palette by role (frame.md, never invent).** Headlines `ink` #24252A · code identifiers `body` #343A43 · code punctuation/keys `code` #59616E · captions `muted` #737B87 · cards `paper` #FFFFFF with 1px ink@12% hairline, radius 12, the essay shadow `0 18px 32px #1d22300a` · added diff lines `diff-bg` #EAF6EE with a 2px `diff-bar` #28A36B left rule, `diff-sign` "+", `diff-text` #286349 · removed lines: `muted` text with a 1px strike on `tile` #F2F3F5 (never red) · Repayment = `go` #8ABDAB / `go-text` #4F8A75 / border #BFDCD0 · Default = `claim` #C2A987 / `claim-text` #8C7456 / border #E3D6C2 · `danger` #C2410C ONLY on the revert chip in frame 6 · `coral` #FF5FA2 ONLY on the whale mark (frames 3 and 7). Pending cards: transparent fill, 1px #DADDE2 border.

**Type by role.** Headline = `display` role in Inter weight 500, ~54px, tracking −0.03em, max two lines, sentence case. Code = `code` role, IBM Plex Mono 400, 26–28px, line-height 1.6, `tabular-nums` on every amount. Captions = `body` Inter 400 ~26px `muted`. Index = `mono-label`. `≥ ≤ →` glyphs render in the system face if the webfont lacks them. Identifiers on screen are copied verbatim from `onscreen` — never re-typed from memory.

**Motion grammar (Emil Kowalski's design-engineering taste, applied).** Motion exists only to explain; if it doesn't teach, it doesn't move.
- Entrances: opacity 0→1 + translateY 8–12px (or scale 0.96→1) — **never from scale(0)**, never from nowhere — on a strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` (≈ `expo.out`/`power4.out`), 300–500ms for UI-sized elements, up to ~700ms for a hero.
- On-screen movement (a card sliding, chips travelling, the camera): ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` (≈ `power3.inOut`), 500–900ms. **Time itself is linear** (rails, counters driven by the day).
- No `ease-in` on anything. No bounce, overshoot, elastic, or spring-with-bounce anywhere.
- Staggers 40–70ms between siblings; a group's whole cascade ≤ 500ms.
- Text swaps in place use a short blur-crossfade (≤ 4px blur, 200–250ms) so old and new read as one transformation, not two overlapping objects.
- Exits are faster than entrances (≈ 60% of the entrance duration). Frame exits are the injected `transition_in` of the next frame — no mid-video exit choreography.
- Reveal on the beat: nothing enters before its cue; each frame develops across its whole duration, the back half included.

**Rhythm / held frames.** Held reads (content resolved, perfectly still, at most subtle jitter): end of frame 1 (the familiar order, a beat to recognise it), the first ~1.5s of frame 5 (tight on `[]` — the held tension before the pull-back), end of frame 5 (the thesis lands), all of frame 7's last 1.5s. Frames 3 and 6 are the busiest; frames 4 and 5 breathe more.

**Negative list.** No slideshow (front-load then freeze), no screensaver (independent floating), no lazy breathing, no back-half slow pan/push, no neon/crypto gradients, glows, particles, 3D coins, or "AI" purple-blue. No marketing copy, no copy that isn't in the frame's `onscreen`. No dark IDE chrome — code lives on the light order card. No red except the one revert chip. No `repeat`/`yoyo`, no `Math.random`, no CSS transitions/keyframes.

## Shared geometry (so independently built frames cut together)

- Canvas 1080×1080. Ground: a full-duration `class="clip"` background layer in `#FAFAFB` with a 40px hairline grid at ink@4% (frames 1–6; frame 7 fades its grid out).
- Index: top-right, right edge x=1000, baseline y≈88, IBM Plex Mono 500 18px, letter-spacing 0.14em, `#92959E`, e.g. `02/07`.
- Headline zone: left x=80, top y=96, max width 880, Inter 500 54px, line-height 1.08, letter-spacing −0.03em, `#24252A`.
- **The order card (frames 1 and 2 must match pixel-for-pixel at the seam):** left x=150, top y=300, width 780, paper #FFFFFF, 1px ink@12% border, radius 12, shadow `0 18px 32px #1d22300a`. Header strip 56px tall with `OrderParameters` (IBM Plex Mono 500, 18px, 0.14em tracking, `#92959E`) at x+28 and a 1px `#ECEEF1` rule under it. Body padding 24px 28px. Code lines: IBM Plex Mono 400 27px, line-height 44px, key in `#59616E`, value in `#343A43`; keys padded so values align in one column (`consideration:` is the longest key). Frame 1's six lines in this order: `offerer: bob` · `zone: address(0)` · `offer: [ 100 USDC ]` · `consideration: [ BAYC #8263 → bob ]` · `orderType: FULL_OPEN` · `zoneHash: 0x0`.
- Footnote zone: left x=80, top y≈860, max width 920, Inter 400 26px, line-height 1.35, `#737B87`. Nothing below y=900.
- Easing constants to use in GSAP: entrances `CustomEase`-free equivalents — `expo.out` (≈ cubic-bezier(0.23,1,0.32,1)); on-screen moves `power3.inOut` (≈ cubic-bezier(0.77,0,0.175,1)); time-driven rails/counters `none`. Text blur-crossfade: filter blur 0→4px→0 over 220ms with the opacity swap.

## Dispatch notes that apply to every frame

- **The video is silent and has no caption track.** Your frame's `onscreen` field IS the visible copy: render every quoted string exactly as written (these sentences are the exception to "never render narration"), in the order and at the moments the Scene lines give. Do not add, shorten, or rephrase copy. `voiceover` is empty on purpose.
- Code identifiers are verified against the contracts: copy them character-for-character (`FULL_RESTRICTED`, `keccak256(abi.encode(terms.consideration, terms.duration))`, `repayment.endTime + 1`, `type(uint256).max`, `UpstreamOrderAlreadyFulfilled`). Long lines wrap onto an indented continuation line; never truncate with an ellipsis.
- Fonts: paste the `@font-face` block from `frame.md` (the "Fonts ship as local WOFF2 files" bullet) verbatim; use only `"Inter"` and `"IBM Plex Mono"`.
- Registry reference blocks are installed at `compositions/code-diff.html`, `compositions/code-typing.html`, `compositions/code-highlight.html`, `compositions/components/count-up.html`. You may READ them for technique; do not edit them, do not run `hyperframes add`, and do not touch `hyperframes.json`, `index.html`, `STORYBOARD.md`, or any other frame. Restyle anything you borrow to this light design (no dark editor chrome).
- Write only `compositions/frames/<frame_id>.html`.
