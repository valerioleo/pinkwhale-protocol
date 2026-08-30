'use client';

import {AuthButton} from '@coinbase/cdp-react';
import {useIsSignedIn, useSignOut} from '@coinbase/cdp-hooks';
import {useEffect, useState} from 'react';

import {LoanRow} from '../components/LoanRow';
import {OrderBook} from '../components/OrderBook';
import {OrderPreview} from '../components/OrderPreview';
import {Step, type StepState} from '../components/Step';
import {TxList} from '../components/TxList';
import {WalletCard} from '../components/WalletCard';
import {useExecuteLoan} from '../lib/execute';
import {useAutoFund, useHoldings} from '../lib/holdings';
import {DURATION_LABEL, PRINCIPAL, REPAYMENT_USDC, termsFor} from '../lib/loan';
import {useLoan} from '../lib/loans';
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

  const storedLoan = useStoredLoan();
  const clearOrders = useClearOrders();
  const sign = useSignLoanOrder(personas);
  const execute = useExecuteLoan(personas, storedLoan);
  const {data: loan} = useLoan(personas?.borrower);
  const resolve = useResolveLoan(personas, loan);

  const [viewAs, setViewAs] = useState<'lender' | 'borrower'>('borrower');

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

  const finished = [bothSigned, Boolean(loan), Boolean(loan?.settled)];

  const stateOf = (step: number): StepState => {
    // Nothing is open until there are wallets to act with.
    if (!connected) return 'locked';

    return finished[step - 1] ? 'done' : finished.slice(0, step - 1).every(Boolean) ? 'active' : 'locked';
  };

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

      {/* Not a step: the two wallets are the ground everything else stands on. */}
      <section className="panel panel--wallets">
        <div className="panel-head">
          <h2>Your two wallets</h2>
          {connected ? <span className="panel-note">one email, two accounts</span> : null}
        </div>

        {connected ? (
          <>
            <div className="wallets">
              <WalletCard
                persona="lender"
                address={personas!.lender}
                holdings={lender}
                funding={funding}
              />
              <WalletCard
                persona="borrower"
                address={personas!.borrower}
                holdings={borrower}
                funding={funding}
              />
            </div>
            <p className="hint">
              A loan needs two sides. Both are funded the moment they exist, so there is nothing to
              claim and no faucet to find.
            </p>
            <TxList transactions={walletTxs} />
          </>
        ) : (
          <div className="signin">
            <p className="hint">
              Signing in creates two wallets under one email and funds them both.
            </p>
            <AuthButton />
            {creating ? <p className="hint">Creating the second wallet…</p> : null}
          </div>
        )}
      </section>

      <Step
        index={1}
        title="Create the orders"
        state={stateOf(1)}
        summary={bothSigned ? 'two signatures, nothing on chain' : 'off chain · costs nothing'}
      >
        <OrderPreview collateral={terms.collateral} />

        <p className="hint">
          One click signs both. They describe the same deal from opposite ends, and{' '}
          <code>executeLoan</code> will only match them if they agree item for item — which is why
          there is nothing here to fill in.
        </p>

        <button
          className="btn"
          disabled={sign.isPending || bothSigned || terms.collateral.length === 0}
          onClick={() => sign.mutate(terms)}
        >
          {sign.isPending ? 'Waiting for signatures…' : bothSigned ? 'Both signed' : 'Create orders'}
        </button>

        {sign.isError ? <p className="hint hint--bad">{(sign.error as Error).message}</p> : null}
        {storedLoan ? (
          <button className="btn btn--quiet" onClick={() => clearOrders.mutate()}>
            Start over
          </button>
        ) : null}
      </Step>

      <Step
        index={2}
        title="Match them"
        state={stateOf(2)}
        summary={loan ? 'collateral in escrow' : 'one transaction, either side may send it'}
      >
        <p className="hint">
          Two signatures sitting in your browser. Anyone at all can put them together — you, them,
          or a passing bot — and either the whole thing happens or none of it does.
        </p>
        <button className="btn" disabled={execute.isPending} onClick={() => execute.mutate()}>
          {execute.isPending ? 'Executing…' : 'Execute loan'}
        </button>
        {execute.isError ? (
          <p className="hint hint--bad">{(execute.error as Error).message}</p>
        ) : null}
        <TxList transactions={executeTxs} />
      </Step>

      <Step
        index={3}
        title="Repay, or don't"
        state={stateOf(3)}
        summary={
          loan?.settled ? (
            <span>{loan.repaid ? 'repaid' : 'defaulted, collateral claimed'}</span>
          ) : (
            'the clock decides'
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
            <TxList transactions={resolveTxs} />
          </>
        ) : (
          <p className="hint">Waiting for the loan…</p>
        )}
      </Step>

      {/* Always on: the four orders are the whole protocol, not a step in it. */}
      <section className="panel">
        <h2>The four orders</h2>
        <OrderBook stored={storedLoan} loan={loan} now={now} />
        <p className="hint">
          The top two are signed by people and spent the moment they match. The bottom two are
          minted by Pinkwhale and left on Seaport, each locked to one address. Same kind of object
          throughout — the only difference is who signed.
        </p>
      </section>
    </main>
  );
}
