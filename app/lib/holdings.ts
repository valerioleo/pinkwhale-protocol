'use client';

import {useQuery, useQueryClient} from '@tanstack/react-query';
import type {Address} from 'viem';

import {chain, publicClient} from './chain';
import {cryptoPunksAbi, cryptoPunksAddress, usdcAbi, usdcAddress} from './generated';
import type {Persona, Personas} from './personas';

export type Holdings = {usdc: bigint; punks: number[]};

const EMPTY: Holdings = {usdc: 0n, punks: []};

/**
 * What an address holds, straight from the chain.
 *
 * The collection is enumerable, so ownership is a read rather than a replay of
 * Transfer logs — which keeps working after a cleared browser and needs no block
 * range that decays as the chain grows.
 */
const readHoldings = async (address: Address): Promise<Holdings> => {
  const punk = {abi: cryptoPunksAbi, address: cryptoPunksAddress[chain.id]} as const;

  const [usdc, balance] = await Promise.all([
    publicClient.readContract({
      abi: usdcAbi,
      address: usdcAddress[chain.id],
      functionName: 'balanceOf',
      args: [address]
    }),
    publicClient.readContract({...punk, functionName: 'balanceOf', args: [address]})
  ]);

  const punks = await Promise.all(
    Array.from({length: Number(balance)}, (_, index) =>
      publicClient.readContract({...punk, functionName: 'tokenOfOwnerByIndex', args: [address, BigInt(index)]})
    )
  );

  return {usdc, punks: punks.map(Number)};
};

export const holdingsKey = (address?: Address) => ['holdings', address] as const;

export const useHoldings = (address?: Address) => {
  const {data} = useQuery({
    queryKey: holdingsKey(address),
    queryFn: () => readHoldings(address!),
    enabled: Boolean(address)
  });

  return data ?? EMPTY;
};

const fund = async (address: Address, persona: Persona) => {
  const response = await fetch('/api/faucet', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({address, persona})
  });

  if (!response.ok) throw new Error((await response.json()).error ?? 'faucet failed');

  return response.json() as Promise<{punks: number[]; usdc: string}>;
};

/**
 * Funding is not something a visitor should have to ask for.
 *
 * Modelled as a query rather than a button because the endpoint is idempotent
 * against on-chain balances: asking twice is a read, so "make sure this address
 * has something" behaves exactly like any other piece of state to fetch.
 */
export const useAutoFund = (personas: Personas) => {
  const queryClient = useQueryClient();

  const ensure = (persona: Persona) => ({
    queryKey: ['funded', personas?.[persona]] as const,
    enabled: Boolean(personas),
    staleTime: Infinity,
    retry: 1,
    queryFn: async () => {
      const result = await fund(personas![persona], persona);

      await queryClient.invalidateQueries({queryKey: holdingsKey(personas![persona])});

      return result;
    }
  });

  // Two plain calls rather than a loop: hooks are positional, and a helper that
  // calls one is a helper waiting to be called conditionally.
  const lender = useQuery(ensure('lender'));
  const borrower = useQuery(ensure('borrower'));

  return {funding: lender.isFetching || borrower.isFetching, error: lender.error ?? borrower.error};
};
