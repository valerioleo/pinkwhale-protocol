"use client";

import {useId, useState, type ReactNode, type KeyboardEvent} from 'react';
import {TokenIcon} from './icons';
import {ORDERS, ORDER_KINDS, type OrderKind} from './loan';
import {RichText} from './RichText';

const EMPTY_NOTE = '**The lender pays nothing.** An empty consideration array expresses the entire collateral claim. The order can only be filled by the lender, after expiry, if the loan has not been repaid.';
const TAB_LABELS = ['Lender', 'Borrower', 'Repayment', 'Default'];
const SUMMARIES: Record<OrderKind, string> = {
  'lender-creation': 'The lender offers money. The collateral goes to Pinkwhale.',
  'borrower-creation': 'The borrower offers the ape. The money goes straight to them.',
  repayment: 'Pinkwhale offers the ape back, in exchange for repayment to the lender.',
  default: 'The same ape. The same custodian. Nothing to pay.'
};

type Row = {name: string; label: string; value: ReactNode; note: string; primary?: boolean};

export function OrderAnatomy() {
  const id = useId();
  const [kind, setKind] = useState<OrderKind>('lender-creation');
  const [previous, setPrevious] = useState<OrderKind>('lender-creation');
  const [selected, setSelected] = useState('consideration');
  const order = ORDERS[kind];
  const rows: Row[] = [
    ...(['offer', 'consideration'] as const).map((name) => ({
      name, label: name, primary: true,
      value: order[name].length ? <>{order[name].map((item) => <span className="anatomy-item" key={item.index}>
        {item.icon && <TokenIcon kind={item.icon} />}<strong>{item.amount}</strong>
        {item.recipient && <small>to {item.recipient.label}</small>}
      </span>)}</> : <span className="anatomy-empty"><code>[ ]</code> Nothing. It is free.</span>,
      note: order[name].map((item) => item.note).join('\n\n') || EMPTY_NOTE
    })),
    ...order.fields.map((field) => ({name: field.name, label: field.name, value: <span className="anatomy-value">{field.icon && <TokenIcon kind={field.icon} />}{field.value}</span>, note: field.note}))
  ];
  const chosen = rows.find((row) => row.name === selected) ?? rows[0];
  const change = (next: OrderKind) => {setPrevious(kind); setKind(next); setSelected('consideration');};
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % ORDER_KINDS.length;
    else if (event.key === 'ArrowLeft') next = (index + ORDER_KINDS.length - 1) % ORDER_KINDS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = ORDER_KINDS.length - 1;
    else return;
    event.preventDefault();
    change(ORDER_KINDS[next]);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  const note = (row: Row) => <><span className="eyebrow">Why this field matters</span><h3>{row.label}</h3>{row.note.split('\n\n').map((paragraph, index) => <p key={index}><RichText>{paragraph}</RichText></p>)}</>;

  return <figure className="anatomy-lab breakout" aria-label="Anatomy of the four Seaport orders">
    <div className="lab-heading"><span className="eyebrow">Fig. 02 <span className="lab-heading__separator">/</span> A loan, in four orders</span><span className="lab-tag">Select an order, then a field</span></div>
    <div className="anatomy-tabs" role="tablist" aria-label="The four orders">
      {ORDER_KINDS.map((key, index) => <button id={`${id}-tab-${index}`} key={key} role="tab" aria-selected={kind === key} aria-controls={`${id}-panel`} tabIndex={kind === key ? 0 : -1}
        onClick={() => change(key)} onKeyDown={(event) => keyDown(event, index)}>
        <span><small>{String(index + 1).padStart(2, '0')}</small> {TAB_LABELS[index]}</span>
        <small>{index < 2 ? 'Signed by a person' : 'Written by Pinkwhale'}</small>
      </button>)}
    </div>
    <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${ORDER_KINDS.indexOf(kind)}`} tabIndex={0}>
      <p className="anatomy-summary">{SUMMARIES[kind]}</p>
      <div className="anatomy-layout">
        <div className="anatomy-rows">{rows.map((row, index) => {
          const was = ORDERS[previous].fields.find((field) => field.name === row.name);
          const changed = !row.primary && kind !== previous && was?.value !== order.fields.find((field) => field.name === row.name)?.value;
          return <div className="anatomy-row" key={row.name}>
            <button className="anatomy-field" data-selected={chosen.name === row.name} data-primary={row.primary} data-changed={changed}
              aria-pressed={chosen.name === row.name} aria-controls={`${id}-note-${index} ${id}-note`} onClick={() => setSelected(row.name)}>
              <span className="anatomy-field__label">{row.label}</span><span className="anatomy-field__value">{row.value}</span><span className="anatomy-field__arrow" aria-hidden="true">↗</span>
            </button>
            <div id={`${id}-note-${index}`} className="anatomy-note anatomy-note--inline" hidden={chosen.name !== row.name}>{note(row)}</div>
          </div>;
        })}</div>
        <aside id={`${id}-note`} className="anatomy-note anatomy-note--desktop" aria-live="polite">{note(chosen)}</aside>
      </div>
    </div>
    <figcaption className="lab-footer"><span>Ordinary Seaport fields. Different arrangements.</span><a href="/reference#the-four-orders">Full order reference ↗</a></figcaption>
  </figure>;
}
