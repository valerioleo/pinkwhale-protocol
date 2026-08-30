'use client';

import {useSendEvmTransaction} from '@coinbase/cdp-hooks';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {
  BaseError,
  RawContractError,
  decodeErrorResult,
  encodeFunctionData,
  maxUint256,
  type Address,
  type Hex
} from 'viem';

import {buildFulfillments, toAdvancedOrder} from '../../scripts/lib/orders';
import {chain, publicClient} from './chain';
import {
  cryptoPunksAbi,
  cryptoPunksAddress,
  pinkwhaleAbi,
  pinkwhaleAddress,
  seaport16Abi,
  seaport16Address,
  usdcAbi,
  usdcAddress
} from './generated';
import {holdingsKey} from './holdings';
import {useRecordTx} from './txLog';
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
 * Every typed revert either contract can produce.
 *
 * Pinkwhale's own errors say what went wrong — `LenderTermsMismatch`,
 * `RecipientMustBePinkwhale` — and Seaport's cover the ones thrown down inside the
 * match, where most signature and timing failures actually surface.
 */
const REVERT_ABI = [...pinkwhaleAbi, ...seaport16Abi].filter((entry) => entry.type === 'error');

/**
 * Run the call without sending it, and name whatever comes back.
 *
 * A failed send gives you a transaction hash and nothing else. This protocol's
 * error surface is entirely typed, so decoding it is the difference between
 * "reverted" and "the borrower asked for a longer term than the lender offered".
 */
const simulate = async (from: Address, data: Hex) => {
  try {
    await publicClient.call({account: from, to: pinkwhaleAddress[chain.id], data});
  } catch (error) {
    // viem buries the revert payload down the cause chain, which is why reading
    // `error.data` found nothing and every failure read as "unknown reason" even
    // when the node had returned a perfectly good selector.
    const raw = (error as BaseError).walk?.((e) => e instanceof RawContractError) as
      | RawContractError
      | undefined;

    const payload = raw?.data;
    const revertData = typeof payload === 'string' ? payload : payload?.data;

    if (revertData && revertData !== '0x') {
      const {errorName, args} = decodeErrorResult({abi: REVERT_ABI, data: revertData});
      const detail = args?.length ? ` (${args.join(', ')})` : '';

      throw new Error(`${errorName}${detail}`);
    }

    throw error;
  }
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
  const record = useRecordTx();

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
        record({
          step: 'execute',
          label: 'borrower approves Seaport',
          hash: await sendFrom(
            sendEvmTransaction,
            personas.borrower,
            punks.address,
            encodeFunctionData({
              abi: cryptoPunksAbi,
              functionName: 'setApprovalForAll',
              args: [SPENDER, true]
            })
          )
        });
      }

      if (usdcAllowance < lenderOrder.parameters.offer[0]!.startAmount) {
        record({
          step: 'execute',
          label: 'lender approves Seaport',
          hash: await sendFrom(
            sendEvmTransaction,
            personas.lender,
            usdc.address,
            encodeFunctionData({abi: usdcAbi, functionName: 'approve', args: [SPENDER, maxUint256]})
          )
        });
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

      // Simulate before sending. A failed send gives back a hash and nothing else,
      // and this protocol's whole error surface is typed — `LenderTermsMismatch`
      // says something, `reverted` does not. Seaport's ABI joins Pinkwhale's so a
      // revert thrown down inside the match decodes too.
      await simulate(personas.borrower, data);

      // Anyone may submit this; the borrower is simply whoever is standing here.
      const hash = await sendFrom(sendEvmTransaction, personas.borrower, pinkwhaleAddress[chain.id], data);

      record({step: 'execute', label: 'executeLoan', hash});

      return hash;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: holdingsKey(personas!.lender)});
      queryClient.invalidateQueries({queryKey: holdingsKey(personas!.borrower)});
    }
  });
};
