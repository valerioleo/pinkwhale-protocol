'use client';

import {useQuery} from '@tanstack/react-query';
import {parseAbiItem, parseEventLogs, type Address, type Log} from 'viem';

import {chain, publicClient} from './chain';
import {pinkwhaleAddress, seaport16Abi, seaport16Address} from './generated';
import PinkwhaleRecord from '../../deployments/84532-base-sepolia/Pinkwhale.json';

/**
 * A loan lives on chain, not in the browser.
 *
 * `LoanExecuted` carries everything the UI needs and is indexed by borrower, so a
 * visitor only ever sees their own. Seaport emits `OrderValidated` for the two
 * orders Pinkwhale minted in the same transaction, which is exactly the struct
 * `fulfillAdvancedOrder` wants back — so repaying and claiming need nothing cached.
 */
const LOAN_EXECUTED = parseAbiItem(
  'event LoanExecuted(bytes32 indexed loanId, address indexed lender, address indexed borrower, address executor, (uint8 itemType, address token, uint256 identifier, uint256 amount, address recipient)[] collateral, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] principal, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] repayment, uint256 expiry, bytes32 defaultOrderHash)'
);

type LoanLog = Log<bigint, number, false, typeof LOAN_EXECUTED>;

/**
 * Where to start looking. Reading it off the deployment transaction bounds the
 * range to the contract's own lifetime rather than the chain's.
 */
const deployedBlock = async () => {
  const receipt = await publicClient.getTransactionReceipt({
    hash: PinkwhaleRecord.transactionHash as `0x${string}`
  });

  return receipt.blockNumber;
};

const orderStatus = (hash: `0x${string}`) =>
  publicClient.readContract({
    abi: seaport16Abi,
    address: seaport16Address[chain.id],
    functionName: 'getOrderStatus',
    args: [hash]
  });

const describe = async (log: LoanLog) => {
  const {loanId, expiry, repayment, collateral, defaultOrderHash} = log.args;

  const receipt = await publicClient.getTransactionReceipt({hash: log.transactionHash});
  const validated = parseEventLogs({
    abi: seaport16Abi,
    eventName: 'OrderValidated',
    logs: receipt.logs
  }).filter((entry) => entry.address.toLowerCase() === seaport16Address[chain.id].toLowerCase());

  // How it ended, asked of Seaport rather than reassembled from events.
  // `getOrderStatus` is its own record of what has been filled, and the same
  // record the zone consults before letting a default claim through.
  const [repayStatus, defaultStatus] = await Promise.all([
    orderStatus(loanId!),
    orderStatus(defaultOrderHash!)
  ]);

  const repaid = repayStatus[2] > 0n;
  const claimed = defaultStatus[2] > 0n;
  const repaymentOrder = validated[0]?.args.orderParameters;

  return {
    loanId: loanId!,
    expiry: expiry!,
    defaultOrderHash: defaultOrderHash!,
    owed: repayment!.reduce(
      (total, item) => ({start: total.start + item.startAmount, end: total.end + item.endAmount}),
      {start: 0n, end: 0n}
    ),
    punks: collateral!.map((item) => Number(item.identifier)),
    repaymentOrder,
    defaultOrder: validated[1]?.args.orderParameters,
    repaid,
    claimed,
    settled: repaid || claimed,
    // The window is on the order itself; there is nothing to reconstruct.
    opensAt: repaymentOrder?.startTime ?? 0n,
    closesAt: repaymentOrder?.endTime ?? 0n
  };
};

export type Loan = Awaited<ReturnType<typeof describe>>;

/** Every loan this borrower has opened, and nobody else's: the filter is indexed. */
export const useLoans = (borrower?: Address) => {
  const {data} = useQuery({
    queryKey: ['loans', borrower],
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

      return Promise.all(logs.map((log) => describe(log as LoanLog)));
    }
  });

  const loans = data ?? [];

  return {loans, latest: loans.at(-1) ?? null};
};
