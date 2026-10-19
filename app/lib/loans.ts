'use client';

import {keepPreviousData, skipToken, useQuery, useQueryClient} from '@tanstack/react-query';
import {parseAbiItem, parseEventLogs, type Address, type Log} from 'viem';

import {blockAt, chain, fewAtATime, findFirstLog, publicClient, scanLogs} from './chain';
import {pinkwhaleAddress, seaport16Abi, seaport16Address} from './generated';
import type {Personas} from './personas';
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
 *
 * Held after the first answer: the block a contract was deployed in does not
 * change, and asking again on every poll is a receipt fetch for a constant.
 */
let deployedBlockOnce: Promise<bigint> | undefined;

const deployedBlock = () => {
  deployedBlockOnce ??= publicClient
    .getTransactionReceipt({hash: PinkwhaleRecord.transactionHash as `0x${string}`})
    .then((receipt) => receipt.blockNumber);

  return deployedBlockOnce;
};

const orderStatus = (hash: `0x${string}`) =>
  publicClient.readContract({
    abi: seaport16Abi,
    address: seaport16Address[chain.id],
    functionName: 'getOrderStatus',
    args: [hash]
  });

const LOAN_REPAID = parseAbiItem('event LoanRepaid(bytes32 indexed orderHash)');
const CLAIMED = parseAbiItem('event DefaultedCollateralClaimed(bytes32 indexed orderHash)');

/**
 * When the loan ended and in which transaction.
 *
 * The search starts at the block the loan opened in and stops at the first window
 * holding the fill, which is always after it and usually close behind — so it
 * costs what the loan lasted, not how long ago it was.
 */
const findResolution = async (log: LoanLog, repaid: boolean) => {
  const toBlock = await publicClient.getBlockNumber();

  const entry = await findFirstLog(log.blockNumber, toBlock, (window) =>
    publicClient.getLogs({
      address: pinkwhaleAddress[chain.id],
      event: repaid ? LOAN_REPAID : CLAIMED,
      args: {orderHash: repaid ? log.args.loanId : log.args.defaultOrderHash},
      ...window
    })
  );

  if (!entry) return null;

  const block = await publicClient.getBlock({blockNumber: entry.blockNumber});

  return {at: block.timestamp, hash: entry.transactionHash};
};

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

  // What it cost, and the transaction that ended it.
  //
  // Seaport interpolates against `block.timestamp`, so the amount a borrower
  // actually paid is the curve evaluated at the block their fill landed in — not
  // the total they agreed to. Reading the resolving event gives both that moment
  // and a hash worth linking.
  const resolution = repaid || claimed ? await findResolution(log, repaid) : null;

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
    resolvedAt: resolution?.at ?? null,
    resolutionHash: resolution?.hash ?? null,
    // The window is on the order itself; there is nothing to reconstruct.
    opensAt: repaymentOrder?.startTime ?? 0n,
    closesAt: repaymentOrder?.endTime ?? 0n
  };
};

export type Loan = Awaited<ReturnType<typeof describe>>;

/**
 * How far before the borrower's creation to start. CDP's clock and the chain's need
 * not agree to the second, and an hour of blocks costs nothing.
 */
const CLOCK_SLACK = 3600n;

/**
 * Blocks read again on every poll. A node can report a head before it has indexed
 * that block's logs, and a cursor moved past them would never look back.
 */
const OVERLAP = 30n;

/**
 * What has been read so far: the block it reaches, and every loan found before it.
 * It lives in the query's own data, so each poll reads only what came after.
 */
type Scan = {to: bigint; entries: {log: LoanLog; loan: Loan}[]};

const loansKey = (borrower?: Address) => ['loans', borrower] as const;

const logKey = (log: LoanLog) => `${log.transactionHash}:${log.logIndex}`;

const scanLoans = async (previous: Scan | undefined, borrower: Address, since: bigint): Promise<Scan> => {
  // `toBlock: 'latest'` is refused by this node even for a range it serves happily
  // with numeric ends, so the head is resolved first.
  const [head, deployed] = await Promise.all([publicClient.getBlock(), deployedBlock()]);

  // The first read starts at the borrower's creation rather than the contract's,
  // so a visitor's history costs what their own account's age costs.
  const created = blockAt(since - CLOCK_SLACK, head);
  const fromBlock = previous ? previous.to - OVERLAP : created > deployed ? created : deployed;

  const found = await scanLogs(fromBlock, head.number, (window) =>
    publicClient.getLogs({
      address: pinkwhaleAddress[chain.id],
      event: LOAN_EXECUTED,
      args: {borrower},
      ...window
    })
  );

  const known = new Map((previous?.entries ?? []).map((entry) => [logKey(entry.log), entry]));
  const logs = [...[...known.values()].map((entry) => entry.log), ...found.filter((log) => !known.has(logKey(log)))];

  // A settled loan is final, so it is described once and carried. Only the ones
  // still running are asked about again — and a few at a time, since each is a
  // handful of reads and a returning visitor can have dozens.
  const entries = await fewAtATime(logs, async (log) => {
    const entry = known.get(logKey(log));

    return entry?.loan.settled ? entry : {log, loan: await describe(log)};
  });

  return {to: previous && previous.to > head.number ? previous.to : head.number, entries};
};

/** Every loan this borrower has opened, and nobody else's: the filter is indexed. */
export const useLoans = (personas: Personas) => {
  const queryClient = useQueryClient();
  const borrower = personas?.borrower;

  const {data, isPending} = useQuery({
    queryKey: loansKey(borrower),
    // Nothing the visitor does waits on this: the mutations invalidate the key
    // directly, and the countdown runs on a local clock. The interval is how soon
    // someone else's fill shows up.
    refetchInterval: 15_000,
    // See the note in holdings.ts: once this list has been read, a changing key
    // must not put the section back to a skeleton it has already been past.
    placeholderData: keepPreviousData,
    queryFn: personas
      ? () =>
          scanLoans(
            queryClient.getQueryData<Scan>(loansKey(personas.borrower)),
            personas.borrower,
            personas.borrowerSince
          )
      : skipToken
  });

  const loans = data?.entries.map((entry) => entry.loan) ?? [];

  // `isPending` matters to callers: before the first answer arrives we do not know
  // whether a loan is running, and guessing 'no' makes the Orders section appear
  // and then vanish a moment later.
  return {loans, latest: loans.at(-1) ?? null, loading: isPending && Boolean(borrower)};
};
