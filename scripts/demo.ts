/**
 * A whole loan, start to finish, against a running anvil.
 *
 *   anvil --code-size-limit 40000        # in another terminal
 *   pnpm demo
 *
 * This is the same path the docs' interactive widgets drive: deployoor hands back
 * typed viem contract objects, `scripts/lib/orders.ts` builds and signs the Seaport
 * orders, and nothing here duplicates an ABI or an address.
 */
import 'dotenv/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  parseEventLogs,
  zeroHash,
  type Address,
  type Hex
} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {anvil} from 'viem/chains';

import {
  getOrDeployConduitController16,
  getOrDeployERC20Token,
  getOrDeployERC721Token,
  getOrDeployPinkwhale,
  getOrDeploySeaport16
} from '../deployers/index.js';
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
} from './lib/orders.js';

// anvil's default mnemonic, accounts 1 to 3.
const LENDER_KEY = '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
const BORROWER_KEY = '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';
const EXECUTOR_KEY = '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6';

const PRINCIPAL = 100n * 10n ** 18n;
const REPAYMENT = 110n * 10n ** 18n;
const DURATION = 30n * 24n * 60n * 60n;
const TOKEN_ID = 1n;

const rpcUrl = process.env.ANVIL_RPC_URL ?? 'http://127.0.0.1:8545';
const transport = http(rpcUrl);
const publicClient = createPublicClient({chain: anvil, transport});

const wallet = (key: Hex) =>
  createWalletClient({account: privateKeyToAccount(key), chain: anvil, transport});

const deployer = wallet(process.env.DEPLOYER_PRIVATE_KEY as Hex);
const lender = wallet(LENDER_KEY);
const borrower = wallet(BORROWER_KEY);
const executor = wallet(EXECUTOR_KEY);

const lenderAddress = lender.account.address;
const borrowerAddress = borrower.account.address;

async function main() {
  const clients = {walletClient: deployer, publicClient};

  const {contract: conduitController} = await getOrDeployConduitController16({...clients, args: []});
  const {contract: seaport} = await getOrDeploySeaport16({
    ...clients,
    args: [conduitController.address]
  });
  const {contract: pinkwhale} = await getOrDeployPinkwhale({...clients, args: [seaport.address]});
  const {contract: currency} = await getOrDeployERC20Token({
    ...clients,
    args: ['Pinkwhale Mock USD', 'mUSD', 0n, deployer.account.address]
  });
  const {contract: collection} = await getOrDeployERC721Token({
    ...clients,
    args: ['Pinkwhale Mock Apes', 'MAPE', 'ipfs://']
  });

  step('Fund and approve');
  await send(currency.write.mint([lenderAddress, PRINCIPAL], as(deployer)));
  // Enough to cover the interest on top of the principal they are about to receive.
  await send(currency.write.mint([borrowerAddress, REPAYMENT - PRINCIPAL], as(deployer)));
  await send(collection.write.mint([borrowerAddress, TOKEN_ID], as(deployer)));

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
    {account: executor.account, chain: anvil}
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
  console.log(`     collateral owner  ${await owner(collection, TOKEN_ID)}  (Pinkwhale)`);
  console.log(`     borrower balance  ${fmt(await balance(currency, borrowerAddress))} mUSD`);

  step('Repay');
  const repayHash = await seaport.write.fulfillAdvancedOrder(
    [
      toAdvancedOrder(repaymentOrder, '0x', encodeResolutionExtraData(zeroHash)),
      [],
      zeroHash,
      borrowerAddress
    ] as never,
    {account: borrower.account, chain: anvil}
  );
  await publicClient.waitForTransactionReceipt({hash: repayHash});

  console.log(`     collateral owner  ${await owner(collection, TOKEN_ID)}  (borrower)`);
  console.log(`     lender balance    ${fmt(await balance(currency, lenderAddress))} mUSD`);
  console.log(`     borrower balance  ${fmt(await balance(currency, borrowerAddress))} mUSD`);

  console.log('\nLoan opened, collateral custodied, loan repaid, collateral returned.\n');
}

// -- small helpers ----------------------------------------------------------

/** Who is sending this write. deployoor's contract objects are client-agnostic. */
function as(signer: ReturnType<typeof wallet>) {
  return {account: signer.account, chain: anvil} as const;
}

function step(label: string) {
  console.log(`\n>> ${label}`);
}

async function send(pending: Promise<Hex>) {
  return publicClient.waitForTransactionReceipt({hash: await pending});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function owner(collection: any, tokenId: bigint): Promise<Address> {
  return collection.read.ownerOf([tokenId]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function balance(currency: any, account: Address): Promise<bigint> {
  return currency.read.balanceOf([account]);
}

function fmt(amount: bigint) {
  return (Number(amount) / 1e18).toFixed(2);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
