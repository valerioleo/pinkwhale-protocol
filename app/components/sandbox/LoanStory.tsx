'use client';

import {useEffect, useRef, useState, useSyncExternalStore} from 'react';

import {
  DURATION_DAYS,
  STEPS,
  owedOnDay,
  type ActorRow,
  type OrderColumn,
  type Step
} from './story';

/**
 * The loan lifecycle, read by scrolling.
 *
 * Prose steps run down the left; one sticky panel on the right holds the state of
 * the world at whichever step you have reached. Each panel is a whole picture
 * rather than a diff, so the thing you notice between two of them is exactly what
 * the step you just read described.
 *
 * Progressive enhancement, as in cudo's project tour: prerendered and with JS off
 * every step is at full contrast and the panel shows the last state, because the
 * steps are the content and the panel is the illustration.
 */

/**
 * A step takes over once its top crosses this fraction of the viewport. Well above
 * the panel's own offset on purpose — a step should activate as its heading comes
 * comfortably into view, not once it has climbed to the very top.
 */
const ACTIVATION_LINE = 0.45;

/** The step whose panel advances while you read it. */
const CLOCK_STEP = 2;

const pad = (index: number) => String(index + 1).padStart(2, '0');

/**
 * Whether we are past hydration, asked without an effect.
 *
 * A `setMounted(true)` in an effect says the same thing, but it says it by
 * scheduling a second render, and the lint rule is right to object. This is the
 * shape React provides for a value that differs between server and client:
 * subscribe to nothing, because the answer never changes once it is true.
 */
const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

const Actors = ({rows}: {rows: readonly ActorRow[]}) => (
  <div className="ls-block">
    <p className="ls-block-label">Actors</p>
    <ul className="ls-actors">
      {rows.map((actor) => (
        <li key={actor.name} className="ls-actor" data-tint={actor.tint}>
          <span className="ls-actor-face" aria-hidden="true" />
          <span className="ls-actor-who">
            <span className="ls-actor-name">{actor.name}</span>
            <span className="ls-actor-role">{actor.role}</span>
          </span>
          <span className="ls-actor-holds">
            <span className="ls-actor-usdc">{actor.usdc}</span>
            <span className="ls-actor-nft">{actor.nft}</span>
          </span>
        </li>
      ))}
    </ul>
  </div>
);

/**
 * The two orders side by side, aligned row for row.
 *
 * Reading across a row is the whole argument — what one order offers is what the
 * other asks for — so the labels sit in their own column and the two orders share
 * them rather than each repeating the set.
 */
const Orders = ({columns}: {columns: readonly [OrderColumn, OrderColumn]}) => {
  // Driven off the first column: both are built from the same row list, and a
  // label that appeared in only one of them would break the alignment that makes
  // the figure readable.
  const labels = columns[0].rows.map((row) => row.label);

  return (
    <div className="ls-block">
      <p className="ls-block-label">Orders</p>
      <div className="ls-orders">
        <div className="ls-orders-head">
          <span />
          {columns.map((column) => (
            <span key={column.title} className="ls-order-title" data-state={column.state ?? 'live'}>
              {column.title}
              {column.state && column.state !== 'live' ? (
                <span className="ls-order-state">{column.state}</span>
              ) : null}
            </span>
          ))}
        </div>

        <div className="ls-order-row">
          <span className="ls-order-label">created by</span>
          {columns.map((column) => (
            <span key={column.title} className="ls-order-cell">
              <span className="ls-order-line">{column.createdBy}</span>
            </span>
          ))}
        </div>

        {labels.map((label, index) => (
          <div key={label} className="ls-order-row">
            <span className="ls-order-label">{label}</span>
            {columns.map((column) => {
              const cell = column.rows[index];

              return (
                <span key={column.title} className="ls-order-cell">
                  <span className="ls-order-line">{cell?.line ?? '—'}</span>
                  {cell?.sub ? <span className="ls-order-sub">{cell.sub}</span> : null}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * The panel for one step. `day` is passed in rather than read from the step so the
 * clock step can redraw without the rest of the panel knowing there is a clock.
 */
const Panel = ({step, day}: {step: Step; day: number | null}) => {
  const {panel} = step;

  const bars =
    day === null
      ? panel.bars
      : [
          {label: `Day ${day} of ${DURATION_DAYS}`, value: '', sub: 'advances as you scroll'},
          {label: 'Alice owes today', value: `${owedOnDay(day).toFixed(2)} USDC`}
        ];

  return (
    <div className="ls-panel" data-tone={panel.tone}>
      <div className="ls-panel-head">
        <span className="ls-panel-title">
          {day === null ? panel.header : `loan #1 · day ${day}`}
        </span>
        <span className="ls-status" data-tone={panel.tone}>
          {panel.status}
        </span>
      </div>

      {bars ? (
        <div className="ls-bars">
          {bars.map((bar) => (
            <div key={bar.label} className="ls-bar">
              <span className="ls-bar-label">{bar.label}</span>
              {bar.value ? <span className="ls-bar-value">{bar.value}</span> : null}
              {bar.sub ? <span className="ls-bar-sub">{bar.sub}</span> : null}
            </div>
          ))}
        </div>
      ) : null}

      {panel.action ? (
        <button type="button" className="ls-action" disabled>
          {panel.action}
        </button>
      ) : null}

      <Actors rows={panel.actors} />
      <Orders columns={panel.orders} />
    </div>
  );
};

export const LoanStory = () => {
  const [active, setActive] = useState(0);
  const [day, setDay] = useState<number | null>(null);
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const mounted = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  useEffect(() => {
    // Derived from geometry rather than from IntersectionObserver, for the reason
    // cudo's tour gives: an observer only reports crossings it happens to see, so a
    // fling that carries a step past a thin trigger band between two frames leaves
    // the panel showing something that is no longer true, and scrolling back does
    // not necessarily resync it. This recomputes the same answer from scratch on
    // every scroll event, in either direction.
    const compute = () => {
      const line = window.innerHeight * ACTIVATION_LINE;

      const reached = stepsRef.current.reduce(
        (found, node, index) =>
          node !== null && node.getBoundingClientRect().top <= line ? index : found,
        0
      );

      setActive(reached);

      // How far through the clock step we are, as a fraction of its own height.
      // Only meaningful while that step is the active one; elsewhere the panel
      // shows the step's written figures.
      const clock = stepsRef.current[CLOCK_STEP];

      if (reached !== CLOCK_STEP || clock === null || clock === undefined) {
        setDay(null);

        return;
      }

      const box = clock.getBoundingClientRect();
      const travelled = (line - box.top) / Math.max(box.height, 1);
      const fraction = Math.min(Math.max(travelled, 0), 1);

      setDay(Math.max(1, Math.round(fraction * DURATION_DAYS)));
    };

    // At most one recompute per frame. The flag lives on an object created here,
    // so nothing outside this effect can observe or reassign it.
    const frame = {pending: false};
    const onScroll = () => {
      if (frame.pending) return;

      frame.pending = true;
      requestAnimationFrame(() => {
        frame.pending = false;
        compute();
      });
    };

    compute();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const step = STEPS[active] ?? STEPS[0]!;

  return (
    <section className="ls" data-mounted={mounted ? 'true' : 'false'}>
      <header className="ls-head">
        <span className="ls-kicker">
          <span className="ls-kicker-num">02</span>
          <span className="ls-kicker-label">The loan story</span>
        </span>
        <h1 className="ls-title">One loan, five states</h1>
        <p className="ls-sub">
          Every state below is four Seaport orders and nothing else. Scroll to move through them.
        </p>
      </header>

      <div className="ls-grid">
        <ol className="ls-steps">
          {STEPS.map((entry, index) => (
            <li
              key={entry.title}
              className="ls-step"
              data-active={index === active ? 'true' : 'false'}
              ref={(node) => {
                stepsRef.current[index] = node;
              }}
            >
              <span className="ls-step-num">{pad(index)}</span>
              <h2 className="ls-step-title">
                {entry.title}
                <span className="ls-step-day">{entry.day}</span>
              </h2>
              <p className="ls-step-body">{entry.body}</p>
              {entry.meta ? (
                <p className="ls-step-meta">
                  <span className="ls-step-meta-label">{entry.meta.label}</span>
                  <span className="ls-step-meta-value">{entry.meta.value}</span>
                </p>
              ) : null}

              {/* The one-column layout has no room for a panel that follows along,
                  so each step carries its own. */}
              <div className="ls-step-panel">
                <Panel step={entry} day={null} />
              </div>
            </li>
          ))}
        </ol>

        <aside className="ls-sticky">
          <Panel step={step} day={day} />
        </aside>
      </div>

      <p className="ls-caption">
        Fig. 1 — the same two orders throughout. Only the clock and who has filled what changes.
      </p>
    </section>
  );
};
