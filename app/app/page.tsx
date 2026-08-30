'use client';

import {AuthButton} from '@coinbase/cdp-react';
import {useIsSignedIn, useSignOut} from '@coinbase/cdp-hooks';
import {useEffect, useState} from 'react';

import {LoanTable} from '../components/LoanTable';
import {OrderPreview} from '../components/OrderPreview';
import {Section} from '../components/Section';
import {TxList} from '../components/TxList';
import {WalletCard} from '../components/WalletCard';
import {useExecuteLoan} from '../lib/execute';
import {useAutoFund, useHoldings, useTopUp} from '../lib/holdings';
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
  const topUp = useTopUp(personas);

  const storedLoan = useStoredLoan();
  const clearOrders = useClearOrders();
  const sign = useSignLoanOrder(personas);
  const execute = useExecuteLoan(personas, storedLoan);
  const {loans} = useLoans(personas?.borrower);
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


  const walletTxs = useTransactions('wallets');
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

      <Section title="Wallets" aside={connected ? 'one email, two accounts' : undefined}>
        {connected ? (
          <>
            <div className="wallets">
              {(['lender', 'borrower'] as const).map((persona) => (
                <WalletCard
                  key={persona}
                  persona={persona}
                  address={personas![persona]}
                  holdings={persona === 'lender' ? lender : borrower}
                  funding={funding}
                  toppingUp={topUp.isPending && topUp.variables === persona}
                  onTopUp={() => topUp.mutate(persona)}
                />
              ))}
            </div>
            <p className="hint">
              One to lend with, one to borrow with, under a single email. Both are funded the
              moment they exist — assets and gas — so there is no faucet to find.
            </p>
            <TxList transactions={walletTxs} />
          </>
        ) : (
          <div className="signin">
            <p className="hint">
              Signing in creates two wallets on Base Sepolia, one to lend with and one to borrow
              with, and funds them both automatically.
            </p>
            <AuthButton />
            {creating ? <p className="hint">Creating the second wallet…</p> : null}
          </div>
        )}
      </Section>

      {connected && !liveLoan ? (
        <Section
          title="Orders"
          aside={bothSigned ? 'signed, nothing on chain yet' : 'off chain · costs nothing'}
        >
          <OrderPreview collateral={terms.collateral} signed={bothSigned} />

          {bothSigned ? (
            <>
              <p className="hint">
                Both sides are signed and sitting in your browser. Anyone at all can put them
                together — you, them, or a passing bot — and either the whole thing happens or none
                of it does.
              </p>
              <div className="row-actions">
                <button className="btn" disabled={execute.isPending} onClick={() => execute.mutate()}>
                  {execute.isPending ? 'Matching…' : 'Match orders'}
                </button>
                <button className="btn btn--quiet" onClick={() => clearOrders.mutate()}>
                  Discard
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="hint">
                One click signs both. The lender asks for <em>any</em> CryptoPunk rather than naming
                one, so the offer would fund whoever turned up first; the borrower names the punk
                they are putting up, and a resolver settles the two together at match time.
              </p>
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

      <Section title="Your loans" aside={connected ? 'read from the chain, by borrower' : undefined}>
        {connected ? (
          <>
            <LoanTable
              loans={loans}
              now={now}
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
