'use client';

import {AuthButton} from '@coinbase/cdp-react';
import {useIsSignedIn, useSignOut} from '@coinbase/cdp-hooks';
import {useEffect, useState} from 'react';

import {LoanList} from '../components/LoanList';
import {OrderPreview} from '../components/OrderPreview';
import {Section} from '../components/Section';
import {TxList} from '../components/TxList';
import {ActorCard} from '../components/ActorCard';
import {useExecuteLoan} from '../lib/execute';
import {useAutoFund, useFundActors, useHoldings} from '../lib/holdings';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC, termsFor} from '../lib/loan';
import {useLoans} from '../lib/loans';
import {orderFor, useClearOrders, useStoredLoan} from '../lib/orderStore';
import {usePersonas} from '../lib/personas';
import {useResolveLoan} from '../lib/resolve';
import {useSignLoanOrder} from '../lib/signing';
import {USDC_DECIMALS} from '../lib/chain';
import {useTransactions} from '../lib/txLog';
import {formatUnits} from 'viem';

export default function Playground() {
  const {isSignedIn} = useIsSignedIn();
  const {signOut} = useSignOut();
  const {personas, creating} = usePersonas();

  const lender = useHoldings(personas?.lender);
  const borrower = useHoldings(personas?.borrower);
  const {funding} = useAutoFund(personas);
  const fundActors = useFundActors(personas, {lender, borrower});

  const storedLoan = useStoredLoan();
  const clearOrders = useClearOrders();
  const sign = useSignLoanOrder(personas);
  const execute = useExecuteLoan(personas, storedLoan);
  const {loans, loading: loansLoading} = useLoans(personas?.borrower);
  const resolve = useResolveLoan(personas);


  // The clock decides who can do what, so it has to be running.
  const [now, setNow] = useState(() => BigInt(Math.floor(Date.now() / 1000)));

  useEffect(() => {
    const timer = setInterval(() => setNow(BigInt(Math.floor(Date.now() / 1000))), 1000);

    return () => clearInterval(timer);
  }, []);

  const connected = Boolean(isSignedIn && personas);
  const borrowerOrder = orderFor(storedLoan, 'borrower');
  const lenderOrder = orderFor(storedLoan, 'lender');
  const bothSigned = Boolean(borrowerOrder && lenderOrder);

  /** The collateral on offer: whichever punk the borrower is holding. */
  const terms = termsFor(borrower.punks.slice(0, 1));

  /** While one is running there is nothing to create, and nothing to match. */
  const liveLoan = loans.some((entry) => !entry.settled);


  const executeTxs = useTransactions('execute');
  const resolveTxs = useTransactions('resolve');

  return (
    <main>
      <header className="masthead">
        <div>
          <h1>Pinkwhale playground</h1>
          <p className="sub">
            {formatUnits(PRINCIPAL, USDC_DECIMALS)} USDC against a CryptoPunk, {REPAYMENT_USDC} USDC
            back within {DURATION_LABEL}. Four ordinary Seaport orders.
          </p>
        </div>
        {connected ? (
          <button className="btn btn--quiet" onClick={() => signOut()}>
            Sign out
          </button>
        ) : null}
      </header>

      <Section
        title="Actors"
        aside={
          // Not while the automatic pass is still running: offering to fund what is
          // already being funded reads as the automatic pass having failed.
          connected && !funding && fundActors.short.length > 0 ? (
            <button
              className="btn btn--small btn--quiet"
              disabled={fundActors.isPending}
              onClick={() => fundActors.mutate()}
            >
              {fundActors.isPending ? 'Funding…' : 'Fund actors'}
            </button>
          ) : undefined
        }
      >
        {connected ? (
          <>
            <div className="actors">
              {(['borrower', 'lender'] as const).map((persona) => (
                <ActorCard
                  key={persona}
                  persona={persona}
                  address={personas![persona]}
                  holdings={persona === 'lender' ? lender : borrower}
                  funding={funding || fundActors.isPending}
                />
              ))}
            </div>
            <p className="hint">These are real Base Sepolia accounts.</p>
          </>
        ) : (
          <div className="signin">
            <p className="hint">
              Signing in creates two pre-funded actors on Base Sepolia, one to lend with and one
              to borrow with.
            </p>
            <AuthButton />
            {creating ? <p className="hint">Creating the second actor…</p> : null}
          </div>
        )}
      </Section>

      {connected && !loansLoading && !liveLoan ? (
        <Section title="Orders">
          {/* Read, then look, then act: the explanation goes above the thing it
              explains, and the button stays at the bottom where the reader ends up. */}
          {bothSigned ? (
            <p className="hint">
              Both orders are signed and sitting in your browser. Since they are two valid
              Seaport orders, anyone at all can execute them now.
            </p>
          ) : (
            <>
              <p className="hint">
                These are two canonical Seaport orders. The only particular part about them is
                the <code>zoneHash</code> specified as the Pinkwhale address, to guarantee they
                can be used only to create loans via Pinkwhale.
              </p>
              <p className="hint">
                These orders are created here together for convenience, but they would normally
                be signed independently on a marketplace orderbook, waiting to be matched.
              </p>
              <p className="hint">
                In this example, we simulate a lender who accepts any CryptoPunk as collateral
                for a loan, and a borrower accepting that order.
              </p>
            </>
          )}

          <OrderPreview collateral={terms.collateral} personas={personas} signed={bothSigned} />

          {bothSigned ? (
            <div className="row-actions">
              <button className="btn" disabled={execute.isPending} onClick={() => execute.mutate()}>
                {execute.isPending ? 'Matching…' : 'Match orders'}
              </button>
              <button className="btn btn--quiet" onClick={() => clearOrders.mutate()}>
                Discard
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn"
                disabled={sign.isPending || terms.collateral.length === 0}
                onClick={() => sign.mutate(terms)}
              >
                {sign.isPending ? 'Waiting for signatures…' : 'Create orders'}
              </button>
              {terms.collateral.length === 0 ? (
                <p className="hint">The borrower needs a punk to put up. Mint one above.</p>
              ) : null}
            </>
          )}

          {sign.isError ? <p className="hint hint--bad">{(sign.error as Error).message}</p> : null}
          {execute.isError ? (
            <p className="hint hint--bad">{(execute.error as Error).message}</p>
          ) : null}
          <TxList transactions={executeTxs} />
        </Section>
      ) : null}

      <Section title="Loans">
        {connected ? (
          <>
            <LoanList
              loans={loans}
              now={now}
              personas={personas}
              busy={resolve.isPending}
              onRepay={(loan) => resolve.mutate({loan, kind: 'repay'})}
              onClaim={(loan) => resolve.mutate({loan, kind: 'claim'})}
            />
            {resolve.isError ? (
              <p className="hint hint--bad">{(resolve.error as Error).message}</p>
            ) : null}
            <TxList transactions={resolveTxs} />
          </>
        ) : (
          <p className="hint">Sign in to see yours.</p>
        )}
      </Section>

    </main>
  );
}
