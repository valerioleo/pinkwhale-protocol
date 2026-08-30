'use client';

import {useQuery} from '@tanstack/react-query';
import {parseEventLogs, parseAbiItem, type Address} from 'viem';

import {chain, publicClient} from './chain';
import {pinkwhaleAddress, seaport16Abi, seaport16Address} from './generated';
import PinkwhaleRecord from '../../deployments/84532-base-sepolia/Pinkwhale.json';

/**
 * The loan is on chain, not in the browser.
 *
 * `LoanExecuted` carries everything the UI needs, indexed by borrower, and Seaport
 * emits `OrderValidated` for the two orders Pinkwhale minted in the same
 * transaction — so the whole back half of the demo is readable from logs. Nothing
 * about a live loan needs storing.
 */
const LOAN_EXECUTED = parseAbiItem(
  'event LoanExecuted(bytes32 indexed loanId, address indexed lender, address indexed borrower, address executor, (uint8 itemType, address token, uint256 identifier, uint256 amount, address recipient)[] collateral, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] principal, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] repayment, uint256 expiry, bytes32 defaultOrderHash)'
);

/**
 * Where to start looking. Reading it off the deployment transaction keeps the
 * range bounded to the contract's own lifetime rather than the chain's, which is
 * what providers cap and what `fromBlock: 'earliest'` runs into.
 */
const deployedBlock = async () => {
  const receipt = await publicClient.getTransactionReceipt({
    hash: PinkwhaleRecord.transactionHash as `0x${string}`
  });

  return receipt.blockNumber;
};

export const useLoan = (borrower?: Address) =>
  useQuery({
    queryKey: ['loan', borrower],
    enabled: Boolean(borrower),
    refetchInterval: 5_000,
    queryFn: async () => {
      // `toBlock: 'latest'` is rejected outright by the CDP node — "invalid block
      // range params" — even for a range it happily serves when both ends are
      // numbers. So resolve the head first and ask for a concrete window.
      const [fromBlock, toBlock] = await Promise.all([deployedBlock(), publicClient.getBlockNumber()]);

      const logs = await publicClient.getLogs({
        address: pinkwhaleAddress[chain.id],
        event: LOAN_EXECUTED,
        args: {borrower},
        fromBlock,
        toBlock
      });

      const latest = logs.at(-1);

      if (!latest) return null;

      const {loanId, expiry, repayment, collateral, defaultOrderHash} = latest.args;

      // Pinkwhale minted two orders in this same transaction and Seaport announced
      // both with their full parameters, which is exactly the struct
      // `fulfillAdvancedOrder` wants back. So repaying and claiming need nothing
      // cached anywhere: the chain kept the orders for us.
      const receipt = await publicClient.getTransactionReceipt({hash: latest.transactionHash});
      const validated = parseEventLogs({
        abi: seaport16Abi,
        eventName: 'OrderValidated',
        logs: receipt.logs
      }).filter((log) => log.address.toLowerCase() === seaport16Address[chain.id].toLowerCase());

      const owed = repayment!.reduce(
        (total, item) => ({start: total.start + item.startAmount, end: total.end + item.endAmount}),
        {start: 0n, end: 0n}
      );

      const repaymentOrder = validated[0]?.args.orderParameters;
      const defaultOrder = validated[1]?.args.orderParameters;

      return {
        loanId: loanId!,
        expiry: expiry!,
        defaultOrderHash: defaultOrderHash!,
        owed,
        punks: collateral!.map((item) => Number(item.identifier)),
        repaymentOrder,
        defaultOrder,
        // The window is on the order itself; there is nothing to reconstruct.
        opensAt: repaymentOrder?.startTime ?? 0n,
        closesAt: repaymentOrder?.endTime ?? 0n
      };
    }
  });
