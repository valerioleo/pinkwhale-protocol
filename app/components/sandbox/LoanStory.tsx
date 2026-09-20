'use client';

import {Blobatar} from '@blobatar/react';
import {useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore} from 'react';

import {Chip} from './Chip';
import {ArrowLeft, ArrowRight, Info, Zap} from './icons';
import {HOLDERS, STEPS, movedInto, type AssetId, type OrderCard, type Step} from './story';

/**
 * The loan, told by moving three assets between three columns.
 *
 * Each step carries its own strip, sticky at the top while that step is being
 * read, so the balances are always the ones the prose beside them is talking
 * about. As a step arrives its assets travel: the chip is measured before and
 * after and animated across the gap, and whatever changed hands wears a ring for
 * as long as the step is on screen.
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
 * A crossfade would say two assets existed; there is only ever one ape. Positions
 * are taken against the strip rather than the viewport because the strip is
 * sticky — while it is settling its viewport coordinates move under us, and a
 * step changing during those few hundred pixels would animate the page's scroll
 * instead of the asset's journey.
 */
const useAssetFlip = (active: number) => {
  const chips = useRef(new Map<AssetId, HTMLElement>());
  const previous = useRef(new Map<AssetId, {x: number; y: number}>());
  const strip = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const frame = strip.current?.getBoundingClientRect();

    if (!frame) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // An asset that changes column changes parent, so React mounts a new chip
    // rather than moving the node. Pruning on `isConnected` keeps this from
    // depending on whether the detaching ref fires before the attaching one.
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

      node.animate([{transform: `translate(${dx}px, ${dy}px)`}, {transform: 'none'}], {
        duration: 620,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)'
      });
    });

    previous.current.forEach((_position, id) => {
      if (!chips.current.has(id)) previous.current.delete(id);
    });
  }, [active]);

  const register = (id: AssetId) => (node: HTMLElement | null) => {
    if (node) chips.current.set(id, node);
  };

  return {register, strip};
};

/** The balances bar. Rendered per step; only the active one registers its chips
 *  for animation, so four copies of the ape cannot fight over one position. */
const Strip = ({
  step,
  index,
  live,
  register,
  stripRef
}: {
  step: Step;
  index: number;
  live: boolean;
  register: (id: AssetId) => (node: HTMLElement | null) => void;
  stripRef: (node: HTMLDivElement | null) => void;
}) => {
  const moved = movedInto(index);

  return (
    <div className="ls-balances">
      <div className="ls-strip" ref={live ? stripRef : undefined}>
        {HOLDERS.map((holder) => (
          <div className="ls-col" key={holder.id} data-who={holder.id}>
            <span className="ls-col-face">
              <Blobatar name={holder.name} size={26} hue={holder.hue} />
            </span>
            <span className="ls-col-who">
              <span className="ls-col-name">{holder.name}</span>
              <span className="ls-col-role">{holder.role}</span>
            </span>
            <span className="ls-col-holds">
              {step.holdings[holder.id].length === 0 ? (
                <span className="ls-empty">holds nothing</span>
              ) : (
                step.holdings[holder.id].map((id) => (
                  <Chip
                    key={id}
                    id={id}
                    moved={live && moved.has(id)}
                    innerRef={live ? register(id) : undefined}
                  />
                ))
              )}
            </span>
          </div>
        ))}
      </div>

      {step.moves.length > 0 ? (
        <div className="ls-moves">
          <span className="ls-moves-key">On scroll</span>
          {step.moves.map((move, order) => (
            <span key={move} className="ls-move">
              {/* Alternating direction, as the hi-fi draws it: the arrow says
                  which way across the strip to look. */}
              {order % 2 === 0 ? <ArrowRight /> : <ArrowLeft />}
              {move}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Card = ({card}: {card: OrderCard}) => (
  <div className="ls-card">
    <div className="ls-card-head">
      <span className="ls-card-title">{card.title}</span>
      <span className="ls-badge" data-tone={card.tone}>
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
        <span className="ls-tx-pill">
          <Zap />
          {scene.tx.header}
        </span>
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

    {scene.note ? (
      <p className="ls-note">
        <Info />
        <span>{scene.note}</span>
      </p>
    ) : null}
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
    // where they no longer are.
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

  return (
    <section className="ls" data-mounted={mounted ? 'true' : 'false'}>
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
            <Strip
              step={entry}
              index={index}
              live={index === active}
              register={register}
              stripRef={(node) => {
                strip.current = node;
              }}
            />

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
