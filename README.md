# Pinkwhale

**A loan is just two trades that haven't happened yet.**

An NFT lending protocol with no escrow logic, no settlement logic, and no liquidation engine.
Pinkwhale writes down both possible futures of a loan as Seaport orders, then lets the clock
and a zone decide which one becomes real.

> **Research artifact, shared as-is with no safety guarantees. Not audited.**
> Read it, fork it, learn from it. Don't put money in it.

Built on **Seaport 1.6**.

## How it works

A loan is four orders.

| Order | Offerer | Offer | Consideration | Window | Who may fulfil |
| --- | --- | --- | --- | --- | --- |
| Lender creation | Lender | principal | collateral to **Pinkwhale** | signer's choice | matched inside `executeLoan` |
| Borrower creation | Borrower | collateral | principal to borrower | signer's choice | matched inside `executeLoan` |
| Repayment | Pinkwhale | collateral | principal rising to principal + interest, to lender | `t0` to `t0 + duration` | the borrower |
| Default | Pinkwhale | collateral | *(empty)* | `expiry + 1` to forever | the lender |

The two humans sign the creation orders. Anyone submits them to `executeLoan`, which checks
that the terms match what each side signed, matches the pair on Seaport, and mints the two
resolution orders, one for each way the loan can end, with adjacent validity windows that
never overlap.

Nobody has to decide later whether a loan defaulted. The clock decides.

The default order's consideration is an empty array. That is the entire liquidation mechanism:
an order that costs nothing to fill, that only the lender can fill, that opens only once the
borrower's window has shut.

## Plain Seaport orders

The two creation orders are not a Pinkwhale format. They are ordinary Seaport orders with the
same `OrderParameters` struct and the same EIP-712 signature any marketplace uses, so a lender
signs the same kind of object they would sign to make an offer on OpenSea. Pinkwhale adds three
conventions on fields Seaport already has:

- `zone` points at Pinkwhale, with `orderType = FULL_RESTRICTED`
- `zoneHash` holds the keccak of the repayment terms that signer agreed to
- the collateral consideration item is directed at Pinkwhale

That is where the leverage comes from. Collection offers and bundles work because
`ERC721_WITH_CRITERIA` is already an item type. Cancellation works because Seaport has
`cancel`. None of it had to be built twice.

Fees work the same way, and there is deliberately no fee switch here. On Seaport a fee is just
another consideration item on the order, which is how OpenSea does it, enforced off chain by
refusing to store orders that don't carry the fee item. A marketplace built on Pinkwhale would
append its own item to the repayment order. The protocol never needs an opinion.

## Interest comes free

There is no interest rate in this codebase. Pinkwhale copies the lender's consideration item
into the repayment order untouched, and Seaport interpolates each item linearly from
`startAmount` to `endAmount` across the order's window. A lender signing "100 USDC now, 110 at
expiry" has expressed a rate; setting both equal gives a flat fee. Tested both ways in
`test/HappyPath.t.sol`.

## The zone hooks

Seaport calls a restricted order's zone twice, and Pinkwhale uses both ends:

- `authorizeOrder` runs **before any token moves**. All the gating lives here, so a wrong caller
  or an already-repaid loan is turned away while the collateral is still in custody.
- `validateOrder` runs **after everything settles**. Only the events live here, so `LoanRepaid`
  and `DefaultedCollateralClaimed` can never describe a transfer that didn't happen.

Both require `msg.sender == address(seaport)`. A zone hook anyone can call is a zone hook
anyone can use to emit protocol events an indexer will believe.

## What the zone actually checks

`zoneHash` is 32 bytes the order carries and Seaport never inspects. It means two things at
once:

```solidity
zoneHash = keccak256(abi.encodePacked(upstreamOrderHash, authorisedCaller));
```

Who may fulfil the order. Seaport reports the caller as `zoneParameters.fulfiller`, so hash it
and compare.

Which other order must still be unfilled. The default order names the repayment order. If that
one has been filled, the loan was repaid and the claim is dead.

The second check is not decorative. Custody is pooled, with every open loan's collateral in the
same contract, so a stale default order from a repaid loan would otherwise reach straight into
collateral a later borrower posted. There is a test for exactly that.

## Layout

```
contracts/Pinkwhale/     the protocol, seven files, ~450 lines
contracts/Seaport/       thin deployable wrappers around seaport-core 1.6.6
contracts/Tokens/        mock ERC20/721/1155 for local runs
test/                    Foundry: happy paths, guards, criteria loans
scripts/                 viem + deployoor deploy and demo
docs/                    the interactive article (vocs 2)
```

Everything else is Seaport's 25 KB, not ours: signature verification, order matching, time
windows, criteria proofs, partial fills, reentrancy protection.

## Run it

Requires [Foundry](https://book.getfoundry.sh) and Node 20+ with [pnpm](https://pnpm.io). No
API keys, no accounts, no testnet ETH.

```bash
git submodule update --init
pnpm install
forge test
```

31 tests across three suites, all against a Seaport 1.6 deployed fresh in `setUp()`. Nothing
forked, fully offline.

| Suite | What it proves |
| --- | --- |
| `test/HappyPath.t.sol` | open then repay, and open then default, for ERC721 and ERC1155 collateral |
| `test/Guards.t.sol` | every documented attack, as a typed revert |
| `test/Criteria.t.sol` | collection offers and merkle-set bundles, end to end |

### A local deployment, and a whole loan

Seaport built from source is 25,229 bytes, 653 over EIP-170, because the copy on mainnet was
compiled through the IR pipeline and this one cannot be. Its vendored source predates
memory-safe assembly annotations, so `viaIR` dies with "stack too deep". Local anvil needs the
limit raised; live networks do not, because there Pinkwhale registers the canonical Seaport 1.6
rather than deploying its own.

```bash
cp .env.example .env
pnpm anvil                      # anvil --code-size-limit 40000
```

In another terminal:

```bash
forge build
pnpm generate                   # deployoor reads out/, writes typed deployers
pnpm deploy:anvil
pnpm demo                       # mint, sign, executeLoan, repay
```

`pnpm demo` opens a loan from a third address and repays it, printing the real `loanId`, the
default order hash, and balances at each step. The order building and EIP-712 signing live in
[`scripts/lib/orders.ts`](scripts/lib/orders.ts), which is also what the article's widgets
import.

### The article

```bash
pnpm docs:dev
```

An interactive walkthrough: an order anatomy inspector, a lifecycle scrubber, and a red-team
console where every attack links to the test that proves it. Solidity snippets are pulled from the real `.sol` files at build time,
so the article cannot drift from the repo.

## Known limitations

Deliberate, and worth stating plainly.

Liquidation is a free option for the lender. The default order costs zero however far above the
debt the collateral is worth, and it never expires. A Dutch auction, with `startAmount` decaying
to `endAmount` across the window, fixes this without any new Pinkwhale code.

There is no refinancing and no partial repayment. Both are plausible as more orders rather than
more code, and I stopped before writing them.

Native ETH cannot be collateral, because a contract offerer cannot offer native tokens on
Seaport.

## Licence

MIT.
