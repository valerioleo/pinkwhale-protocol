/**
 * A thin pass-through to the CDP node.
 *
 * The browser reads chain state constantly and the CDP URL carries a token, so the
 * token stays here and the client talks to same-origin `/api/rpc`. The public Base
 * Sepolia endpoint would avoid the proxy, but it is load-balanced and answers reads
 * from nodes that have not seen the write yet — which shows up as "I minted and
 * nothing appeared", the worst possible first impression.
 */
const upstream = process.env.BASE_SEPOLIA_RPC_URL;

export const POST = async (request: Request) => {
  if (!upstream) {
    return Response.json({error: 'BASE_SEPOLIA_RPC_URL is not set'}, {status: 500});
  }

  const response = await fetch(upstream, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: await request.text()
  });

  return new Response(response.body, {
    status: response.status,
    headers: {'content-type': 'application/json'}
  });
};
