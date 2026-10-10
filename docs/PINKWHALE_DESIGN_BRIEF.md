# Pinkwhale — designer onboarding and website redesign brief

Prepared 18 September 2026 from the current repository. This is a proposed design brief grounded in the implementation. The educational purpose and existing design tokens are constraints; the current page composition, diagrams, navigation, and interaction patterns are open to redesign.

**1. The assignment**

Design an exceptionally clear, beautiful interactive essay that introduces an engineering idea. Pinkwhale is Valerio Leo’s experiment in expressing NFT loans using an existing marketplace protocol called Seaport.

The reader should understand the idea, manipulate an example, see why it works, and appreciate its limitations. Interested readers can inspect the technical details, run the code, or try a real transaction on a test network.

The website is a research publication with working demonstrations. Its success is measured by understanding and curiosity. It does not need the interface or acquisition funnel of a commercial lending platform.

A useful creative prompt:

> Design a short, illustrated field guide to an unexpected idea: the machinery that trades a collectible can also express a loan against it.

Pinkwhale is the project/protocol name. “Seaport as a loan book” is the current essay title. The title can evolve if the central idea remains clear. The phrase “loan book” describes the experiment; an operational marketplace for finding loan offers is not part of the current website.

**2. Who the site is for**

The proposed primary audience is curious developers, protocol researchers, and technically interested readers. Some know crypto; others understand a loan but have never seen a Seaport order. A secondary audience is people assessing the author’s technical thinking and craft.

Assume intelligence, but do not assume familiarity with blockchain terminology. Give the beginner enough context to understand the mechanism, and let the specialist open the implementation details without making everyone read them.

Suggested comprehension targets, rather than claims about current performance:

- Within the opening screen: identify this as an interactive explanation of an experiment.
- Within the first minute or two: understand who lends, what is held as collateral, and the two possible endings.
- After the main explanation: describe how four orders express the loan and why a repaid loan cannot be claimed later.
- At the end: understand what is implemented, what remains unresolved, and where to go deeper.

**3. The vocabulary, from zero**

| Term | Meaning in this project |
| --- | --- |
| Blockchain | A shared record that tracks accounts, assets, and the results of transactions. For the diagrams, its relevant job is recording who holds an asset and which operations have happened. |
| Smart contract | A program deployed on that network. People submit transactions that call it; the program applies its rules. It does not wake up and perform a transaction merely because time passes. |
| Protocol | The contracts and rules that other software can use. Pinkwhale’s website is one way to explain and demonstrate those rules. |
| Wallet | Software that controls an account and lets its user authorise actions. It is not the same thing as the asset itself. |
| Address | An account or contract identifier, usually displayed as a long string beginning `0x`. Use names in the explanation; expose addresses as supporting detail. |
| Token | A blockchain-tracked asset. This is separate from a **design token**, which is a reusable visual value such as a color. |
| Fungible token | An asset counted in interchangeable units: one unit is equivalent to another unit of the same kind. The loan examples use a currency-shaped token. |
| NFT | A non-fungible token: an individually identifiable asset. For this essay, imagine a particular digital collectible, with an owner and a unique ID within its collection. Its picture helps you recognise it; copying the picture does not transfer the token. |
| Collection and token ID | A collection is a family of NFTs managed by a particular contract. The token ID identifies an item within it. “BAYC #8817” means item 8817 in the Bored Ape Yacht Club collection. |
| USDC | The dollar-oriented currency label used in the examples. The live playground uses a mock test token with that label, not spendable real-world dollars. No exchange-rate claim is necessary for the lesson. |
| Borrower | The person who receives money and temporarily gives up custody of an asset as security. |
| Lender | The person who provides that money under agreed terms. |
| Principal | The amount initially lent. In the article’s example, 100 USDC. |
| Interest | The additional amount owed for borrowing over time. In the article’s example, it rises from zero toward 10 USDC over thirty days. |
| Collateral | The asset securing the loan. Here, the borrower’s NFT. |
| Escrow or custody | Holding the collateral under programmatic rules while the loan is open. Pinkwhale’s contract actually holds it. |
| Repayment | Paying the required amount and recovering the collateral before the repayment window closes. |
| Default | The loan remains unpaid when its repayment window closes. This makes the lender’s later claim possible; it does not automatically move the collateral. |
| Transaction | A submitted operation that can change the blockchain’s state. It can be pending, confirmed, or unsuccessful. |
| Gas | The network execution fee for a transaction. A collateral claim priced at zero can still require gas. |
| Testnet | A separate network used for experiments. The live demo runs on Base Sepolia with test assets. |
| Faucet | A service or contract operation that supplies test assets so someone can try the demo. |
| Hash | A compact digital fingerprint derived from data. Changing the data changes its fingerprint. Pinkwhale uses hashes to bind permissions and agreed terms to orders. |

NFTs are individually distinguishable tokens with ownership recorded on chain; ownership of the token should not be illustrated as a blanket transfer of copyright or every right to an image. [Ethereum’s NFT introduction](https://ethereum.org/nft/) provides background.

**4. What Seaport is, and what an order means**

OpenSea is an NFT marketplace website. Seaport is the underlying exchange protocol developed by OpenSea. Think of the website as a way to find a deal and the protocol as machinery for carrying out a properly authorised exchange. Pinkwhale uses Seaport 1.6. [OpenSea’s Seaport overview](https://docs.opensea.io/docs/seaport) introduces its exchange model.

An **order** is a structured description of a conditional exchange:

> I offer these assets. These other assets must be delivered to these recipients. This exchange is allowed within this time window and subject to these conditions.

An order is data with authorisation. Merely creating or signing it does not move the assets. The actual exchange happens when an eligible transaction executes it successfully.

A **signature** proves that an account authorised particular order data. Signing the message itself is different from sending a transaction. Asset approvals and execution can still involve transactions and fees.

**Fulfilling an order** means carrying out the exchange it describes. **Matching orders** means combining compatible orders into an exchange. Pinkwhale opens the loan by matching the borrower’s and lender’s orders in one transaction.

Two Seaport field names matter immediately:

- **Offer:** the assets an order’s maker supplies.
- **Consideration:** the assets that must be delivered in return, including their recipients. Those recipients do not have to be the maker.

That second distinction is essential: the lender’s order directs collateral to Pinkwhale, not to the lender.

A signed order is not automatically an entry in a public marketplace. A marketplace needs infrastructure to store and distribute offers before execution. The website should not imply that Pinkwhale already provides such a service.

**5. The complete example to design around**

Use two named people or clearly labelled roles consistently. For this brief, Alice is the borrower and Bob is the lender. Names are optional; distinct roles are not.

Alice owns one collectible, BAYC #8817. Bob agrees to lend 100 USDC. Alice has thirty days to repay. The amount required starts at 100 USDC and rises linearly toward 110 USDC over that term.

Before opening: Alice has the NFT. Bob has the money. They agree to the terms and each authorise a creation order. The assets have not moved yet.

On opening: a successful transaction matches the two orders. The NFT moves from Alice to Pinkwhale’s custody. The 100 USDC moves directly from Bob to Alice. In the same transaction, Pinkwhale creates and validates two future orders: repayment and default. The opening is atomic: the transaction succeeds as a whole or its state changes are reverted.

**Ending A — Alice repays on day fifteen.** Alice pays 105 USDC directly to Bob. Pinkwhale’s NFT is transferred back to Alice through Seaport. The repayment order is marked filled. The default order remains an order, but can no longer succeed because its linked repayment has already happened.

**Ending B — Alice does not repay.** Once the default window opens, Bob may submit a claim. If it succeeds, the NFT moves from Pinkwhale to Bob. Bob pays no additional purchase price for it. This is the consequence of the unpaid loan, not repayment of the debt in money.

The NFT should retain the same identity throughout the sequence. A learner must be able to point to who holds it at every moment.

| Moment | Who holds the NFT? | Relevant money movement | What the reader should understand |
| --- | --- | --- | --- |
| Before the match | Alice | None yet | Signing and transferring are different. |
| Loan opens | Pinkwhale | Bob sends 100 to Alice | Collateral is held while Alice uses the money. |
| Repaid on day fifteen | Alice | Alice sends 105 to Bob | Repayment returns the collateral and blocks the alternative claim. |
| Overdue, not yet claimed | Pinkwhale | No automatic payment | Eligibility has changed; a transaction is still needed. |
| Bob claims | Bob | Zero additional purchase price | The default order transfers the collateral when fulfilled. |

An exact timing detail belongs in the detailed interaction: repayment is valid strictly before the deadline; default starts at deadline plus one second. At the exact deadline neither resolution order is executable. The displayed 110 USDC is the amount at the repayment curve’s endpoint, not permission to repay at or after that endpoint.

**6. Why there are four orders but two endings**

| Order | Who authorises it? | What it supplies | What it requires | When it matters |
| --- | --- | --- | --- | --- |
| Lender creation | Bob | 100 USDC | Alice’s NFT delivered to Pinkwhale | Matched with the borrower order when opening |
| Borrower creation | Alice | The NFT | 100 USDC delivered to Alice | Matched with the lender order when opening |
| Repayment | Pinkwhale | The NFT it now holds | The amount currently owed, delivered to Bob | Before the deadline; only Alice may fulfil it |
| Default | Pinkwhale | The same NFT | No consideration items: nothing to pay | From deadline + 1 second; only Bob may fulfil it, and only if repayment remains unfilled |

Two orders establish the loan; two describe alternative resolutions. These are not four payments, four user signatures, or four required clicks.

The people sign the first two. Pinkwhale authorises its own two orders through Seaport’s on-chain validation mechanism; it does not have a human wallet or private signing key.

The order representation is the insight. Pinkwhale expresses repayment as an exchange of money for the collateral, and default as a zero-price collateral claim with restricted permission and a later time window.

**7. The division of responsibilities**

Seaport supplies the exchange machinery: authorisation checks, order matching and fulfilment, asset transfers, validity windows, and tracking which orders have been filled.

Pinkwhale checks the agreed loan terms at opening, receives the collateral, creates both resolution orders, and supplies additional rules for who may resolve the loan and whether a previous repayment blocks a claim.

A **zone** is the contract Seaport consults for additional permission on a restricted order. Pinkwhale serves as that zone for its resolution orders. A useful visual metaphor is a checkpoint or permission gate; it is not a geographic region, marketplace category, or human moderator.

Two common simplifications must be handled carefully:

- “No escrow logic” does not mean nobody holds the NFT. Pinkwhale holds collateral while relying on Seaport’s transfer machinery.
- “The clock decides” means timestamps determine which order is eligible. The clock does not submit transactions, contact the borrower, or transfer the NFT automatically.

**8. The most important failure case**

Alice repays a first loan and gets her NFT back. Later, she uses that same NFT as collateral for a second loan. Pinkwhale holds it again. Bob still has the first loan’s old default order.

Without a check against the first repayment, that old order could reach collateral now backing a different loan. Pinkwhale prevents this by linking the default claim to its original repayment order. If that repayment has been filled, the claim is refused before collateral moves.

This is why “the other future closes” is more than a visual flourish. The relationship between the orders protects a later use of the same asset.

Use plain-language rejection explanations before optional technical codes:

| Attempt | Expected explanation | Supporting code label |
| --- | --- | --- |
| Lender claims before the default window | The lender must wait until the claim becomes eligible. | `InvalidTime` |
| Borrower repays after the repayment window | The repayment window has closed. | `InvalidTime` |
| A different account tries to fulfil the borrower’s repayment order | This order is reserved for the borrower. | `ZoneHashMismatch` |
| Lender uses an old claim after its loan was repaid | The original repayment already happened. | `UpstreamOrderAlreadyFulfilled` |

These examples explain guards; they are not a claim of comprehensive security or an audit.

For a diagram presented as an exact execution trace, confirm the sequence with engineering. The current illustrative guard widget is conceptual. In the contract, the upstream-order check, where applicable, occurs before the caller-binding comparison; Seaport also performs its own checks. Do not preserve an inaccurate execution order simply because an existing diagram uses it.

**9. The other capabilities worth explaining**

**Interest from changing amounts.** Seaport can interpolate between an item’s starting and ending amounts over its validity window. Pinkwhale copies the signed repayment amounts into the repayment order. The 100 → 105 → 110 example shows interest without a separate Pinkwhale accrual engine. “No interest code” does not mean “no interest charged.”

**Multiple collateral items.** Orders contain lists of assets. One loan can be backed by multiple compatible items—for example, an ape NFT, a penguin NFT, and a quantity of a fungible token. The borrower redeems the set together. A good visual groups multiple items under one loan identity.

**Collection offers.** A lender can specify acceptable criteria for an NFT slot rather than naming one exact token. “Any eligible item from this collection” is the beginner explanation. Criteria answer which item can fill a slot; bundles answer how many items the loan contains. They are separate ideas.

**Fees as an additional payment recipient.** An agreed repayment can include another payment item directed to a marketplace. Seaport can route those payments. Pinkwhale itself does not implement a protocol fee switch. Present this as a capability, not an existing business or pricing plan.

These are consequences of reusing an existing system. They should deepen the main argument after the reader understands a single loan.

**10. The desired vibe**

Thoughtful, precise, warm, editorial, technically credible, and quietly playful.

The page should feel authored. Its personality comes from a clear point of view, careful diagrams, satisfying changes in state, and an honest discussion of the unfinished parts.

Useful creative anchors: an illustrated engineering essay, an annotated research notebook, a beautifully typeset field guide, or a small exhibit whose controls reveal how its subject works. These are directions, not references to copy literally.

The desired emotional progression is: “I can follow this” → “Let me try that” → “Oh, those are ordinary orders” → “I see why the guard matters” → “I understand both the elegance and the limits.”

Let typography create hierarchy. Let space separate arguments. Let animation show ownership, time, or cause and effect. Let the NFT image serve as a recognisable object in the story.

Avoid visual promises of a commercial finance product: yield tickers, market dashboards, unsupported volume statistics, token-sale imagery, or large onboarding demands before the explanation. Pinkwhale’s name does not require a new bright-pink palette or a literal ocean environment.

Copy should be conversational and specific. “Repay the loan” works as an action; `fulfillAdvancedOrder` can appear in an optional implementation note. Difficult terms should be introduced at the moment they become useful.

**11. The visual constraints that stay**

The design tokens come from Valerio’s personal website and should be retained. The redesign can change layout, type scale, spacing, hierarchy, diagram language, composition, and motion while using these foundations.

| Token | Light | Dark |
| --- | --- | --- |
| Background | `#eee6e5` | `#022331` |
| Foreground | `#24201e` | `#e7eef0` |
| Card/surface | `#f3edec` | `#06303f` |
| Muted surface | `#dacfcb` | `#0e4353` |
| Muted foreground | `#6b615d` | `#8aa3ac` |
| Border | `#d8cdcb` | `#0e3b4a` |
| Brand/accent | `#9a4a22` | `#e0906a` |
| Text on brand | `#f6f1ef` | `#022331` |
| Positive | `#4a6a3f` | `#8fbf7f` |
| Destructive/error | `#b4442f` | `#e5705a` |

Fonts: **Petrona** for reading and editorial expression, **Instrument Sans** for interface controls, **IBM Plex Mono** for code and machine-like values. Keep these families. The base radius is **0.25rem**, approximately 4px at the default root size. The existing tint mixes 11% brand with the card surface.

The result should belong to the same visual world as the personal site in both color schemes. The current widget layouts are not a constraint. Existing whale and token artwork are available; the scope is the website redesign rather than a separate brand-identity program.

**12. Information architecture and scope**

Design the whole reading experience, including its supporting pages and optional demo. The three current routes are a useful starting point; the designer can propose a clearer arrangement.

| Surface | Purpose | Content that must remain discoverable |
| --- | --- | --- |
| Main essay `/` | Explain the insight through a concrete example | Premise, lifecycle, four orders, permissions/replay guard, inherited capabilities, limitations, author and source |
| Reference `/reference` | Give interested readers exact definitions and evidence | Order structures, fields, zone behavior, events, errors, collateral types, implementation walkthrough, off-chain infrastructure |
| Run it yourself `/run` | Help developers reproduce the experiment | Requirements, setup commands, local tests, local deployment, complete loan example, links to code |
| Optional live demo, currently inside the essay | Demonstrate the mechanism through real test-network transactions | Explanation before sign-in, two actors, funding, signing, matching, repayment/default, confirmations and transaction receipts |

Also include navigation, section anchors, footer, interactive figures, explanatory captions, code blocks, tables, technical disclosures, loading and failure states, light/dark mode, and responsive behavior. A share-preview composition can be included as a finishing asset.

Suggested narrative: premise → one concrete loan → the two endings → reveal the four orders → explain the replay guard → show what the order model inherits → discuss limitations → invite deeper exploration.

The required outcomes matter more than the current section count. Existing widgets can be combined, split, or replaced if the new experience teaches the same mechanism accurately.

**13. Interaction specification: the loan story**

Purpose: let the reader understand asset movement, changing eligibility, and mutually exclusive outcomes by trying them.

Show the borrower, lender, Pinkwhale custody, one identifiable NFT, principal, amount currently owed, elapsed time, and loan status. Show the two resolution orders or another equally clear representation of the two endings.

Required actions: open a sample loan; advance time; attempt repayment; attempt a claim; reset and explore the other ending. Provide discrete time controls as well as any slider, so no lesson requires precise dragging.

Required states:

- Before opening: no assets have moved; the future orders are explained as prospective.
- Open and before expiry: collateral in Pinkwhale; borrower has received principal; repayment eligible; default not yet eligible.
- Early repayment: borrower recovers collateral; lender receives principal plus accrued interest; the default claim becomes unfillable.
- Exactly at the deadline: neither resolution order is eligible.
- After the default window opens: repayment is unavailable; lender may claim if the loan is unpaid; collateral remains in custody until a transaction succeeds.
- Claimed: collateral belongs to the lender; the loan cannot later be repaid through its old repayment order.
- Rejected attempt: ownership stays unchanged and the reason is clear.
- Reset: returns to an explicit fresh scenario.

An experiment may allow moving its clock backward. Doing so must not silently undo a completed repayment or claim. Either require Reset to start over or label the switch as a separate hypothetical scenario.

The reader should see cause and effect without needing to inspect a console. Keep a concise text description of the current outcome so the lesson works without animation or color recognition.

**14. Interaction specification: the four-order explanation**

Purpose: reveal that the loan reuses ordinary exchange structures.

Allow comparison of lender creation, borrower creation, repayment, and default. Lead with who gives what, who receives what, who authorises the order, and when it can execute. Keep a useful explanation visible by default.

Fields available for progressively deeper inspection:

| Field | Plain-language label |
| --- | --- |
| `offerer` | Who supplies the offered assets / authorises this order |
| `offer` | What this order gives |
| `consideration` | What must be delivered in return, and to whom |
| `startTime`, `endTime` | When this order can execute |
| `startAmount`, `endAmount` | How the required quantity changes over the window |
| `zone` | Which contract supplies additional permission checks |
| `orderType` | The restriction category; here, full restricted orders |
| `zoneHash` | A fingerprint binding agreed terms or permissions, depending on the order |
| `salt` | A value that helps distinguish otherwise similar orders |
| `extraData` | Supporting data supplied with fulfilment; resolution calls identify the linked order where applicable |

Be precise about `zoneHash`: on creation orders it commits to the repayment terms; on resolution orders it binds the authorised caller and an upstream order reference. It is not the Pinkwhale contract address—that is the `zone` field.

Empty consideration must read as meaningful: “Nothing to pay,” not missing data, loading, or an error. On phones, the explanation should appear beside or immediately after the relevant selection. No hover-only teaching.

**15. Interaction specification: try to break the rules**

Purpose: explain why a plausible-looking transaction can still be refused.

Offer the early claim, wrong caller, and old-claim-after-repayment scenarios. Each should state the starting situation, let the reader attempt the action, show the rule that prevents it, and confirm that the collateral stayed put.

Use a plain-language outcome first and an optional technical error below it. Link to the corresponding repository evidence. Label the interaction as a local simulation or explanatory model, rather than pretending it submits real attacks to the network.

The model should teach particular checks without implying the entire protocol is proven safe. If exact check ordering is drawn, use the implementation rather than copying the current conceptual animation.

**16. The live demo is a different interaction mode**

The article’s experiments are immediate browser simulations. They do not need an account, test assets, or a network confirmation. The live demo submits real transactions to a test network and has unavoidable waiting and failure states. The visual design must make that distinction clear before entry.

Current live-demo parameters: **1,000 mock USDC**, a **test CryptoPunk**, a **five-minute term**, and repayment increasing toward **1,100 mock USDC**. These differ from the article’s 100/110/thirty-day/BAYC teaching example. They are example parameters, not market rates or actual collectible valuations.

The designer may recommend aligning the examples, but changes to deployed assets or loan parameters must be coordinated with engineering. Do not draw a thirty-day timeline while the actual transaction has a five-minute deadline.

Current flow: open the demo → sign in by email → create two accounts representing borrower and lender → fund them with test assets → sign the two creation orders → match them → repay before expiry or wait and claim → inspect the transaction receipt.

The visitor controls both actors to demonstrate the mechanism. A real borrower and lender would usually be different people. Explain why two accounts appear so this does not look like a confusing duplicate account setup.

Design states for demo loading, sign-in and email verification, account creation, funding, missing assets, waiting for signatures, rejected/failed signing, execution pending, confirmation, open loan/countdown, repayment pending, claim pending, settled outcomes, network failure, and recovery. Keep confirmed state distinguishable from a requested action.

A transaction receipt should lead with what happened and provide a secondary link to the public transaction record. Long hashes are supporting details. Resetting the browser simulation and completing another live loan must look like different actions; an on-chain transfer cannot be undone by a local reset.

The demo remains optional. An unavailable external service must not prevent reading the essay or using its local experiments. The code is unaudited research, and the test-assets-only message belongs at the point of entering the live flow.

**17. Limitations to preserve honestly**

The current default gives the lender the entire collateral without returning any excess value to the borrower. The lender’s claim also does not expire. These are economic limitations, even though the order mechanics are compact.

An auction is a possible future direction, not an implemented feature. Refinancing and partial repayment are also not implemented. A marketplace would still need to store offers, check their ongoing validity, help counterparties find each other, and supply reminders if desired.

Keep implemented behavior, proposed extensions, and unsolved questions visually and verbally distinct. Do not add a pricing page, yield claims, a production borrowing marketplace, a portfolio dashboard, liquidation alerts, or new protocol functionality as part of this website brief.

An unaudited label should be clear and proportionate. The essay should neither hide the research status nor make every educational interaction look dangerous.

**18. Responsive, accessibility, and motion requirements**

Design explicitly for small phones, tablets, and wide desktop screens. The current project has been checked down to 320px; treat that as a useful stress case rather than scaling a desktop drawing until its labels become unreadable.

Keep prose at a comfortable measure; let diagrams use additional width where useful. Keep mobile navigation compact. Wide reference tables and code can scroll within their own regions, without widening the entire page.

Every control needs a keyboard path, a visible focus state, and a meaningful label. Pair colors with labels or icons. Do not rely on hovering to explain a field. Dynamic results should have a concise text equivalent that assistive technology can announce.

Plan normal and reduced-motion versions. Use motion to show the same asset moving, an amount changing, or an order becoming eligible. Preserve context while those changes happen. Reading should remain self-paced, and the essay should make sense to someone who does not activate every figure.

**19. Suggested designer deliverables**

1. A proposed narrative and content hierarchy, including what belongs in the essay versus reference.
2. Wireframes for the essay, reference, developer setup page, and live-demo entry/flow.
3. Desktop and mobile visual designs using the retained token system, with representative dark-mode designs.
4. A working prototype of the loan story that demonstrates both endings, blocked attempts, and reset.
5. Order-inspector and guard-experiment states, including keyboard/focus and mobile disclosure behavior.
6. A live-demo state map covering waiting, success, failure, and recovery—not only the happy path.
7. Reusable components for navigation, prose, figures, controls, captions, notices, tables, code, and transaction receipts.
8. Motion notes, responsive rules, and implementation annotations. A share-preview asset is an optional finishing deliverable.

Start by validating the story and the first interaction. Polish the entire surface after a reader unfamiliar with Seaport can explain the two endings back to you.

**20. How we will judge the redesign**

A reader should be able to answer: Who has the NFT right now? Where did the money go? What can the borrower do before the deadline? What changes after it? Why are there four orders? Why can an old claim not take new collateral? Which demonstration is simulated? Which actions use a test network? What is still unfinished?

The design should make those answers easier to discover while retaining the author’s visual identity. The exact current cards, sidebar, hero, section labels, and controls are expendable. The accuracy of the explanation is not.

