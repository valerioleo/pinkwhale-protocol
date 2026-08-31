'use client';

import {useSendEvmTransaction} from '@coinbase/cdp-hooks';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {encodeFunctionData, maxUint256, zeroHash, type Address} from 'viem';

import {encodeResolutionExtraData, toAdvancedOrder} from '../../scripts/lib/orders';
import {chain, publicClient} from './chain';
import {seaport16Abi, seaport16Address, usdcAbi, usdcAddress} from './generated';
import {holdingsKey} from './holdings';
import {useRecordTx} from './txLog';

/**
 * How a loan ends.
 *
 * Both ways are ordinary Seaport fills of orders Pinkwhale minted when the loan
 * opened. Repaying pays what is owed and takes the collateral back; claiming a
 * default costs nothing at all, because the default order asks for nothing. The
 * zone decides which of the two is allowed, from the `zoneHash` each order
 * carries — which is why the wrong persona pressing the wrong button gets
 * `ZoneHashMismatch` rather than someone else's punk.
 */
type Resolvable = {
  loanId: `0x${string}`;
  repaymentOrder?: unknown;
  defaultOrder?: unknown;
};

export const useResolveLoan = (personas: {lender: Address; borrower: Address} | null) => {
  const {sendEvmTransaction} = useSendEvmTransaction();
  const queryClient = useQueryClient();
  const record = useRecordTx();

  return useMutation({
    mutationFn: async ({loan, kind}: {loan: Resolvable; kind: 'repay' | 'claim'}) => {
      if (!personas) throw new Error('not connected');

      const repaying = kind === 'repay';
      const order = repaying ? loan.repaymentOrder : loan.defaultOrder;
      const caller = repaying ? personas.borrower : personas.lender;

      if (!order) throw new Error('the resolution orders are not on this loan');

      // The default order names the repayment order it came from, and the zone
      // refuses the claim if that one has already been filled.
      const extraData = encodeResolutionExtraData(repaying ? zeroHash : loan.loanId);

      if (repaying) {
        const allowance = await publicClient.readContract({
          abi: usdcAbi,
          address: usdcAddress[chain.id],
          functionName: 'allowance',
          args: [personas.borrower, seaport16Address[chain.id]]
        });

        if (allowance === 0n) {
          record({
            step: 'resolve',
            label: 'borrower approves USDC',
            hash: await send(sendEvmTransaction, personas.borrower, usdcAddress[chain.id],
              encodeFunctionData({
                abi: usdcAbi,
                functionName: 'approve',
                args: [seaport16Address[chain.id], maxUint256]
              })
            )
          });
        }
      }

      const data = encodeFunctionData({
        abi: seaport16Abi,
        functionName: 'fulfillAdvancedOrder',
        args: [toAdvancedOrder(order as never, '0x', extraData), [], zeroHash, caller] as never
      });

      const hash = await send(sendEvmTransaction, caller, seaport16Address[chain.id], data);

      record({step: 'resolve', label: repaying ? 'repay' : 'claim collateral', hash});

      return hash;
    },
    // Awaited: see the note in execute.ts. Without it the button re-enables for
    // a beat before the refetch replaces it, which reads as the action failing.
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: ['loans']}),
        queryClient.invalidateQueries({queryKey: holdingsKey(personas!.lender)}),
        queryClient.invalidateQueries({queryKey: holdingsKey(personas!.borrower)})
      ]);
    }
  });
};

const send = async (
  sendEvmTransaction: ReturnType<typeof useSendEvmTransaction>['sendEvmTransaction'],
  account: Address,
  to: Address,
  data: `0x${string}`
) => {
  const {transactionHash} = await sendEvmTransaction({
    evmAccount: account,
    network: 'base-sepolia',
    transaction: {to, data, chainId: chain.id, type: 'eip1559'}
  });

  const receipt = await publicClient.waitForTransactionReceipt({hash: transactionHash});

  if (receipt.status !== 'success') throw new Error('reverted');

  return transactionHash;
};
