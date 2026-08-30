import {isAddress, type Address} from 'viem';

import {fundPersona, type Persona} from '../../../lib/server/faucet';

/**
 * `persona` selects what to mint; it is not a permission. Anyone may ask for
 * either, and the whole endpoint is idempotent against on-chain balances.
 *
 * It exists so the lender is not handed punks it will never post. The collection
 * is ten thousand ids and every one minted to an address that only ever lends is
 * one a borrower cannot have.
 */

export const POST = async (request: Request) => {
  const {address, persona, force} = (await request.json()) as {
    address?: string;
    persona?: Persona;
    force?: boolean;
  };

  if (!address || !isAddress(address)) {
    return Response.json({error: 'address must be a 20-byte hex address'}, {status: 400});
  }

  if (persona !== 'lender' && persona !== 'borrower') {
    return Response.json({error: 'persona must be "lender" or "borrower"'}, {status: 400});
  }

  try {
    return Response.json(await fundPersona(address as Address, persona, force === true));
  } catch (error) {
    console.error('faucet failed', error);
    return Response.json({error: (error as Error).message}, {status: 500});
  }
};
