import {isAddress} from 'viem';

import {fundPersona, ownsActor, type Persona} from '../../../lib/server/faucet';

/**
 * A faucet claim and then the mints, each waiting on its block: a few seconds
 * warm, and close to ten from cold, which is the whole default allowance on a
 * plan without Fluid compute.
 */
export const maxDuration = 60;

/**
 * Only for a signed-in visitor, and only into one of their own two actors. The
 * browser already holds the CDP access token that says who is asking, and CDP
 * says which accounts are theirs.
 *
 * `persona` selects what to mint; it is not a permission. It exists so the lender
 * is not handed punks it will never post. The collection is ten thousand ids and
 * every one minted to an address that only ever lends is one a borrower cannot
 * have.
 */
export const POST = async (request: Request) => {
  const {address, persona} = (await request.json()) as {address?: string; persona?: Persona};
  const accessToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!address || !isAddress(address)) {
    return Response.json({error: 'address must be a 20-byte hex address'}, {status: 400});
  }

  if (persona !== 'lender' && persona !== 'borrower') {
    return Response.json({error: 'persona must be "lender" or "borrower"'}, {status: 400});
  }

  if (!accessToken) {
    return Response.json({error: 'Sign in to fund the actors.'}, {status: 401});
  }

  try {
    if (!(await ownsActor(accessToken, address))) {
      return Response.json({error: 'Only your own two actors can be funded.'}, {status: 403});
    }

    return Response.json(await fundPersona(address, persona));
  } catch (error) {
    console.error('faucet failed', error);
    return Response.json({error: (error as Error).message}, {status: 500});
  }
};
