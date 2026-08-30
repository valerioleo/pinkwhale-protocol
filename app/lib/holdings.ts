'use client';

import {useCallback, useEffect, useState} from 'react';
import {createPublicClient, http, type Address} from 'viem';

import {chain, CHAIN_ID} from './chain';
import {cryptoPunksAbi, cryptoPunksAddress, usdcAbi, usdcAddress} from './generated';
import type {Personas} from './personas';

/** Browser reads go through our route so the CDP token stays server-side. */
const client = createPublicClient({chain, transport: http('/api/rpc')});

export type Holdings = {usdc: bigint; punks: number[]};

const EMPTY: Holdings = {usdc: 0n, punks: []};

/**
 * What each persona holds, straight from the chain.
 *
 * The collection is enumerable, so this is a read rather than a replay of
 * Transfer logs — which matters because it stays true after a cleared browser and
 * needs no block range to keep working as the chain grows.
 */
const readHoldings = async (address: Address): Promise<Holdings> => {
  const punkConfig = {abi: cryptoPunksAbi, address: cryptoPunksAddress[CHAIN_ID]} as const;

  const [usdc, balance] = await Promise.all([
    client.readContract({
      abi: usdcAbi,
      address: usdcAddress[CHAIN_ID],
      functionName: 'balanceOf',
      args: [address]
    }),
    client.readContract({...punkConfig, functionName: 'balanceOf', args: [address]})
  ]);

  const punks = await Promise.all(
    Array.from({length: Number(balance)}, (_, index) =>
      client.readContract({...punkConfig, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(index)]})
    )
  );

  return {usdc, punks: punks.map(Number)};
};

export const useHoldings = (personas: Personas) => {
  const [lender, setLender] = useState<Holdings>(EMPTY);
  const [borrower, setBorrower] = useState<Holdings>(EMPTY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!personas) return;

    setLoading(true);
    const [next, nextBorrower] = await Promise.all([
      readHoldings(personas.lender),
      readHoldings(personas.borrower)
    ]);
    setLender(next);
    setBorrower(nextBorrower);
    setLoading(false);
  }, [personas]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {lender, borrower, loading, refresh};
};

/** Ask the server to mint. It is idempotent, so a second press costs nothing. */
export const fundPersona = async (address: Address, persona: 'lender' | 'borrower') => {
  const response = await fetch('/api/faucet', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({address, persona})
  });

  if (!response.ok) throw new Error((await response.json()).error ?? 'faucet failed');

  return response.json();
};
