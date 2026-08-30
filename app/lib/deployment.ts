/**
 * Addresses and ABIs, read straight out of the records `pnpm deploy:*` wrote.
 *
 * Nothing here is transcribed. A redeploy changes `deployments/`, and the app
 * follows without an edit, which is the whole reason the records are committed.
 */
import CryptoPunks from '../../deployments/84532-base-sepolia/CryptoPunks.json';
import Pinkwhale from '../../deployments/84532-base-sepolia/Pinkwhale.json';
import Seaport16 from '../../deployments/84532-base-sepolia/Seaport16.json';
import USDC from '../../deployments/84532-base-sepolia/USDC.json';

import type {Abi, Address} from 'viem';

const record = (json: {address: string; abi: unknown}) => ({
  address: json.address as Address,
  abi: json.abi as Abi
});

export const pinkwhale = record(Pinkwhale);
export const seaport = record(Seaport16);
export const usdc = record(USDC);
export const punks = record(CryptoPunks);

export const CHAIN_ID = 84532;

/** USDC is six decimals here, like the token it stands in for. */
export const USDC_DECIMALS = 6;
