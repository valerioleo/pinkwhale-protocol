import Image from 'next/image';
import type {Ref} from 'react';

import {Avatar, Clock, Percent, Symbols, Sys, Whale} from './marks';
import type {Asset, Mark, Order, OrderRow} from './model';

const TOKEN = {bayc: '/tokens/bayc.png', usdc: '/tokens/usdc.png'} as const satisfies Record<Asset, string>;

const PartyMark = ({mark}: {mark: Mark}) =>
  mark === 'pinkwhale' ? <Whale /> : <Avatar who={mark} />;

const Value = ({value}: {value: OrderRow['value']}) => {
  switch (value.kind) {
    case 'asset':
      return (
        <span className="lc-value">
          <Image src={TOKEN[value.asset]} alt="" width={20} height={20} data-asset={value.asset} />
          <span className="lc-value-text">{value.text}</span>
        </span>
      );
    case 'party':
      return (
        <span className="lc-value" data-kind="party">
          <PartyMark mark={value.mark} />
          <span className="lc-value-text">{value.text}</span>
        </span>
      );
    case 'none':
      return <span className="lc-value-none">none</span>;
    case 'time':
      return (
        <span className="lc-value" data-kind="time">
          <Clock />
          <span className="lc-value-mono">{value.text}</span>
        </span>
      );
    case 'terms':
      return (
        <span className="lc-value" data-kind="terms">
          <span className="lc-value-mono">hash(</span>
          <span className="lc-term">
            <Clock />
            <Symbols>{value.length}</Symbols>
          </span>
          <span className="lc-term">
            <Percent />
            <Symbols>{value.rate}</Symbols>
          </span>
          <span className="lc-value-mono">)</span>
        </span>
      );
  }
};

/**
 * A Seaport order, drawn the same way for all four: the two that were signed and
 * the two that execution leaves behind. Only the variant changes — live, pending,
 * or void — and the tone a live card wears.
 */
export const OrderCard = ({
  order,
  cardRef,
  className
}: {
  order: Order;
  cardRef?: Ref<HTMLElement>;
  className?: string;
}) => (
  <article
    ref={cardRef}
    className={className ? `lc-card ${className}` : 'lc-card'}
    data-variant={order.variant}
    data-tone={order.tone}
  >
    <header className="lc-card-head">
      <div className="lc-card-identity">
        <p className="lc-card-kind">
          <Image src="/tokens/seaport.png" alt="" width={20} height={20} />
          Seaport order
        </p>
        {/* Keyed by its text, so a change of status fades in rather than snapping. */}
        <p className="lc-card-status" key={order.status}>
          {order.status}
        </p>
      </div>
      <h3 className="lc-card-title">{order.title}</h3>
    </header>

    <dl className="lc-card-rows">
      {order.rows.map(row => (
        <div className="lc-card-row" key={row.label}>
          <dt>{row.label}</dt>
          <dd>
            <Value value={row.value} />
            {row.recipient ? (
              <span className="lc-recipient">
                <Sys>→</Sys>
                <PartyMark mark={row.recipient.mark} />
                <span>{row.recipient.text}</span>
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  </article>
);
