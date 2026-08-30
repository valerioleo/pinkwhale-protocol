'use client';

import {useQuery} from '@tanstack/react-query';
import {parseAbiItem, type Address} from 'viem';

import {chain, publicClient} from './chain';
import {pinkwhaleAddress} from './generated';
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
      const logs = await publicClient.getLogs({
        address: pinkwhaleAddress[chain.id],
        event: LOAN_EXECUTED,
        args: {borrower},
        fromBlock: await deployedBlock(),
        toBlock: 'latest'
      });

      const latest = logs.at(-1);

      if (!latest) return null;

      const {loanId, expiry, repayment, collateral, defaultOrderHash} = latest.args;

      return {
        loanId: loanId!,
        expiry: expiry!,
        defaultOrderHash: defaultOrderHash!,
        owed: repayment!.reduce((total, item) => total + item.endAmount, 0n),
        punks: collateral!.map((item) => Number(item.identifier))
      };
    }
  });
