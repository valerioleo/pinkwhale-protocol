'use client';

import {useQuery, useQueryClient} from '@tanstack/react-query';

import {chain} from './chain';

/**
 * Every transaction the playground has sent, so the claim that this is all real
 * is checkable rather than asserted.
 *
 * Kept in the query cache rather than component state because the mutations that
 * produce hashes are spread across hooks, and threading a callback through all of
 * them to reach one list is more plumbing than the list is worth.
 */
export type Tx = {label: string; hash: `0x${string}`; step: string};

const KEY = ['transactions'] as const;

export const explorerUrl = (hash: string) => `${chain.blockExplorers.default.url}/tx/${hash}`;

export const useTransactions = (step?: string) => {
  const {data} = useQuery({queryKey: KEY, queryFn: async (): Promise<Tx[]> => [], staleTime: Infinity});
  const all = data ?? [];

  return step ? all.filter((tx) => tx.step === step) : all;
};

export const useRecordTx = () => {
  const queryClient = useQueryClient();

  return (tx: Tx) =>
    queryClient.setQueryData(KEY, (previous: Tx[] | undefined) =>
      // Idempotent: a retried mutation should not double up the list.
      (previous ?? []).some((seen) => seen.hash === tx.hash) ? previous : [...(previous ?? []), tx]
    );
};
