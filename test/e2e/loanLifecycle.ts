/**
 * A whole loan, start to finish, against a running anvil.
 *
 *   anvil --code-size-limit 40000        # in another terminal
 *   pnpm test:e2e
 *
 * The Solidity suites drive Pinkwhale through Foundry; this drives it through the
 * same viem path a frontend would, so the order building and EIP-712 signing in
 * `scripts/lib/orders.ts` are exercised against a real node.
 *
 * It stands the contracts up with the deployers in `scripts/deploy/`, so there is
 * one definition of what gets deployed and with which constructor args.
 */
import {parseEventLogs, zeroHash, type Address, type Hex} from 'viem';
import {anvil} from 'viem/chains';

import {
  chain,
  getAdminWallet,
  localWallet,
  publicClient,
  type WalletWithAccount
} from '../../scripts/clients';
import {deployPinkwhale} from '../../scripts/deploy/pinkwhale';
import {getSeaportContract} from '../../scripts/deploy/seaport';
import {deployCollection, deployCurrency} from '../../scripts/deploy/tokens';
import {
  ItemType,
  OrderType,
  buildFulfillments,
  encodeResolutionExtraData,
  getBorrowerTermsHash,
  getLenderTermsHash,
  signOrder,
  toAdvancedOrder,
  type ConsiderationItem,
  type OfferItem,
  type OrderParameters
} from '../../scripts/lib/orders';

// anvil's default mnemonic, accounts 1 to 3.
const LENDER_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const BORROWER_KEY = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';
const EXECUTOR_KEY = '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6';

// Six decimals, matching the USDC the mock stands in for.
const PRINCIPAL = 100n * 10n ** 6n;
const REPAYMENT = 110n * 10n ** 6n;
const DURATION = 30n * 24n * 60n * 60n;
const TOKEN_ID = 1n;

const lender = localWallet(LENDER_KEY);
const borrower = localWallet(BORROWER_KEY);
const executor = localWallet(EXECUTOR_KEY);

const lenderAddress = lender.account.address;
const borrowerAddress = borrower.account.address;

const main = async () => {
  if (chain.id !== anvil.id) {
    throw new Error(`This walks a loan through real transactions. Point it at anvil, not ${chain.name}.`);
  }

  const admin = await getAdminWallet();

  const seaport = await getSeaportContract();
  const {contract: pinkwhale} = await deployPinkwhale();
  const currency = await deployCurrency('USDC', admin.account.address);
  const collection = await deployCollection('CryptoPunks');

  step('Fund and approve');
  await send(currency.write.mint([lenderAddress, PRINCIPAL], as(admin)));
  // Enough to cover the interest on top of the principal they are about to receive.
  await send(currency.write.mint([borrowerAddress, REPAYMENT - PRINCIPAL], as(admin)));
  await send(collection.write.mint([borrowerAddress, TOKEN_ID], as(admin)));

  await send(currency.write.approve([seaport.address, REPAYMENT * 10n], as(lender)));
  await send(currency.write.approve([seaport.address, REPAYMENT * 10n], as(borrower)));
  await send(collection.write.setApprovalForAll([seaport.address, true], as(borrower)));

  step('Build the two creation orders');
  const now = BigInt((await publicClient.getBlock()).timestamp);

  const collateralOffer: OfferItem[] = [
    {
      itemType: ItemType.ERC721,
      token: collection.address,
      identifierOrCriteria: TOKEN_ID,
      startAmount: 1n,
      endAmount: 1n
    }
  ];
  const collateralConsideration: ConsiderationItem[] = [
    {...collateralOffer[0]!, recipient: pinkwhale.address}
  ];
  const principalOffer: OfferItem[] = [
    {
      itemType: ItemType.ERC20,
      token: currency.address,
      identifierOrCriteria: 0n,
      startAmount: PRINCIPAL,
      endAmount: PRINCIPAL
    }
  ];
  const principalConsideration: ConsiderationItem[] = [
    {...principalOffer[0]!, recipient: borrowerAddress}
  ];

  const lenderTerms = {
    consideration: [
      {
        itemType: ItemType.ERC20,
        token: currency.address,
        identifierOrCriteria: 0n,
        startAmount: REPAYMENT,
        endAmount: REPAYMENT,
        recipient: lenderAddress
      }
    ] satisfies ConsiderationItem[],
    duration: DURATION
  };
  const borrowerTerms = {
    offer: [
      {
        itemType: ItemType.ERC20,
        token: currency.address,
        identifierOrCriteria: 0n,
        startAmount: REPAYMENT,
        endAmount: REPAYMENT
      }
    ] satisfies OfferItem[],
    duration: DURATION
  };

  const common = {
    zone: pinkwhale.address,
    orderType: OrderType.FULL_RESTRICTED,
    startTime: now,
    endTime: now + 600n,
    conduitKey: zeroHash
  };

  const lenderOrder: OrderParameters = {
    ...common,
    offerer: lenderAddress,
    offer: principalOffer,
    consideration: collateralConsideration,
    // The terms hash *is* the zoneHash. That is what lets Pinkwhale accept terms
    // passed as plain calldata: they only count if they reproduce it.
    zoneHash: getLenderTermsHash(lenderTerms),
    salt: 1n,
    totalOriginalConsiderationItems: BigInt(collateralConsideration.length)
  };

  const borrowerOrder: OrderParameters = {
    ...common,
    offerer: borrowerAddress,
    offer: collateralOffer,
    consideration: principalConsideration,
    zoneHash: getBorrowerTermsHash(borrowerTerms),
    salt: 2n,
    totalOriginalConsiderationItems: BigInt(principalConsideration.length)
  };

  const lenderSignature = await signOrder(
    lender,
    seaport.address,
    anvil.id,
    lenderOrder,
    await seaport.read.getCounter([lenderAddress])
  );
  const borrowerSignature = await signOrder(
    borrower,
    seaport.address,
    anvil.id,
    borrowerOrder,
    await seaport.read.getCounter([borrowerAddress])
  );

  step('executeLoan (submitted by a third party)');
  const executeHash = await pinkwhale.write.executeLoan(
    [
      // Creation orders carry empty extraData on purpose.
      toAdvancedOrder(lenderOrder, lenderSignature),
      toAdvancedOrder(borrowerOrder, borrowerSignature),
      lenderTerms,
      borrowerTerms,
      [],
      buildFulfillments(lenderOrder.offer.length, borrowerOrder.offer.length)
    ] as never,
    {account: executor.account, chain}
  );
  const executeReceipt = await publicClient.waitForTransactionReceipt({hash: executeHash});

  const [loanExecuted] = parseEventLogs({
    abi: pinkwhale.abi,
    eventName: 'LoanExecuted',
    logs: executeReceipt.logs
  });

  if (!loanExecuted) throw new Error('no LoanExecuted event');

  const {loanId, expiry, defaultOrderHash} = loanExecuted.args as {
    loanId: Hex;
    expiry: bigint;
    defaultOrderHash: Hex;
  };

  const validated = parseEventLogs({
    abi: seaport.abi,
    eventName: 'OrderValidated',
    logs: executeReceipt.logs
  });
  const repaymentOrder = validated[0]!.args.orderParameters as unknown as OrderParameters;

  console.log(`     loanId            ${loanId}`);
  console.log(`     defaultOrderHash  ${defaultOrderHash}`);
  console.log(`     expiry            ${new Date(Number(expiry) * 1000).toISOString()}`);
  console.log(`     collateral owner  ${await collection.read.ownerOf([TOKEN_ID])}  (Pinkwhale)`);
  console.log(`     borrower balance  ${fmt(await currency.read.balanceOf([borrowerAddress]))} USDC`);

  step('Repay');
  const repayHash = await seaport.write.fulfillAdvancedOrder(
    [
      toAdvancedOrder(repaymentOrder, '0x', encodeResolutionExtraData(zeroHash)),
      [],
      zeroHash,
      borrowerAddress
    ] as never,
    {account: borrower.account, chain}
  );
  await publicClient.waitForTransactionReceipt({hash: repayHash});

  console.log(`     collateral owner  ${await collection.read.ownerOf([TOKEN_ID])}  (borrower)`);
  console.log(`     lender balance    ${fmt(await currency.read.balanceOf([lenderAddress]))} USDC`);
  console.log(`     borrower balance  ${fmt(await currency.read.balanceOf([borrowerAddress]))} USDC`);

  console.log('\nLoan opened, collateral custodied, loan repaid, collateral returned.\n');
}

// -- small helpers ----------------------------------------------------------

/** Who is sending this write. deployoor's contract objects are client-agnostic. */
const as = (signer: WalletWithAccount) => ({account: signer.account, chain}) as const;

const step = (label: string) => console.log(`\n>> ${label}`);

const send = async (pending: Promise<Hex>) =>
  publicClient.waitForTransactionReceipt({hash: await pending});

const fmt = (amount: bigint) => (Number(amount) / 1e6).toFixed(2);

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
