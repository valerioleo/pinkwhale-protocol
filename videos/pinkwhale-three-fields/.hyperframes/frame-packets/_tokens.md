# Token avatars — edit spec (shared by every frame)

The user asked: "can you add USDC and BAYC avatars?" Every on-screen mention of the two
assets gets its token image, the way the essay's own Seaport order cards show them: the
avatar sits immediately **before** the asset's name.

## Assets (already staged, root-relative paths — never `../`)

- `assets/tokens/usdc.png` — USDC coin, 128×128 PNG. Round: `border-radius: 50%`.
- `assets/tokens/bayc.png` — the BAYC ape, 128×128 PNG. Rounded square: `border-radius: 22%`.

Render as `<img src="assets/tokens/usdc.png" alt="">` (decorative — the name beside it is the
text). Give each img a frame-prefixed class plus an `id` if it is animated.

## Exact sizes (identical across frames so seams match)

| Context | Avatar size | Gap to the name | Vertical alignment |
| --- | --- | --- | --- |
| Code line, IBM Plex Mono 27px / 44px line (frames 01, 02, 04, 05, full-size card in 03) | 26px | `margin-right: 8px` | `vertical-align: -6px` |
| Compact code, frame 03 compact orders (their existing small mono size) | ≈ 0.95 × that font-size, rounded | `margin-right: 5px` | centred on the x-height, adjust by eye |
| Mono note / chips / small mono (frame 02 `terms` note, frame 03 chips, frame 04 readout) | ≈ 1.1 × that font-size, rounded | `margin-right: 6px` | centred |
| Inter captions 26px (frames 01 and 02 caption) and frame 06 scenario lines | 26px | `margin-right: 6px` | `vertical-align: -5px` |

Where the mention appears:
- `100 USDC` → avatar before `100`: `[ (usdc) 100 USDC ]`.
- `USDC 100 → 110` → avatar before `USDC`: `[ (usdc) USDC 100 → 110 → bob ]`.
- `BAYC #8263` → avatar before `BAYC`: `[ (bayc) BAYC #8263 → bob ]`.
- Frames 01/02 caption: "Bob offers (usdc) 100 USDC for Alice’s (bayc) ape. An ordinary Seaport order." — the ape avatar sits before the word "ape".
- Frame 06 scenario line 2: "The same (bayc) ape is back in custody."
- The Repayment readout in frame 04 (`USDC 100.00`): avatar before `USDC`.
- Frame 03 travelling chips (`100 USDC`, `BAYC #8263`): avatar inside the chip, before the text.

Do NOT add avatars to headlines, to `terms.consideration` identifiers, to `consideration: []`, or to
the end card.

## Motion (Emil Kowalski's taste — the avatar belongs to its text)

- An avatar never animates on its own schedule. It appears **with** the text it prefixes: same
  opacity/transform tween, or on the exact keystroke where typing reaches that token (for typed
  lines, the avatar appears — opacity 0→1 and scale 0.9→1, 180ms, `expo.out` — on the same
  timeline tick the first character after it is typed, and the typed characters after it keep
  their positions).
- Never from scale(0). No bounce, no spin, no glow.
- Where a line is struck through (frame 02 removed lines), the avatar dims with the text; the
  strike line crosses it too.

## Layout constraints

- Inserting an avatar widens the line by (avatar + gap). Anything positioned from character
  counts (monospace `ch` maths, hard-coded `left:` values, caret positions, chip landing targets,
  column padding) must be recomputed to include that width. Keys/values must stay column-aligned.
- Nothing may overflow its card or the canvas, and everything stays above y=900. If a line gets
  too long, wrap to an indented continuation line as the frame already does elsewhere — never
  truncate.
- Frame 01's end state and frame 02's start state must stay pixel-identical: both use the exact
  code-line and caption sizes in the table above.

## Rules of the edit

- Edit ONLY your own frame file. Minimal, surgical changes: keep every timing, id, copy string,
  colour and phase as it is. Keep the file a single `<template>` with the existing structure.
- Seek-safe as before: GSAP `fromTo`, no CSS transitions/keyframes, no randomness.
- Don't run `hyperframes` CLI commands (the orchestrator lints, checks and snapshots after).
