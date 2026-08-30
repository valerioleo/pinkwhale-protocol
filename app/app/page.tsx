'use client';

import {AuthButton} from '@coinbase/cdp-react';
import {useIsSignedIn} from '@coinbase/cdp-hooks';
import {formatUnits} from 'viem';

import {Punk} from '../components/Punk';
import {Step, type StepState} from '../components/Step';
import {TermsForm} from '../components/TermsForm';
import {USDC_DECIMALS} from '../lib/chain';
import {useFaucet, useHoldings} from '../lib/holdings';
import {DURATIONS, PRINCIPAL, type LoanTerms} from '../lib/loan';
import {useExecuteLoan} from '../lib/execute';
import {LoanRow} from '../components/LoanRow';
import {useLoan} from '../lib/loans';
import {useResolveLoan} from '../lib/resolve';
import {orderFor, useStoredLoan} from '../lib/orderStore';
import {usePersonas} from '../lib/personas';
import {useSignLoanOrder} from '../lib/signing';
import {useState} from 'react';

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export default function Playground() {
  const {isSignedIn} = useIsSignedIn();
  const {personas, creating} = usePersonas();
  const lender = useHoldings(personas?.lender);
  const borrower = useHoldings(personas?.borrower);
  const faucet = useFaucet(personas);
  const storedLoan = useStoredLoan();
  const sign = useSignLoanOrder(personas);
  const execute = useExecuteLoan(personas, storedLoan);
  const {data: loan} = useLoan(personas?.borrower);
  const resolve = useResolveLoan(personas, loan);
  const [viewAs, setViewAs] = useState<'lender' | 'borrower'>('lender');

  const [terms, setTerms] = useState<LoanTerms>({
    collateral: [],
    repaymentUsdc: 110,
    durationSeconds: DURATIONS[0].seconds
  });

  const minting = faucet.isPending ? faucet.variables : null;
  const signing = sign.isPending ? sign.variables?.side : null;

  const borrowerOrder = orderFor(storedLoan, 'borrower');
  const lenderOrder = orderFor(storedLoan, 'lender');

  const connected = Boolean(isSignedIn && personas);
  const hasPunks = borrower.punks.length > 0;
  const hasUsdc = lender.usdc > 0n;

  /**
   * Whether each step is finished, in order. Derived from the chain and from what
   * is signed, so a refresh lands where you left off rather than at the start.
   */
  const finished = [
    connected,
    hasPunks,
    Boolean(borrowerOrder),
    hasUsdc,
    Boolean(lenderOrder),
    Boolean(loan),
    Boolean(loan?.repaymentOrder),
    Boolean(loan?.settled)
  ];

  /**
   * A step opens when everything before it is done. Deriving it from the sequence
   * rather than writing a condition per step means a gate cannot be left behind
   * when the step above it starts working.
   */
  const stateOf = (step: number): StepState =>
    finished[step - 1] ? 'done' : finished.slice(0, step - 1).every(Boolean) ? 'active' : 'locked';

  return (
    <main>
      <h1>Pinkwhale playground</h1>
      <p className="sub">
        A whole loan, built out of ordinary Seaport orders. Base Sepolia, gas sponsored.
      </p>

      <Step
        index={1}
        title="Connect"
        state={stateOf(1)}
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
        state={stateOf(2)}
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
        state={stateOf(3)}
        summary={
          borrowerOrder
            ? `${borrowerOrder.parameters.offer.length} pledged · ${storedLoan!.terms.repaymentUsdc} USDC back`
            : 'off chain · costs nothing'
        }
      >
        <TermsForm owned={borrower.punks} terms={terms} onChange={setTerms} />
        <button
          className="btn"
          disabled={terms.collateral.length === 0 || sign.isPending}
          onClick={() => sign.mutate({side: 'borrower', terms})}
        >
          {signing === 'borrower' ? 'Waiting for signature…' : 'Sign request'}
        </button>
        {sign.isError ? <p className="hint hint--bad">{(sign.error as Error).message}</p> : null}
        <p className="hint">
          Nothing reaches the chain here. A signature costs no gas and commits to nothing until
          somebody submits it.
        </p>
      </Step>

      <Step
        index={4}
        title="Mint USDC"
        persona="lender"
        state={stateOf(4)}
        summary={hasUsdc ? `${formatUnits(lender.usdc, USDC_DECIMALS)} USDC` : 'something to lend'}
      >
        <button className="btn" onClick={() => faucet.mutate('lender')} disabled={faucet.isPending}>
          {minting === 'lender' ? 'Minting…' : 'Mint 10,000 USDC'}
        </button>
      </Step>

      <Step
        index={5}
        title="Sign the matching lender offer"
        persona="lender"
        state={stateOf(5)}
        summary={
          lenderOrder ? 'mirrored and signed' : 'derived from step 3, not retyped'
        }
      >
        {storedLoan ? (
          <dl className="mirror">
            <div>
              <dt>you lend</dt>
              <dd>{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</dd>
            </div>
            <div>
              <dt>you get back</dt>
              <dd>{storedLoan.terms.repaymentUsdc} USDC</dd>
            </div>
            <div>
              <dt>against</dt>
              <dd className="punks-inline">
                {storedLoan.terms.collateral.map((id: number) => (
                  <Punk key={id} id={id} scale={1} />
                ))}
                {storedLoan.terms.collateral.map((id: number) => `#${id}`).join(' · ')}
              </dd>
            </div>
          </dl>
        ) : null}
        <button
          className="btn"
          disabled={!borrowerOrder || sign.isPending}
          onClick={() => sign.mutate({side: 'lender', terms: storedLoan!.terms})}
        >
          {signing === 'lender' ? 'Waiting for signature…' : 'Sign the mirror'}
        </button>
        <p className="hint">
          Nothing to fill in. <code>executeLoan</code> needs both sides to describe the same
          repayment item for item, with duration the only slack — so the lender mirrors the
          borrower or the match reverts.
        </p>
      </Step>
      <Step
        index={6}
        title="Your order book"
        state={stateOf(6)}
        summary={
          <span className="seg seg--small">
            {(['lender', 'borrower'] as const).map((side) => (
              <button
                key={side}
                type="button"
                className={viewAs === side ? 'on' : ''}
                onClick={() => setViewAs(side)}
              >
                {side}
              </button>
            ))}
          </span>
        }
      >
        <table className="book">
          <thead>
            <tr>
              <th>order</th>
              <th>gives</th>
              <th>gets</th>
              <th>state</th>
            </tr>
          </thead>
          <tbody>
            <tr className="row--lender">
              <td>{viewAs === 'lender' ? 'my offer' : 'their offer'}</td>
              <td>{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</td>
              <td>punks → escrow</td>
              <td>signed</td>
            </tr>
            <tr className="row--borrower">
              <td>{viewAs === 'borrower' ? 'my request' : 'their request'}</td>
              <td className="punks-inline">
                {storedLoan?.terms.collateral.map((id: number) => (
                  <Punk key={id} id={id} scale={1} />
                ))}
              </td>
              <td>{formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC</td>
              <td>signed</td>
            </tr>
          </tbody>
        </table>

        <p className="hint">
          Flipping the switch relabels the columns and nothing else, because nothing else can:
          the pair is symmetric and either side may settle it. Both signatures are sitting in
          your browser — Seaport has nowhere to keep an order either.
        </p>

        <button className="btn" disabled={execute.isPending} onClick={() => execute.mutate()}>
          {execute.isPending ? 'Executing…' : 'Execute loan'}
        </button>
        {execute.isError ? (
          <p className="hint hint--bad">{(execute.error as Error).message}</p>
        ) : null}
      </Step>
      <Step
        index={7}
        title="Two orders you never signed"
        state={stateOf(7)}
        summary="minted by Pinkwhale, in the same transaction"
      >
        <table className="book">
          <thead>
            <tr>
              <th>order</th>
              <th>offers</th>
              <th>wants</th>
              <th>who may fill</th>
            </tr>
          </thead>
          <tbody>
            <tr className="row--minted">
              <td>repayment</td>
              <td>the collateral</td>
              <td>
                {formatUnits(loan?.owed.start ?? 0n, USDC_DECIMALS)} →{' '}
                {formatUnits(loan?.owed.end ?? 0n, USDC_DECIMALS)} USDC
              </td>
              <td>only the borrower</td>
            </tr>
            <tr className="row--minted">
              <td>default</td>
              <td>the collateral</td>
              <td>
                <strong>nothing</strong>
              </td>
              <td>only the lender</td>
            </tr>
          </tbody>
        </table>
        <p className="hint">
          You signed two orders; these are two more, minted by Pinkwhale and left on Seaport. The
          ones you signed live in your browser. These live on chain, read back out of Seaport&apos;s
          own <code>OrderValidated</code> logs — which is the whole split a real marketplace has to
          bridge.
        </p>
      </Step>

      <Step
        index={8}
        title="The loan"
        state={stateOf(8)}
        summary={
          loan?.settled ? (
            <span>{loan.repaid ? 'repaid' : 'defaulted, collateral claimed'}</span>
          ) : (
          <span className="seg seg--small">
            {(['lender', 'borrower'] as const).map((side) => (
              <button
                key={side}
                type="button"
                className={viewAs === side ? 'on' : ''}
                onClick={() => setViewAs(side)}
              >
                {side}
              </button>
            ))}
          </span>
          )
        }
      >
        {loan ? (
          <>
            <LoanRow
              loan={loan}
              viewAs={viewAs}
              busy={resolve.isPending}
              onRepay={() => resolve.mutate('repay')}
              onClaim={() => resolve.mutate('claim')}
            />
            {resolve.isError ? (
              <p className="hint hint--bad">{(resolve.error as Error).message}</p>
            ) : null}
            <p className="hint">
              Same loan, two truths. Flip the switch and the button changes, because the two
              orders below are each locked to one address.
            </p>
          </>
        ) : (
          <p className="hint">Waiting for the loan…</p>
        )}
      </Step>

    </main>
  );
}
