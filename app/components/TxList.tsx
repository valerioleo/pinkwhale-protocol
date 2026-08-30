'use client';

import {explorerUrl, type Tx} from '../lib/txLog';

const short = (hash: string) => `${hash.slice(0, 10)}…${hash.slice(-6)}`;

/** The receipts. Every line is a real transaction on Base Sepolia. */
export const TxList = ({transactions}: {transactions: Tx[]}) => {
  if (transactions.length === 0) return null;

  return (
    <ul className="txs">
      {transactions.map((tx) => (
        <li key={tx.hash}>
          <span className="tx-label">{tx.label}</span>
          <a href={explorerUrl(tx.hash)} target="_blank" rel="noreferrer">
            {short(tx.hash)} ↗
          </a>
        </li>
      ))}
    </ul>
  );
};
