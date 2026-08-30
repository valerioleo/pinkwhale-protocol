'use client';

import {useSendEvmTransaction} from '@coinbase/cdp-hooks';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {encodeFunctionData, maxUint256, type Address} from 'viem';

import {buildFulfillments, toAdvancedOrder} from '../../scripts/lib/orders';
import {chain, publicClient} from './chain';
import {
  cryptoPunksAbi,
  cryptoPunksAddress,
  pinkwhaleAbi,
  pinkwhaleAddress,
  seaport16Address,
  usdcAbi,
  usdcAddress
} from './generated';
import {holdingsKey} from './holdings';
import {buildRepaymentTerms} from './loan';
import {orderFor, type StoredLoan} from './orderStore';
import type {Personas} from './personas';

const NETWORK = 'base-sepolia' as const;

/**
 * Seaport moves the tokens, so Seaport is what gets approved — not Pinkwhale.
 * Pinkwhale never touches a balance directly; it matches orders and takes custody
 * of whatever the match sends it.
 */
const SPENDER = seaport16Address[chain.id];

type Send = ReturnType<typeof useSendEvmTransaction>['sendEvmTransaction'];

const sendFrom = async (send: Send, account: Address, to: Address, data: `0x${string}`) => {
  const {transactionHash} = await send({
    evmAccount: account,
    network: NETWORK,
    transaction: {to, data, chainId: chain.id, type: 'eip1559'}
  });

  const receipt = await publicClient.waitForTransactionReceipt({hash: transactionHash});

  if (receipt.status !== 'success') throw new Error(`transaction reverted: ${transactionHash}`);

  return transactionHash;
};

/**
 * Turn two signatures into a loan.
 *
 * The approvals are checked rather than assumed, so a rerun after a failure does
 * not pay for them twice. Both personas approve because both are giving something
 * up: the borrower's punks and the lender's USDC move in the same match.
 */
export const useExecuteLoan = (personas: Personas, loan: StoredLoan | null) => {
  const {sendEvmTransaction} = useSendEvmTransaction();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const borrowerOrder = orderFor(loan, 'borrower');
      const lenderOrder = orderFor(loan, 'lender');

      if (!personas || !loan || !borrowerOrder || !lenderOrder) throw new Error('nothing to execute');

      const punks = {abi: cryptoPunksAbi, address: cryptoPunksAddress[chain.id]} as const;
      const usdc = {abi: usdcAbi, address: usdcAddress[chain.id]} as const;

      const [punksApproved, usdcAllowance] = await Promise.all([
        publicClient.readContract({
          ...punks,
          functionName: 'isApprovedForAll',
          args: [personas.borrower, SPENDER]
        }),
        publicClient.readContract({
          ...usdc,
          functionName: 'allowance',
          args: [personas.lender, SPENDER]
        })
      ]);

      if (!punksApproved) {
        await sendFrom(
          sendEvmTransaction,
          personas.borrower,
          punks.address,
          encodeFunctionData({
            abi: cryptoPunksAbi,
            functionName: 'setApprovalForAll',
            args: [SPENDER, true]
          })
        );
      }

      if (usdcAllowance < lenderOrder.parameters.offer[0]!.startAmount) {
        await sendFrom(
          sendEvmTransaction,
          personas.lender,
          usdc.address,
          encodeFunctionData({abi: usdcAbi, functionName: 'approve', args: [SPENDER, maxUint256]})
        );
      }

      // The terms travel as plain calldata and only count because each order's
      // zoneHash commits to their hash. Rebuilt from the same stored terms the
      // signatures were made over, so they reproduce those hashes exactly.
      const {lenderTerms, borrowerTerms} = buildRepaymentTerms(loan.terms, personas);

      const data = encodeFunctionData({
        abi: pinkwhaleAbi,
        functionName: 'executeLoan',
        args: [
          toAdvancedOrder(lenderOrder.parameters, lenderOrder.signature),
          toAdvancedOrder(borrowerOrder.parameters, borrowerOrder.signature),
          lenderTerms,
          borrowerTerms,
          [],
          buildFulfillments(
            lenderOrder.parameters.offer.length,
            borrowerOrder.parameters.offer.length
          )
        ] as never
      });

      // Anyone may submit this; the borrower is simply whoever is standing here.
      return sendFrom(sendEvmTransaction, personas.borrower, pinkwhaleAddress[chain.id], data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: holdingsKey(personas!.lender)});
      queryClient.invalidateQueries({queryKey: holdingsKey(personas!.borrower)});
    }
  });
};
