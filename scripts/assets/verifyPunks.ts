/**
 * Check the committed composite against the hash the CryptoPunks contract holds.
 *
 *   pnpm verify:punks
 *
 * Reads `imageHash` from mainnet rather than trusting the constant, so this fails
 * if either the file or our idea of the hash ever drifts.
 */
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createPublicClient, http} from 'viem';
import {mainnet} from 'viem/chains';

import {PUNKS_CONTRACT, PUNKS_IMAGE_SHA256} from './punks.js';

const FILE = 'docs/public/punks.png';

const main = async () => {
  const onFile = createHash('sha256').update(readFileSync(FILE)).digest('hex');

  const onChain = await createPublicClient({
    chain: mainnet,
    transport: http(process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com')
  }).readContract({
    address: PUNKS_CONTRACT,
    abi: [{name: 'imageHash', type: 'function', inputs: [], outputs: [{type: 'string'}], stateMutability: 'view'}],
    functionName: 'imageHash'
  });

  console.log(`  file      ${onFile}`);
  console.log(`  on chain  ${onChain}`);
  console.log(`  constant  ${PUNKS_IMAGE_SHA256}`);

  if (onFile !== onChain || onFile !== PUNKS_IMAGE_SHA256) {
    throw new Error('punks.png does not match the hash CryptoPunks commits to');
  }

  console.log('\n  the composite is the one the contract vouches for\n');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
