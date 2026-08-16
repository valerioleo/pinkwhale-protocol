'use client';

import './pinkwhale.css';

import {useMemo, useState} from 'react';

import {TokenIcon} from './icons.js';
import {ORDERS, ORDER_KINDS, type Item, type OrderKind} from './loan.js';
import {RichText} from './RichText.js';

type Selection = {note: string; title: string} | null;

/**
 * The four orders a loan is made of, laid out field by field. Switching tabs
 * marks what changed, because what moves between them is the lesson.
 */
export const OrderAnatomy = () => {
  const [kind, setKind] = useState<OrderKind>('lender-creation');
  const [previous, setPrevious] = useState<OrderKind>('lender-creation');
  const [selected, setSelected] = useState<Selection>(null);

  const order = ORDERS[kind];
  const previousOrder = ORDERS[previous];

  const changed = useMemo(() => {
    const before = new Map(previousOrder.fields.map((f) => [f.name, f.value]));
    return new Set(order.fields.filter((f) => before.get(f.name) !== f.value).map((f) => f.name));
  }, [order, previousOrder]);

  const select = (next: OrderKind) => {
    setPrevious(kind);
    setKind(next);
    setSelected(null);
  };

  const pick = (title: string, note: string) =>
    setSelected(selected?.title === title ? null : {title, note});

  return (
    <div className="pw-widget">
      <div className="pw-tabs">
        {ORDER_KINDS.map((k) => (
          <button
            key={k}
            className={k === kind ? 'pw-tab pw-tab--active' : 'pw-tab'}
            onClick={() => select(k)}
          >
            {ORDERS[k].label}
            <span
              className={
                ORDERS[k].createdBy === 'User-created'
                  ? 'pw-pill pw-pill--user'
                  : 'pw-pill pw-pill--protocol'
              }
            >
              {ORDERS[k].createdBy}
            </span>
          </button>
        ))}
      </div>

      <div className="pw-widget__body pw-anatomy">
        <div className="pw-anatomy__main">
          <ItemList
            title="offer"
            subtitle={order.offerSubtitle}
            items={order.offer}
            selected={selected}
            onPick={pick}
          />

          <ItemList
            title="consideration"
            subtitle={order.considerationSubtitle}
            items={order.consideration}
            selected={selected}
            onPick={pick}
            emptyLabel="nothing. it is free."
            emptyNote="An empty consideration array is the whole liquidation mechanism. The lender pays zero for the collateral, however far above or below the debt it is worth. See 'Possible improvements'."
          />

          <ul className="pw-fields">
            {order.fields.map((field) => (
              <li key={field.name}>
                <button
                  className={[
                    'pw-field',
                    changed.has(field.name) && kind !== previous ? 'pw-field--changed' : '',
                    selected?.title === field.name ? 'pw-field--selected' : ''
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pick(field.name, field.note)}
                >
                  <span className="pw-field__name">{field.name}</span>
                  <span className="pw-field__value pw-hex">
                    {field.icon ? <TokenIcon kind={field.icon} /> : null}
                    {field.value}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="pw-detail">
          {selected ? (
            <div className="pw-detail__note">
              <h4>{selected.title}</h4>
              {selected.note.split('\n\n').map((paragraph, i) => (
                <p key={i}>
                  <RichText>{paragraph}</RichText>
                </p>
              ))}
            </div>
          ) : (
            <p className="pw-detail__empty">Pick any row to see what it does.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

type ItemListProps = {
  title: string;
  subtitle: string;
  items: Item[];
  selected: Selection;
  onPick: (title: string, note: string) => void;
  emptyLabel?: string;
  emptyNote?: string;
};

const ItemList = ({title, subtitle, items, selected, onPick, emptyLabel, emptyNote}: ItemListProps) => (
  <section className="pw-items">
    <h5 className="pw-items__title">
      <span className="pw-items__name">{title}</span>
      <span className="pw-items__subtitle">{subtitle}</span>
    </h5>

    {items.length === 0 ? (
      <button
        className={selected?.title === title ? 'pw-item pw-item--empty pw-item--selected' : 'pw-item pw-item--empty'}
        onClick={() => onPick(title, emptyNote ?? '')}
      >
        <span className="pw-item__box">[ ]</span>
        <span className="pw-item__amount">{emptyLabel}</span>
      </button>
    ) : (
      <ul className="pw-fields">
        {items.map((item) => (
          <li key={item.index}>
            <button
              className={selected?.title === item.index ? 'pw-item pw-item--selected' : 'pw-item'}
              onClick={() => onPick(item.index, item.note)}
            >
              {item.icon ? <TokenIcon kind={item.icon} /> : null}
              <span className="pw-item__amount">{item.amount}</span>
              <span className="pw-item__type pw-hex">{item.itemType}</span>
              {item.recipient ? (
                <span className="pw-item__recipient">
                  to {item.recipient.icon ? <TokenIcon kind={item.recipient.icon} /> : null}
                  {item.recipient.label}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    )}
  </section>
);
