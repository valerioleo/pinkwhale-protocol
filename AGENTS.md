# AGENTS.md

## Cursor Cloud specific instructions

Pinkwhale is a single product: a Foundry/Solidity NFT-lending protocol built on Seaport 1.6,
plus viem/TypeScript deploy+demo scripts (`scripts/`) and a vocs/React documentation site
(`docs/`). There is no database and no always-on backend service.

### Toolchain (already provisioned in the VM)

- Foundry (`forge`, `anvil`, `cast`) is pinned to `1.7.1` (matches `.github/workflows/ci.yml`),
  installed under `~/.foundry/bin` and on `PATH` via `~/.bashrc`. If a shell ever cannot find
  `forge`, run `export PATH="$HOME/.foundry/bin:$PATH"`.
- Node 22 and `pnpm@9.15.9` are used. The startup update script runs
  `git submodule update --init --recursive` (fetches `lib/forge-std`) and
  `pnpm install --frozen-lockfile`.

### Non-obvious gotchas

- Order matters: `foundry.toml`/`remappings.txt` resolve Solidity imports from `node_modules`
  (seaport, openzeppelin) and `lib/forge-std`, so `pnpm install` and the submodule init MUST
  run before `forge build`/`forge test`. The update script already handles this.
- `forge build` prints `initcode size exceeds 49152 bytes` warnings for the test contracts and
  a code-size warning for locally-compiled Seaport (25,229 bytes). These are expected — Seaport's
  vendored source cannot go through the IR pipeline (`via_ir=false` is deliberate), so its
  bytecode is over EIP-170. This is why local `anvil` must run with `--code-size-limit 40000`
  (the `pnpm anvil` script already does this). Live networks register canonical Seaport instead.

### Standard commands (see `package.json` scripts)

- Lint: `forge fmt --check` (CI gate).
- Test: `forge test` — 31 tests, fully offline, deploys Seaport fresh in `setUp()`. This alone
  proves the open→repay and open→default flows; no keys/accounts/RPC needed.
- Typecheck: `pnpm typecheck`. Docs build: `pnpm docs:build`. Docs dev server: `pnpm docs:dev`.

### Running the on-chain demo (optional end-to-end)

Requires a local chain plus a deploy. `.env` is gitignored; create it once with
`cp .env.example .env` (defaults use Anvil account #0 — no secrets needed for local work).

1. Start the chain in its own terminal/tmux session: `pnpm anvil` (long-running).
2. In another shell: `forge build` → `pnpm generate` (regenerates typed deployers into
   `deployers/`) → `pnpm deploy:anvil` (idempotent) → `pnpm demo`.

`pnpm demo` opens a loan from a third address and repays it, printing the real `loanId`, the
default order hash, and balances at each step.

Gotcha: `pnpm demo` mints a fixed ERC721 `tokenId` and is NOT idempotent against a
long-running `anvil`. Re-running it against the same chain fails with
`ERC721: token already minted`. To re-run, restart `anvil` fresh (which resets state), then
re-run `pnpm deploy:anvil` before `pnpm demo`.
