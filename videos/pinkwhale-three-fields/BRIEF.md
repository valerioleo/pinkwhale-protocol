---
workflow: faceless-explainer
flow: automation
storyboard: yes
message: "A Pinkwhale loan is an ordinary Seaport order plus three fields — and the liquidation engine is an empty array."
destination: x-feed
aspect: 1080x1080
language: en
audience: "Developers who know Seaport / OpenSea orders"
length: 42s
angle: concept
narration: no
---

## Intent

Pitch #3, "Three lines": for people who already know Seaport. A plain OpenSea offer
becomes a loan through a green diff — three added fields and nothing else. A
code-editor pane in the essay's type; `+ zone: Pinkwhale`, `+ zoneHash: hash(terms)`,
`+ recipient: Pinkwhale` land line by line, then the order "runs". Opening hook: a
normal OpenSea offer, captioned "You've signed this before."

In the user's words: "it should be a great technical explainer, not a marketing video.
showing code is a good thing here." Length: "45/60 seconds if you must, but 90 feels
too long."

Beats (about 10s each):

1. A plain order — `offer: BAYC`, `consideration: 100 USDC`. "You've signed this before."
2. The diff — three small configs: `zone`, the collateral recipient → Pinkwhale, `zoneHash: keccak256(terms)`. (`orderType: FULL_RESTRICTED` is already in the plain order: user, "that is not specific to pinkwhale".)
3. The match — `executeLoan` leaves two orders; Repayment's `startAmount 100 → endAmount 110` is the interest, Seaport interpolates it.
4. The clock — adjacent windows that never overlap (Default's startTime = Repayment's endTime + 1); Default's `consideration: []` is the whole liquidation engine.
5. End card — the Pinkwhale whale and wordmark, no URL.

## Customizations

- Motion follows Emil Kowalski's design-engineering taste (emil-design-eng): restraint, strong custom ease-out curves, nothing from scale(0), short staggers, motion only where it explains.
- Fully silent (no voiceover, no music, no SFX), like the offprompt video: short on-screen lines carry the story (feed autoplays muted). User chose offline: "no need to use heygen".
- Look: the essay's own design — Inter + IBM Plex Mono, #FAFAFB ground, the step-01 green diff colours (#eaf6ee panel, #28a36b bar, #286349 text), the pink whale #ff5fa2.

- Token avatars (user ask after first review: "can you add USDC and BAYC avatars?"): the essay's USDC coin and BAYC ape images (assets/tokens/) sit before every USDC / BAYC mention in code, chips, and captions. Spec: .hyperframes/frame-packets/_tokens.md.

- Revisions after review 2 (user): guard frame removed ("overkill in this video"); frame 2 headline "Three small configs make it a loan offer."; the Pinkwhale whale mark before every visible "pinkwhale" (.hyperframes/frame-packets/_whale.md); FULL_RESTRICTED shown as part of the plain first order.

## Notes

- Every field and function name shown must be checked against the contracts in the repo (contracts/Pinkwhale/…).
- Technical, not marketing: no hype copy, no neon crypto aesthetic.
- Research artifact, unaudited — don't imply production readiness.
