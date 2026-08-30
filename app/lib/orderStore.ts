'use client';

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import type {Hex} from 'viem';

import type {OrderParameters} from '../../scripts/lib/orders';
import type {LoanTerms} from './loan';

/**
 * Signed orders live in the visitor's own browser.
 *
 * Not a shortcut: Seaport has nowhere to keep an order either. A signed order is
 * a JSON object and a signature, and until someone submits it, it lives wherever
 * whoever holds it decides to put it. That gap is the one piece of infrastructure
 * a real marketplace on this protocol cannot avoid building — so leaving it visible
 * is more honest than hiding it behind a table we run.
 */
const KEY = 'pinkwhale.orders';

export type StoredOrder = {
  side: 'lender' | 'borrower';
  parameters: OrderParameters;
  signature: Hex;
};

export type StoredLoan = {
  terms: LoanTerms;
  orders: StoredOrder[];
};

/** bigint is the whole vocabulary of an order, and JSON has no opinion about it. */
const replacer = (_key: string, value: unknown) =>
  typeof value === 'bigint' ? {__bigint: value.toString()} : value;

const reviver = (_key: string, value: unknown) => {
  if (value && typeof value === 'object' && '__bigint' in value) {
    return BigInt((value as {__bigint: string}).__bigint);
  }

  return value;
};

const read = (): StoredLoan | null => {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(KEY);

  return raw ? (JSON.parse(raw, reviver) as StoredLoan) : null;
};

export const storedLoanKey = ['storedLoan'] as const;

export const useStoredLoan = () => {
  const {data} = useQuery({queryKey: storedLoanKey, queryFn: async () => read(), staleTime: Infinity});

  return data ?? null;
};

export const useSaveOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({terms, order}: {terms: LoanTerms; order: StoredOrder}) => {
      const current = read();

      // A change of terms starts a new loan: a lender order that mirrors terms
      // nobody is offering any more would only fail at `executeLoan`.
      const sameTerms = current && JSON.stringify(current.terms, replacer) === JSON.stringify(terms, replacer);

      const next: StoredLoan = {
        terms,
        orders: [
          ...(sameTerms ? current.orders.filter((o) => o.side !== order.side) : []),
          order
        ]
      };

      window.localStorage.setItem(KEY, JSON.stringify(next, replacer));

      return next;
    },
    onSuccess: (next) => queryClient.setQueryData(storedLoanKey, next)
  });
};

export const useClearOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      window.localStorage.removeItem(KEY);
      return null;
    },
    onSuccess: () => queryClient.setQueryData(storedLoanKey, null)
  });
};

export const orderFor = (loan: StoredLoan | null, side: 'lender' | 'borrower') =>
  loan?.orders.find((order) => order.side === side) ?? null;
