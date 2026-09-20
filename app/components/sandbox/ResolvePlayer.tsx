'use client';

import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';

import {Play, StatusMark, Stop} from './marks';
import {
  BEATS,
  CLAIM_DAYS,
  SETTLES_ON,
  TERM_DAYS,
  exitOrders,
  owedOn,
  playerCopy,
  type ExitOrder,
  type Phase,
  type Scenario
} from './model';

/**
 * The loan, with the clock running.
 *
 * ON ENTRY → ADVANCE → SETTLE → HOLD, as the motion notes put it. Nothing here
 * stores what the loan "is": the day is the only state, and the amount, the
 * phase, which order is fillable and which is dead are all read off it. A figure
 * about a contract that derives everything from `block.timestamp` should work the
 * same way, or the two can disagree.
 */

/** How long the clock takes to cross the whole window, in milliseconds. */
const RUN_MS = 4200;

const TOKEN = {usdc: '/tokens/usdc.png', ape: '/tokens/bayc.png'} as const;

const two = (value: number) => value.toFixed(2);

const Lane = ({
  label,
  fill,
  at,
  tone
}: {
  label: string;
  /** 0–1 of this lane that has elapsed. */
  fill: number;
  /** 0–1 position of the marker, or null when the clock is not in this lane. */
  at: number | null;
  tone: 'repayment' | 'claim';
}) => (
  <div className="lc-lane" data-tone={tone} style={{flexGrow: tone === 'repayment' ? TERM_DAYS : CLAIM_DAYS}}>
    <span className="lc-lane-label">{label}</span>
    <span className="lc-lane-track">
      <span className="lc-lane-fill" style={{width: `${fill * 100}%`}} />
      {at === null ? null : <span className="lc-lane-dot" style={{left: `${at * 100}%`}} />}
    </span>
  </div>
);

const Order = ({order}: {order: ExitOrder}) => (
  <article className="lc-exit" data-mark={order.mark} data-tinted={order.tinted ? 'true' : 'false'}>
    <span className="lc-exit-badge" data-mark={order.mark}>
      <StatusMark mark={order.mark} />
      {order.badge}
    </span>
    <h4 className="lc-exit-title">{order.title}</h4>

    {order.amount ? (
      <p className="lc-exit-amount">
        <Image src={TOKEN.usdc} alt="" width={16} height={16} />
        <strong>{order.amount}</strong>
        <span>USDC</span>
      </p>
    ) : null}

    <p className="lc-exit-note">{order.note}</p>

    <ul className="lc-routes" data-spent={order.spent ? 'true' : 'false'}>
      {order.transfers.map((transfer) => (
        <li key={transfer.route}>
          <Image src={TOKEN[transfer.asset]} alt="" width={16} height={16} data-asset={transfer.asset} />
          {transfer.route}
        </li>
      ))}
    </ul>
  </article>
);

export const ResolvePlayer = ({running}: {running: boolean}) => {
  const [scenario, setScenario] = useState<Scenario>('repay');
  const [day, setDay] = useState(0);
  const startedAt = useRef<number | null>(null);

  const settlesOn = SETTLES_ON[scenario];

  useEffect(() => {
    // Rewound on every scenario change as well as on entry: switching to the
    // other ending mid-run and watching it resume halfway through would be a
    // different loan, not a different outcome for this one.
    startedAt.current = null;

    if (!running) return;

    let frame = 0;
    const tick = (now: number) => {
      startedAt.current ??= now;

      // Paced by the whole window rather than by the settling day, so the two
      // scenarios share a clock speed — the default simply runs longer because
      // it goes further, which is the thing being shown.
      const elapsed = ((now - startedAt.current) / RUN_MS) * (TERM_DAYS + CLAIM_DAYS);

      setDay(Math.min(Math.round(elapsed), settlesOn));

      if (elapsed < settlesOn) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [running, settlesOn, scenario]);

  // Derived, not reset. Before the figure arrives the clock reads zero because
  // it has not started, which is a fact about `running` — writing it into state
  // as well would be a second copy of the same thing, and the lint rule is right
  // that a synchronous setState in an effect is the wrong way to keep it.
  const shown = running ? day : 0;
  const phase: Phase = !running ? 'idle' : shown >= settlesOn ? 'settled' : 'accruing';
  const copy = playerCopy(scenario, phase);
  const [repayment, fallback] = exitOrders(scenario, phase, shown);

  const inClaim = shown > TERM_DAYS;
  const repaymentFill = Math.min(shown, TERM_DAYS) / TERM_DAYS;
  const claimFill = inClaim ? Math.min((shown - TERM_DAYS) / CLAIM_DAYS, 1) : 0;

  return (
    <div className="lc-player">
      <p className="lc-origin">
        <span className="lc-origin-mark" aria-hidden="true" />
        <strong>Pinkwhale</strong> creates two exit orders at loan opening
      </p>

      <div className="lc-controls">
        <span className="lc-playback" data-phase={phase}>
          {phase === 'settled' ? <Stop /> : <Play />}
          {copy.playback}
        </span>

        <div className="lc-scenarios" role="group" aria-label="Scenario">
          {(['repay', 'default'] as const).map((option) => (
            <button
              key={option}
              type="button"
              className="lc-scenario"
              data-on={option === scenario ? 'true' : 'false'}
              onClick={() => setScenario(option)}
            >
              {option === 'repay' ? 'Repay' : 'Default'}
            </button>
          ))}
        </div>
      </div>

      <div className="lc-stage">
        <div className="lc-readout">
          <div>
            <p className="lc-readout-label">{copy.amountLabel}</p>
            <p className="lc-amount">
              <Image src={TOKEN.usdc} alt="" width={22} height={22} />
              <strong>{two(owedOn(shown))}</strong>
              <span>USDC</span>
            </p>
          </div>
          <div className="lc-clock">
            <p className="lc-day">Day {shown}</p>
            <p className="lc-day-note">{copy.dayNote}</p>
          </div>
        </div>

        <div className="lc-lanes">
          <Lane
            label="REPAYMENT"
            tone="repayment"
            fill={repaymentFill}
            at={inClaim ? null : repaymentFill}
          />
          <Lane label={copy.claimLane} tone="claim" fill={claimFill} at={inClaim ? claimFill : null} />
        </div>

        <div className="lc-ticks" aria-hidden="true">
          <span className="lc-tick-label lc-tick-start">DAY 0</span>
          <span className="lc-tick-label lc-tick-deadline">DAY {TERM_DAYS}</span>
          <span className="lc-tick-label lc-tick-after">AFTER DAY {TERM_DAYS}</span>
        </div>

        <div className="lc-exits">
          <Order order={repayment} />
          <Order order={fallback} />
        </div>
      </div>

      <p className="lc-player-caption">{copy.caption}</p>

      <ol className="lc-beats">
        <li className="lc-beats-head">{scenario === 'repay' ? 'REPAY' : 'DEFAULT'} PLAYBACK</li>
        {BEATS[scenario].map((beat, index) => (
          <li key={beat}>
            <span className="lc-beat-num">{String(index + 1).padStart(2, '0')}</span>
            {beat}
          </li>
        ))}
      </ol>
    </div>
  );
};
