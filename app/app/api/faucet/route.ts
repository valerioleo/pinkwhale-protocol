import {isAddress, type Address} from 'viem';

import {fundPersona, type Persona} from '../../../lib/server/faucet';

export const POST = async (request: Request) => {
  const {address, persona} = (await request.json()) as {address?: string; persona?: Persona};

  if (!address || !isAddress(address)) {
    return Response.json({error: 'address must be a 20-byte hex address'}, {status: 400});
  }

  if (persona !== 'lender' && persona !== 'borrower') {
    return Response.json({error: 'persona must be "lender" or "borrower"'}, {status: 400});
  }

  try {
    return Response.json(await fundPersona(address as Address, persona));
  } catch (error) {
    console.error('faucet failed', error);
    return Response.json({error: (error as Error).message}, {status: 500});
  }
};
