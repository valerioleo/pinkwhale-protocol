'use client';

import {useSignEvmTypedData} from '@coinbase/cdp-hooks';
import {useMutation} from '@tanstack/react-query';
import type {Address, Hex} from 'viem';

import {buildOrderTypedData, type OrderParameters} from '../../scripts/lib/orders';
import {chain, publicClient} from './chain';
import {seaport16Abi, seaport16Address} from './generated';
import {buildLoanOrders, type LoanTerms} from './loan';
import {useSaveOrder, type StoredOrder} from './orderStore';

/**
 * Signing a creation order.
 *
 * The payload comes from `buildOrderTypedData`, the same function the Foundry-side
 * end-to-end script signs through, so the browser and the test suite put a
 * signature over identical bytes. Only the wallet differs.
 *
 * The counter is read fresh rather than cached: Seaport folds it into the order
 * hash, and a stale one produces a signature that verifies against nothing.
 */
export const useSignLoanOrder = (personas: {lender: Address; borrower: Address} | null) => {
  const {signEvmTypedData} = useSignEvmTypedData();
  const saveOrder = useSaveOrder();

  return useMutation({
    mutationFn: async (terms: LoanTerms) => {
      if (!personas) throw new Error('not connected');

      // Both orders come from one `now`, so they share a window and the pair
      // cannot half-expire between two prompts.
      const now = BigInt(Math.floor(Date.now() / 1000));
      const built = buildLoanOrders(terms, personas, now);

      const sign = async (side: 'lender' | 'borrower'): Promise<StoredOrder> => {
        const parameters: OrderParameters = side === 'lender' ? built.lenderOrder : built.borrowerOrder;

        const counter = await publicClient.readContract({
          abi: seaport16Abi,
          address: seaport16Address[chain.id],
          functionName: 'getCounter',
          args: [parameters.offerer]
        });

        const typedData = buildOrderTypedData(seaport16Address[chain.id], chain.id, parameters, counter);

        const {signature} = await signEvmTypedData({
          evmAccount: parameters.offerer,
          // CDP takes the same {domain, types, primaryType, message} viem does, but
          // wants every value JSON-safe, and an order is bigints most of the way down.
          typedData: JSON.parse(
            JSON.stringify(typedData, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))
          )
        });

        const order: StoredOrder = {side, parameters, signature: signature as Hex};

        await saveOrder.mutateAsync({terms, order});

        return order;
      };

      // Sequential: each save reads the stored loan back, so two at once would
      // race and one side would overwrite the other.
      const borrower = await sign('borrower');
      const lender = await sign('lender');

      return {borrower, lender};
    }
  });
};

/** What the two orders will say, before anyone signs anything. */
export const previewOrders = (
  terms: LoanTerms,
  personas: {lender: Address; borrower: Address} | null
) => (personas ? buildLoanOrders(terms, personas, BigInt(Math.floor(Date.now() / 1000))) : null);
