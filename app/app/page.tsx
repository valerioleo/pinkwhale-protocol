'use client';

import {AuthButton} from '@coinbase/cdp-react';
import {useIsSignedIn} from '@coinbase/cdp-hooks';
import {formatUnits} from 'viem';

import {Punk} from '../components/Punk';
import {Step, type StepState} from '../components/Step';
import {USDC_DECIMALS} from '../lib/chain';
import {useFaucet, useHoldings} from '../lib/holdings';
import {usePersonas} from '../lib/personas';

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export default function Playground() {
  const {isSignedIn} = useIsSignedIn();
  const {personas, creating} = usePersonas();
  const lender = useHoldings(personas?.lender);
  const borrower = useHoldings(personas?.borrower);
  const faucet = useFaucet(personas);

  const minting = faucet.isPending ? faucet.variables : null;

  const connected = Boolean(isSignedIn && personas);
  const hasPunks = borrower.punks.length > 0;
  const hasUsdc = lender.usdc > 0n;

  /** Every step is derived from chain state, so a refresh lands where you left off. */
  const state = (done: boolean, unlocked: boolean): StepState =>
    done ? 'done' : unlocked ? 'active' : 'locked';

  return (
    <main>
      <h1>Pinkwhale playground</h1>
      <p className="sub">
        A whole loan, built out of ordinary Seaport orders. Base Sepolia, gas sponsored.
      </p>

      <Step
        index={1}
        title="Connect"
        state={state(connected, true)}
        summary={
          connected ? (
            <>
              <span className="tag tag--lender">{short(personas!.lender)}</span>
              <span className="tag tag--borrower">{short(personas!.borrower)}</span>
            </>
          ) : (
            'one email, two wallets'
          )
        }
      >
        <p className="hint">
          A loan needs two sides, so signing in mints two wallets under one email. The step you are
          on says which one is acting — you never pick.
        </p>
        <AuthButton />
        {creating ? <p className="hint">Creating the second wallet…</p> : null}
      </Step>

      <Step
        index={2}
        title="Mint collateral"
        persona="borrower"
        state={state(hasPunks, connected)}
        summary={
          hasPunks ? (
            <span className="punks-inline">
              {borrower.punks.map((id: number) => (
                <Punk key={id} id={id} scale={1} />
              ))}
              {borrower.punks.map((id: number) => `#${id}`).join(' · ')}
            </span>
          ) : (
            'two punks, picked on chain'
          )
        }
      >
        <p className="hint">
          <code>mintRandom</code> seeds off the previous block hash, so which punks you get is
          decided when the transaction lands. Two of them, so the bundle in step 3 is a real choice.
        </p>
        <button className="btn" onClick={() => faucet.mutate('borrower')} disabled={faucet.isPending}>
          {minting === 'borrower' ? 'Minting…' : 'Mint two punks'}
        </button>
      </Step>

      <Step
        index={3}
        title="Sign your borrow request"
        persona="borrower"
        state={state(false, hasPunks)}
        summary="off chain · costs nothing"
      >
        <p className="hint">Next.</p>
      </Step>

      <Step
        index={4}
        title="Mint USDC"
        persona="lender"
        state={state(hasUsdc, false)}
        summary={hasUsdc ? `${formatUnits(lender.usdc, USDC_DECIMALS)} USDC` : 'something to lend'}
      >
        <button className="btn" onClick={() => faucet.mutate('lender')} disabled={faucet.isPending}>
          {minting === 'lender' ? 'Minting…' : 'Mint 10,000 USDC'}
        </button>
      </Step>

      <Step index={5} title="Sign the matching lender offer" persona="lender" state="locked" summary="derived from step 3, not retyped" />
      <Step index={6} title="Your order book" state="locked" summary="two signatures, nothing on chain yet" />
      <Step index={7} title="The loan" state="locked" summary="interest ticking, repay when you like" />
      <Step index={8} title="Two orders you never signed" state="locked" summary="minted by Pinkwhale" />
    </main>
  );
}
