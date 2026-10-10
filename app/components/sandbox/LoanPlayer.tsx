'use client';

import Image from 'next/image';
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject
} from 'react';

import {OrderCard} from './OrderCard';
import {Avatar, Check, FastForward, RotateCcw, Sys, Whale} from './marks';
import {
  CLAIM_DAY,
  ENDINGS,
  MATCHED_ANNOUNCEMENT,
  TERM_DAYS,
  exitOrders,
  signedOrders,
  windowClosed,
  type Outcome
} from './model';

/**
 * The loan, from execution to outcome, as one figure.
 *
 * It opens on the two signed orders. The reader matches them: the ape moves into
 * Pinkwhale's custody, and the execution branches into the two orders it leaves
 * behind, each sitting on its own stretch of time. From there the clock runs by
 * itself; the reader can drag it, repay as Alice, or skip past the deadline and
 * watch Bob claim.
 *
 * Whether the orders have matched, the day, the outcome and what the clock is
 * doing are the only state. Interest, which order is fillable and which is dead
 * are all read off them.
 */

/** Auto-advance runs a day every 300ms, so the whole window takes about nine seconds. */
const DAY_MS = 300;

/** How long a skip takes to carry the clock to the deadline. */
const SKIP_MS = 600;

/** The BAYC's flight into custody, and between the pill and the ownership chip. */
const FLIGHT_MS = 450;

/**
 * How long the match sequence runs before the clock may start, per layout. These
 * are the sums of the delays and durations in the stylesheet's match timeline.
 */
const MATCH_MS = {wide: 1350, narrow: 1330, reduced: 150} as const;

/** Below this the figure stacks: one column, the rail on the left. */
const NARROW = '(max-width: 859px)';

const REDUCED = '(prefers-reduced-motion: reduce)';

/** The marker moves a day at a time from the keyboard. */
const KEY_STEP: Partial<Record<string, number>> = {ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1};

type Mode = 'auto' | 'paused' | 'skipping' | 'ended';

type State = {
  /** The two signed orders have been matched and the loan exists. */
  readonly matched: boolean;
  /** Counts plays, so a reset restarts the clock's effects even from the same day. */
  readonly play: number;
  readonly day: number;
  /** The day the current run of the clock started from. */
  readonly from: number;
  readonly mode: Mode;
  readonly outcome: Outcome;
};

type Action =
  | {readonly type: 'match'}
  | {readonly type: 'tick'; readonly day: number}
  | {readonly type: 'claim'}
  | {readonly type: 'repay'}
  | {readonly type: 'skip'}
  | {readonly type: 'scrub'; readonly day: number}
  | {readonly type: 'release'}
  | {readonly type: 'reset'};

const INITIAL: State = {matched: false, play: 0, day: 0, from: 0, mode: 'auto', outcome: 'running'};

/** Whether the reader can still move the clock by hand. */
const steerable = (state: State) => state.mode === 'auto' || state.mode === 'paused';

const clampDay = (day: number) => Math.min(Math.max(day, 0), TERM_DAYS);

/**
 * The deadline and the claim are one moment: nothing stands between the window
 * closing and Bob taking the ape.
 */
const claimed = (state: State): State => ({...state, day: CLAIM_DAY, mode: 'ended', outcome: 'claimed'});

const reduce = (state: State, action: Action): State => {
  switch (action.type) {
    case 'match':
      return {...state, matched: true};
    case 'tick':
      return state.mode === 'auto' || state.mode === 'skipping' ? {...state, day: action.day} : state;
    case 'claim':
      return state.outcome === 'running' ? claimed(state) : state;
    case 'repay':
      return steerable(state) && !windowClosed(state.day)
        ? {...state, mode: 'ended', outcome: 'repaid'}
        : state;
    case 'skip':
      return steerable(state) ? {...state, mode: 'skipping', from: state.day} : state;
    case 'scrub':
      return steerable(state) ? {...state, mode: 'paused', day: clampDay(action.day)} : state;
    case 'release':
      // Dragged all the way to the deadline is the same as reaching it.
      return state.mode === 'paused' && windowClosed(state.day) ? claimed(state) : state;
    case 'reset':
      // Back to the opening of the loan, not to before it: the orders stay matched.
      return {...INITIAL, matched: true, play: state.play + 1};
  }
};

const subscribeTo = (query: string) => (onChange: () => void) => {
  const list = window.matchMedia(query);

  list.addEventListener('change', onChange);

  return () => list.removeEventListener('change', onChange);
};

const useMedia = (query: string) =>
  useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false
  );

/**
 * Latches once at least `threshold` of the element has been on screen. One-way on
 * purpose: these start things, and a start is not undone by scrolling away.
 */
const useSeen = (ref: RefObject<Element | null>, threshold: number) => {
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || seen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setSeen(true);
      },
      {threshold}
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [ref, threshold, seen]);

  return seen;
};

type Links = {readonly width: number; readonly height: number; readonly merge: string[]; readonly branch: string[]};

/**
 * The lines that join the four orders through the pill, drawn from where the cards
 * actually are rather than from offsets that hold at one width only.
 */
const useLinks = (matched: boolean, refs: {
  player: RefObject<HTMLElement | null>;
  alice: RefObject<HTMLElement | null>;
  bob: RefObject<HTMLElement | null>;
  pill: RefObject<HTMLElement | null>;
  repayment: RefObject<HTMLElement | null>;
  fallback: RefObject<HTMLElement | null>;
}) => {
  const [links, setLinks] = useState<Links | null>(null);
  const {player, alice, bob, pill, repayment, fallback} = refs;

  useEffect(() => {
    const root = player.current;

    // Until the match there is no pill for the lines to meet.
    if (!root || !matched) return;

    const measure = () => {
      const nodes = [alice.current, bob.current, pill.current, repayment.current, fallback.current];
      const [a, b, p, r, f] = nodes.map(node => node?.getBoundingClientRect());

      if (!a || !b || !p || !r || !f) return;

      const box = root.getBoundingClientRect();
      // Half-pixel offsets, so a 1px stroke lands on one row of pixels, not two.
      const x = (rect: DOMRect) => Math.round(rect.left + rect.width / 2 - box.left) + 0.5;
      const y = (value: number) => Math.round(value - box.top) + 0.5;

      const signedBottom = y(Math.max(a.bottom, b.bottom));
      const pillTop = y(p.top);
      const pillBottom = y(p.bottom);
      const exitsTop = y(Math.min(r.top, f.top));
      // The elbows sit a stem's length from the pill, as they do in the drawing.
      const mergeAt = pillTop - 16;
      const branchAt = pillBottom + 16;

      setLinks({
        width: box.width,
        height: box.height,
        merge: [
          `M${x(a)} ${signedBottom}V${mergeAt}H${x(p)}V${pillTop}`,
          `M${x(b)} ${signedBottom}V${mergeAt}H${x(p)}`
        ],
        branch: [
          `M${x(p)} ${pillBottom}V${branchAt}H${x(r)}V${exitsTop}`,
          `M${x(p)} ${pillBottom}V${branchAt}H${x(f)}V${exitsTop}`
        ]
      });
    };

    const observer = new ResizeObserver(measure);

    observer.observe(root);

    return () => observer.disconnect();
  }, [matched, player, alice, bob, pill, repayment, fallback]);

  return links;
};

const onScreen = (rect: {top: number; bottom: number}) =>
  rect.bottom > 0 && rect.top < window.innerHeight;

/**
 * Flies a copy of `target` in from `from`, and shows the real one when it lands.
 * Returns the way to stop it early.
 */
const fly = (target: HTMLElement, from: DOMRect, to: {left: number; top: number; width: number}) => {
  const copy = target.cloneNode(true);

  if (!(copy instanceof HTMLElement)) return () => undefined;

  Object.assign(copy.style, {
    position: 'fixed',
    left: `${to.left}px`,
    top: `${to.top}px`,
    margin: '0',
    zIndex: '60',
    pointerEvents: 'none',
    transformOrigin: '0 0'
  });
  document.body.append(copy);
  target.style.visibility = 'hidden';

  const flight = copy.animate(
    [
      {
        transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`
      },
      {transform: 'none'}
    ],
    {duration: FLIGHT_MS, easing: 'cubic-bezier(0.42, 0, 0.58, 1)'}
  );

  const land = () => {
    copy.remove();
    target.style.visibility = '';
  };

  flight.addEventListener('finish', land);

  return () => {
    flight.cancel();
    land();
  };
};

const DayClock = ({day, outcome, className}: {day: number; outcome: Outcome; className: string}) => (
  <div className={className}>
    <p className="lc-day">Day {Math.floor(day)}</p>
    <p className="lc-day-note" data-outcome={outcome}>
      {outcome === 'running' ? `of ${TERM_DAYS} days` : ENDINGS[outcome].subtitle}
    </p>
  </div>
);

export const LoanPlayer = () => {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const {matched, day, from, mode, outcome, play} = state;

  const narrow = useMedia(NARROW);
  const reduced = useMedia(REDUCED);

  const playerRef = useRef<HTMLElement | null>(null);
  const aliceRef = useRef<HTMLElement | null>(null);
  const bobRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLParagraphElement | null>(null);
  const repaymentRef = useRef<HTMLElement | null>(null);
  const fallbackRef = useRef<HTMLElement | null>(null);
  const custodyRef = useRef<HTMLSpanElement | null>(null);
  const pillThumbRef = useRef<HTMLImageElement | null>(null);
  const chipThumbRef = useRef<HTMLImageElement | null>(null);
  const flightFrom = useRef<DOMRect | null>(null);

  // Wide, the whole figure is one screen, and it enters once half of it is showing.
  // Narrow, it is three screens tall: the entry plays as its top arrives, and after
  // the match the clock waits for the repayment order, which is where the time is
  // drawn.
  const playerSeen = useSeen(playerRef, 0.5);
  const aliceSeen = useSeen(aliceRef, 0.5);
  const repaymentSeen = useSeen(repaymentRef, 0.5);

  const entered = narrow ? aliceSeen : playerSeen;
  const startable = narrow ? repaymentSeen : playerSeen;

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!matched) return;

    const id = setTimeout(
      () => setReady(true),
      reduced ? MATCH_MS.reduced : narrow ? MATCH_MS.narrow : MATCH_MS.wide
    );

    return () => clearTimeout(id);
  }, [matched, narrow, reduced]);

  const ended = outcome !== 'running';

  /** Notes where the BAYC is before it changes hands, so it can fly from there. */
  const takeOff = () => {
    const source = ended ? chipThumbRef.current : pillThumbRef.current;

    flightFrom.current = source ? source.getBoundingClientRect() : null;
  };

  const claim = useEffectEvent(() => {
    takeOff();
    dispatch({type: 'claim'});
  });

  // No auto-advance under reduced motion: the reader moves time with the buttons.
  const live = ready && startable && !reduced;
  const runs = (mode === 'auto' && live) || mode === 'skipping';

  useEffect(() => {
    if (!runs) return;

    let frame = 0;
    let startedAt: number | null = null;

    // Linear on purpose: time in the figure has no easing.
    const tick = (now: number) => {
      startedAt ??= now;

      const elapsed = now - startedAt;
      const next =
        mode === 'skipping'
          ? from + (TERM_DAYS - from) * (reduced ? 1 : Math.min(elapsed / SKIP_MS, 1))
          : from + elapsed / DAY_MS;

      if (next >= TERM_DAYS) {
        claim();

        return;
      }

      dispatch({type: 'tick', day: next});
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [runs, mode, from, play, reduced]);

  // The custody handoffs. The ape flies from Alice's order into the pill when the
  // orders match, from the pill to the ownership chip when the loan ends, and back
  // when it is reset.
  useLayoutEffect(() => {
    const source = flightFrom.current;

    flightFrom.current = null;

    const target = ended ? chipThumbRef.current : pillThumbRef.current;
    const custody = custodyRef.current;

    if (!source || !target || !custody || reduced) return;

    const rect = target.getBoundingClientRect();
    // Going home, the pill is about to grow back around the ape and, centred, it
    // grows both ways: where the ape will land is half that growth to the left of
    // where it is now.
    const growth = ended ? 0 : custody.scrollWidth - custody.getBoundingClientRect().width;
    const landing = {left: rect.left - growth / 2, top: rect.top, width: rect.width};

    // Off screen, a flight would be seen landing from nowhere; the chip fades in instead.
    if (!onScreen(source) || !onScreen(rect)) return;

    return fly(target, source, landing);
  }, [matched, ended, reduced]);

  const links = useLinks(matched, {
    player: playerRef,
    alice: aliceRef,
    bob: bobRef,
    pill: pillRef,
    repayment: repaymentRef,
    fallback: fallbackRef
  });

  // Before its clock starts the figure is a picture: both orders exist and neither
  // is yet the one that matters.
  const waiting = !ready || (mode === 'auto' && !startable && !reduced);
  const [repayment, fallback] = exitOrders(outcome, day, waiting);
  const closed = windowClosed(day);
  const paused = mode === 'paused' || (mode === 'auto' && reduced);

  const scrubTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();

    dispatch({type: 'scrub', day: ((event.clientX - box.left) / box.width) * TERM_DAYS});
  };

  const match = () => {
    const source = aliceRef.current ? aliceRef.current.querySelector('img[data-asset="bayc"]') : null;

    flightFrom.current = source ? source.getBoundingClientRect() : null;
    dispatch({type: 'match'});
  };

  /** Letting go at the deadline claims, and the ape leaves the pill as it does. */
  const release = () => {
    if (mode === 'paused' && windowClosed(day)) takeOff();
    dispatch({type: 'release'});
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    // Narrow, the rail runs down the page, and dragging it would fight the scroll.
    if (narrow || !steerable(state)) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    scrubTo(event);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubTo(event);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    const step = KEY_STEP[event.key];
    const target =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? TERM_DAYS
          : step === undefined
            ? null
            : Math.round(day) + step;

    if (target === null || !steerable(state)) return;

    event.preventDefault();

    if (windowClosed(target)) takeOff();

    dispatch({type: 'scrub', day: target});
    dispatch({type: 'release'});
  };

  const repay = () => {
    takeOff();
    dispatch({type: 'repay'});
  };

  const reset = () => {
    if (ended) takeOff();
    dispatch({type: 'reset'});
  };

  const owner = ended ? ENDINGS[outcome] : null;
  const [alice, bob] = signedOrders(matched);
  const progress = Math.min(day, TERM_DAYS) / TERM_DAYS;

  return (
    <figure
      className="lc-player"
      ref={playerRef}
      data-entered={entered ? 'true' : 'false'}
      data-matched={matched ? 'true' : 'false'}
      data-ready={ready ? 'true' : 'false'}
      data-outcome={outcome}
      data-closed={closed ? 'true' : 'false'}
      data-waiting={waiting ? 'true' : 'false'}
      style={{'--p': progress} as CSSProperties}
    >
      {links ? (
        <svg
          className="lc-links"
          width={links.width}
          height={links.height}
          viewBox={`0 0 ${links.width} ${links.height}`}
          aria-hidden="true"
        >
          {/* Keyed by which card each joins: stacked, two paths can be the same line. */}
          {links.merge.map((d, index) => (
            <path key={`merge-${index}`} d={d} pathLength={1} data-link="merge" />
          ))}
          {links.branch.map((d, index) => (
            <path key={`branch-${index}`} d={d} pathLength={1} data-link="branch" />
          ))}
        </svg>
      ) : null}

      <div className="lc-signed">
        <OrderCard order={alice} cardRef={aliceRef} className="lc-enter" />
        <div className="lc-matches lc-enter" aria-hidden="true">
          <span className="lc-stem" />
          <span>matches</span>
          <span className="lc-stem" />
        </div>
        <OrderCard order={bob} cardRef={bobRef} className="lc-enter" />
      </div>

      <div className="lc-merge" aria-hidden="true">
        <span className="lc-stem" />
      </div>

      <div className="lc-origin">
        <span className="lc-origin-balance" />
        {/* The match happens where the orders meet, so that is where it is asked for. */}
        {matched ? (
          <p className="lc-pill" ref={pillRef}>
            <Whale />
            <span className="lc-pill-label">Loan executed</span>
            <span className="lc-custody" ref={custodyRef} aria-hidden={ended}>
              <span className="lc-custody-inner">
                <span className="lc-pill-divider" />
                <Image ref={pillThumbRef} src="/tokens/bayc.png" alt="" width={24} height={24} />
                <span className="lc-pill-detail">held by Pinkwhale</span>
              </span>
            </span>
          </p>
        ) : (
          <button type="button" className="lc-button lc-match" data-primary="true" onClick={match}>
            Match orders
          </button>
        )}
        <DayClock day={day} outcome={outcome} className="lc-clock" />
      </div>

      {/* What execution leaves behind. Folded away until there has been one. */}
      <div className="lc-result" inert={!matched}>
        <div className="lc-result-inner">
          <div className="lc-branch" aria-hidden="true">
            <span className="lc-stem" />
          </div>

          <div className="lc-lower">
            <div className="lc-exits">
              <span className="lc-label-rail" data-zone="repayment" />
              <p className="lc-phase" data-zone="repayment">
                REPAYMENT
                <span className="lc-narrow-only">
                  {' · DAY 0 '}
                  <Sys>→</Sys>
                  {` ${TERM_DAYS}`}
                </span>
              </p>
              <div
                className="lc-track"
                data-zone="repayment"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={release}
                onPointerCancel={release}
              >
                <span className="lc-track-done" />
                <span className="lc-track-ahead" />
                {outcome === 'claimed' ? null : (
                  <span
                    className="lc-marker"
                    role="slider"
                    tabIndex={steerable(state) ? 0 : -1}
                    aria-label="Day of the loan"
                    aria-valuemin={0}
                    aria-valuemax={TERM_DAYS}
                    aria-valuenow={Math.floor(day)}
                    aria-valuetext={`Day ${Math.floor(day)} of ${TERM_DAYS}`}
                    onKeyDown={onKeyDown}
                  />
                )}
              </div>
              <p className="lc-dates" data-zone="repayment">
                <span>DAY 0 · EXECUTED</span>
                <span>DAY {TERM_DAYS}</span>
              </p>
              <OrderCard order={repayment} cardRef={repaymentRef} className="lc-exit" />

              <div className="lc-deadline" aria-hidden="true">
                <span className="lc-deadline-tick" />
                <span className="lc-deadline-day">DAY {TERM_DAYS}</span>
                <span className="lc-deadline-line" />
                <em>or</em>
                <span className="lc-deadline-line" />
              </div>

              <span className="lc-label-rail" data-zone="claim" />
              <p className="lc-phase" data-zone="claim">
                CLAIM<span className="lc-narrow-only"> · AFTER DAY {TERM_DAYS} · OPEN</span>
              </p>
              <div className="lc-track" data-zone="claim">
                <span className="lc-track-rail" />
                {outcome === 'claimed' ? <span className="lc-marker" /> : null}
              </div>
              <p className="lc-dates" data-zone="claim">
                <span>AFTER DAY {TERM_DAYS}</span>
                <span>OPEN</span>
              </p>
              <OrderCard order={fallback} cardRef={fallbackRef} className="lc-exit" />

              <span className="lc-curtain" aria-hidden="true" />
            </div>

            <div className="lc-controls">
              <DayClock day={day} outcome={outcome} className="lc-controls-clock" />

              {owner ? (
                <div className="lc-actions" data-ended="true">
                  <button type="button" className="lc-button" onClick={reset}>
                    <RotateCcw />
                    Reset
                  </button>
                  <p className="lc-chip" data-owner={owner.owner}>
                    <Image ref={chipThumbRef} src="/tokens/bayc.png" alt="" width={22} height={22} />
                    <span className="lc-chip-label">BAYC owned by</span>
                    <Avatar who={owner.owner} />
                    <span className="lc-chip-name">{owner.name}</span>
                  </p>
                </div>
              ) : (
                <>
                  <p className="lc-hint">
                    <span className="lc-wide-only">DRAG THE MARKER TO MOVE TIME</span>
                    <span className="lc-narrow-only">{paused ? 'PAUSED' : 'AUTO-PLAYING'}</span>
                  </p>
                  <div className="lc-actions">
                    <button
                      type="button"
                      className="lc-button"
                      data-primary="true"
                      onClick={repay}
                      disabled={closed || !steerable(state)}
                    >
                      <Check />
                      Repay as Alice
                    </button>
                    <button
                      type="button"
                      className="lc-button"
                      onClick={() => dispatch({type: 'skip'})}
                      disabled={!steerable(state)}
                    >
                      <FastForward />
                      Skip past day {TERM_DAYS}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="lc-announce" role="status" aria-live="polite">
        {owner ? owner.announce : matched ? MATCHED_ANNOUNCEMENT : ''}
      </p>
    </figure>
  );
};
