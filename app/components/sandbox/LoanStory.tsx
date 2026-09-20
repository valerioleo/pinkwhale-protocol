'use client';

import {Blobatar} from '@blobatar/react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject
} from 'react';

import {Chip} from './Chip';
import {Info, Zap} from './icons';
import {
  APE_LABEL,
  HOLDERS,
  STEPS,
  frameAt,
  movedInto,
  type AssetId,
  type Frame,
  type OrderCard,
  type Step
} from './story';

/**
 * The loan, told by moving two assets between three columns.
 *
 * One strip, sticky under the nav, holding everything anyone owns. A step takes
 * over when its top reaches that strip, and the assets travel: the chip is
 * measured before and after and animated across the gap, and whatever changed
 * wears a ring while its moment is on screen.
 */

/**
 * How long each moment of a multi-frame step holds before the next plays. Longer
 * than the 620ms the chips take to travel, so one movement finishes before the
 * next begins — they are a sequence, and overlapping them would say otherwise.
 */
const FRAME_MS = 900;

const pad = (index: number) => String(index + 1).padStart(2, '0');

const NEVER_CHANGES = () => () => {};
const onClient = () => true;
const onServer = () => false;

/** Publish the nav's real height so the strip comes to rest exactly under it. */
const useNavHeight = () => {
  useEffect(() => {
    const nav = document.querySelector('.nav');

    if (!nav) return;

    const publish = () =>
      document.documentElement.style.setProperty(
        '--nav-height',
        `${Math.round(nav.getBoundingClientRect().height)}px`
      );

    publish();

    const observer = new ResizeObserver(publish);

    observer.observe(nav);

    return () => observer.disconnect();
  }, []);
};

/**
 * FLIP, for the one thing on the page that has to feel physical.
 *
 * A crossfade would say two assets existed; there is only ever one ape and one
 * pile of USDC. Positions are taken against the strip rather than the viewport
 * because the strip is sticky — while it settles its viewport coordinates move
 * under us, and a change during those few hundred pixels would animate the page's
 * scroll instead of the asset's journey.
 */
const useAssetFlip = (key: string) => {
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
  }, [key]);

  const register = (id: AssetId) => (node: HTMLElement | null) => {
    if (node) chips.current.set(id, node);
  };

  return {register, stripRef: strip};
};

/**
 * The balances bar — one for the page, not one per step.
 *
 * The hi-fi draws a copy above every step, which is how a static board has to
 * show four states. Here there is only ever one, because the assets have to be
 * able to travel: a chip replaced by a copy of itself in another element has not
 * moved anywhere, it has been redrawn.
 */
const Strip = ({
  frame,
  moment,
  register,
  stripRef
}: {
  frame: Frame;
  moment: ReadonlySet<AssetId>;
  register: (id: AssetId) => (node: HTMLElement | null) => void;
  stripRef: RefObject<HTMLDivElement | null>;
}) => (
  <div className="ls-balances">
    <div className="ls-strip" ref={stripRef}>
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
            {frame.holdings[holder.id].length === 0 ? (
              <span className="ls-empty">holds nothing</span>
            ) : (
              frame.holdings[holder.id].map((id) => (
                <Chip
                  key={id}
                  id={id}
                  label={id === 'ape' ? APE_LABEL : frame.usdc}
                  moved={moment.has(id)}
                  innerRef={register(id)}
                />
              ))
            )}
          </span>
        </div>
      ))}
    </div>

  </div>
);

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
  /**
   * Which moment of the active step is showing, tagged with the step it belongs
   * to. Tagged rather than reset, so arriving at a new step derives frame 0
   * without a second state write — the tag simply stops matching.
   */
  const [played, setPlayed] = useState({step: 0, frame: 0});
  const stepsRef = useRef<(HTMLElement | null)[]>([]);
  const mounted = useSyncExternalStore(NEVER_CHANGES, onClient, onServer);

  const frameIndex = played.step === active ? played.frame : 0;
  const {register, stripRef} = useAssetFlip(`${active}:${frameIndex}`);

  useNavHeight();

  useEffect(() => {
    // Geometry rather than IntersectionObserver, as in cudo's tour: an observer
    // only reports crossings it happens to see, so a fling that carries a step
    // past a thin trigger band between two frames leaves the strip holding assets
    // where they no longer are.
    const compute = () => {
      // The strip's own lower edge is the line. A step takes over exactly when it
      // arrives underneath the balances it is about to change, which is both what
      // the eye expects and a number nothing has to keep in sync by hand.
      const line = stripRef.current?.getBoundingClientRect().bottom ?? 0;

      setActive(
        stepsRef.current.reduce(
          (found, node, index) =>
            node !== null && node.getBoundingClientRect().top <= line + 1 ? index : found,
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
  }, [stripRef]);

  useEffect(() => {
    const total = STEPS[active]?.frames.length ?? 1;

    if (total < 2) return;

    // Scheduled, never set synchronously: the displayed frame falls back to 0
    // whenever the tag does not match, so arriving needs no write at all.
    const timers = Array.from({length: total - 1}, (_, order) =>
      window.setTimeout(() => setPlayed({step: active, frame: order + 1}), (order + 1) * FRAME_MS)
    );

    return () => timers.forEach(window.clearTimeout);
  }, [active]);

  const step = STEPS[active] ?? STEPS[0]!;
  const frame = frameAt(active, frameIndex) ?? step.frames[0]!;

  return (
    <section className="ls" data-mounted={mounted ? 'true' : 'false'}>
      <Strip
        frame={frame}
        moment={movedInto(active, frameIndex)}
        register={register}
        stripRef={stripRef}
      />

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

      {/* Room for the last step to climb.

          A step activates when its top reaches the strip, which the final one can
          never do if the document ends just below it — it would sit there unplayed
          however hard you scrolled. A viewport of tail gives every step, including
          the last, the same distance to travel. */}
      <div className="ls-tail" aria-hidden="true" />
    </section>
  );
};
