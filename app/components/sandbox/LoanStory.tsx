'use client';

import {useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';

import {ASSETS, HOLDERS, STEPS, type AssetId, type OrderCard, type Step} from './story';

/**
 * The loan, told by moving three assets between three columns.
 *
 * The strip is the constant: Alice, Pinkwhale, Bob, always in that order, always
 * on screen. Each step below it describes one movement between two of those
 * columns, and as the step arrives the asset actually travels — the chip is the
 * same DOM node throughout, so it slides from where it was to where it now
 * belongs rather than disappearing here and reappearing there.
 *
 * That is the whole argument the page is making. A loan is not a new kind of
 * object; it is an ape and some USDC changing hands under rules two signatures
 * already agreed.
 */

/** A step takes over once its top crosses this fraction of the viewport. */
const ACTIVATION_LINE = 0.55;

const pad = (index: number) => String(index + 1).padStart(2, '0');

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * FLIP, for the one thing on the page that has to feel physical.
 *
 * React moves a keyed chip into its new column and the browser paints it there
 * immediately; this reads both positions, puts the chip back where it was with a
 * transform, and then releases it in the next frame. The alternative — fading one
 * copy out and another in — says two assets existed. There is only ever one ape.
 */
const useAssetFlip = (active: number) => {
  const chips = useRef(new Map<AssetId, HTMLElement>());
  const previous = useRef(new Map<AssetId, {x: number; y: number}>());
  const strip = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const frame = strip.current?.getBoundingClientRect();

    if (!frame) return;

    // Measured against the strip, not the viewport. The strip is sticky, so while
    // it is still scrolling into place its viewport coordinates move under us —
    // and a step that changed during those few hundred pixels would animate the
    // page's scroll rather than the asset's journey.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // An asset that changes column changes parent, so React unmounts the old chip
    // and mounts a new one rather than moving the node. Pruning by `isConnected`
    // rather than by a ref cleanup means this does not depend on whether React
    // happens to call the detaching ref before or after the attaching one.
    chips.current.forEach((node, id) => {
      if (!node.isConnected) chips.current.delete(id);
    });

    chips.current.forEach((node, id) => {
      const box = node.getBoundingClientRect();
      const now = {x: box.left - frame.left, y: box.top - frame.top};
      const before = previous.current.get(id);

      previous.current.set(id, now);

      if (!before || reduced) return;

      const dx = before.x - now.x;
      const dy = before.y - now.y;

      // Sub-pixel drift is not movement; animating it only costs a repaint.
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      node.animate(
        [{transform: `translate(${dx}px, ${dy}px)`}, {transform: 'translate(0, 0)'}],
        {duration: 620, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'}
      );
    });

    // An asset that has left the strip should not animate in from a stale
    // position if it comes back: step 04 rewinds the world, and by then the ape
    // has been in three different columns.
    previous.current.forEach((_position, id) => {
      if (!chips.current.has(id)) previous.current.delete(id);
    });
  }, [active]);

  const register = (id: AssetId) => (node: HTMLElement | null) => {
    if (node) chips.current.set(id, node);
  };

  return {register, strip};
};

const Card = ({card}: {card: OrderCard}) => (
  <div className="ls-card" data-tone={card.tone}>
    <div className="ls-card-head">
      <span className="ls-card-title">{card.title}</span>
      <span className="ls-chip" data-tone={card.tone}>
        {card.status}
      </span>
    </div>
    <p className="ls-card-by">{card.by}</p>
    <dl className="ls-card-rows">
      {card.rows.map((row) => (
        <div key={row.label} className="ls-card-row">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Scene = ({scene}: {scene: Step['scene']}) => (
  <div className="ls-scene">
    {scene.tx ? (
      <div className="ls-tx">
        <p className="ls-tx-head">{scene.tx.header}</p>
        <ol className="ls-tx-beats">
          {scene.tx.beats.map((beat) => (
            <li key={beat}>{beat}</li>
          ))}
        </ol>
      </div>
    ) : null}

    <div className="ls-cards">
      {scene.cards.map((card, index) => (
        <div className="ls-cards-slot" key={card.title}>
          {index > 0 && scene.link ? <span className="ls-link">{scene.link}</span> : null}
          <Card card={card} />
        </div>
      ))}
    </div>

    {scene.note ? <p className="ls-note">{scene.note}</p> : null}
  </div>
);

export const LoanStory = () => {
  const [active, setActive] = useState(0);
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const mounted = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);
  const {register, strip} = useAssetFlip(active);

  useEffect(() => {
    // Geometry rather than IntersectionObserver, as in cudo's tour: an observer
    // only reports crossings it happens to see, so a fling that carries a step
    // past a thin trigger band between two frames leaves the strip holding assets
    // where they no longer are. This recomputes from scratch on every event.
    const compute = () => {
      const line = window.innerHeight * ACTIVATION_LINE;

      setActive(
        stepsRef.current.reduce(
          (found, node, index) =>
            node !== null && node.getBoundingClientRect().top <= line ? index : found,
          0
        )
      );
    };

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
        <h1 className="ls-title">One loan, four states</h1>
        <p className="ls-sub">
          Three assets, three columns. Everything below is one of them changing hands.
        </p>
      </header>

      {/* One strip for the whole page, not one per step: it is the thing that
          persists while the steps scroll past it. */}
      <div className="ls-balances">
        <div className="ls-strip" ref={strip}>
          {HOLDERS.map((holder) => (
            <div className="ls-col" key={holder.id} data-who={holder.id}>
              <span className="ls-col-face" aria-hidden="true" />
              <span className="ls-col-who">
                <span className="ls-col-name">{holder.name}</span>
                <span className="ls-col-role">{holder.role}</span>
              </span>
              <span className="ls-col-holds">
                {step.holdings[holder.id].length === 0 ? (
                  <span className="ls-empty">holds nothing</span>
                ) : (
                  step.holdings[holder.id].map((id) => (
                    <span
                      key={id}
                      ref={register(id)}
                      className="ls-asset"
                      data-kind={ASSETS[id].kind}
                    >
                      {ASSETS[id].label}
                    </span>
                  ))
                )}
              </span>
            </div>
          ))}
        </div>

        {step.moves.length > 0 ? (
          <div className="ls-moves">
            <span className="ls-moves-key">On scroll</span>
            {step.moves.map((move) => (
              <span key={move} className="ls-move">
                {move}
              </span>
            ))}
          </div>
        ) : null}
      </div>

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
            <div className="ls-inner">
              <div className="ls-text">
                <span className="ls-step-num">{pad(index)}</span>
                <h2 className="ls-step-title">{entry.title}</h2>
                <p className="ls-step-body">{entry.body}</p>
              </div>
              <Scene scene={entry.scene} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
