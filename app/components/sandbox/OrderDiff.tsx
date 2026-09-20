import Image from 'next/image';

import {AGREEMENT} from './model';

const TOKEN = {
  BAYC: '/tokens/bayc.png',
  USDC: '/tokens/usdc.png'
} as const;

/**
 * A standard Seaport order, shown as the diff that makes it a loan.
 *
 * The point of the picture is how little is added. Everything above the diff is
 * an ordinary swap; the six green rows are the whole of Pinkwhale's involvement,
 * and two orders carrying the same zoneHash is what lets them match at all.
 */
export const OrderDiff = () => (
  <div className="lc-orders">
    {AGREEMENT.map((order) => (
      <article className="lc-order" key={order.signer}>
        <header className="lc-order-head">
          <span className="lc-order-kind">
            <span className="lc-order-glyph" aria-hidden="true" />
            Seaport order
          </span>
          <span className="lc-order-signer">{order.signer}</span>
          <h3 className="lc-order-title">{order.title}</h3>
          <span className="lc-order-pair">
            {order.pair.map((token, index) => (
              <span key={token} className="lc-order-token">
                {index > 0 ? <span className="lc-order-swap">↔</span> : null}
                <Image src={TOKEN[token]} alt="" width={16} height={16} data-token={token} />
                {token}
              </span>
            ))}
          </span>
        </header>

        <p className="lc-order-fields">
          <code>&lt;/&gt;</code> order.fields
        </p>

        <pre className="lc-diff">
          {order.added.map((line) => (
            <span className="lc-diff-row" key={line}>
              <span className="lc-diff-sign" aria-hidden="true">
                +
              </span>
              {line}
            </span>
          ))}
        </pre>
      </article>
    ))}
  </div>
);
