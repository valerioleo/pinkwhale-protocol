import {Punk} from '../components/Punk';
import {CHAIN_ID} from '../lib/chain';
import {cryptoPunksAddress, pinkwhaleAddress, seaport16Address, usdcAddress} from '../lib/generated';
import {readDeployment} from '../lib/reads';

/**
 * A wiring check, not the playground.
 *
 * It proves the three things everything else rests on: the records in
 * `deployments/` resolve to contracts that actually answer, the CDP node is
 * reachable through our own route, and a token id turns into the right art with no
 * asset pipeline behind it.
 */
/** Read at request time: these values are chain state, not build output. */
export const dynamic = 'force-dynamic';

export default async function Home() {
  const live = await readDeployment();

  return (
    <main>
      <h1>Pinkwhale playground</h1>
      <p className="sub">Base Sepolia · chain {CHAIN_ID} · wiring check</p>

      <div className="card">
        <h2>Deployed contracts</h2>
        <div className="row">
          <span className="k">Pinkwhale</span>
          <span className="v">{pinkwhaleAddress[CHAIN_ID]}</span>
        </div>
        <div className="row">
          <span className="k">points at Seaport</span>
          <span className="v">
            {live.seaport}{' '}
            {live.seaport.toLowerCase() === seaport16Address[CHAIN_ID].toLowerCase() ? (
              <span className="ok">✓ canonical</span>
            ) : (
              <span className="bad">✗ unexpected</span>
            )}
          </span>
        </div>
        <div className="row">
          <span className="k">USDC</span>
          <span className="v">
            {usdcAddress[CHAIN_ID]} · {live.usdcSymbol} · {String(live.usdcDecimals)}dp
          </span>
        </div>
        <div className="row">
          <span className="k">CryptoPunks</span>
          <span className="v">
            {cryptoPunksAddress[CHAIN_ID]} · {live.punkName} · {String(live.collectionSize)}
          </span>
        </div>
      </div>

      <div className="card">
        <h2>Art, straight out of the grid</h2>
        <div className="punks">
          {[0, 1, 42, 3572, 6734, 9999].map((id) => (
            <span key={id} className="punk-tile">
              <Punk id={id} scale={3} />
              <div>#{id}</div>
            </span>
          ))}
        </div>
        <p className="sub" style={{margin: '14px 0 0'}}>
          One 848KB sheet, cropped by CSS. No per-token asset and no gateway.
        </p>
      </div>
    </main>
  );
}
