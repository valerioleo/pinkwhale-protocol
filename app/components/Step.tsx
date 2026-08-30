'use client';

import type {ReactNode} from 'react';

/**
 * A section of the flow.
 *
 * Not numbered: there are two of them and the order is obvious from the page, so
 * a number was one more thing to keep in sync every time the shape changed — and
 * it went wrong every time.
 */
export type StepState = 'done' | 'active' | 'locked';

export const Step = ({
  title,
  state,
  summary,
  /** Keeps a finished section expanded, for the ones worth looking at afterwards. */
  alwaysOpen = false,
  children
}: {
  title: string;
  state: StepState;
  summary?: ReactNode;
  alwaysOpen?: boolean;
  children?: ReactNode;
}) => (
  <section className={`step step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
    <span className="step-marker" aria-hidden="true">
      {state === 'done' ? '✓' : ''}
    </span>

    <div className="step-body">
      <div className="step-head">
        <h2>{title}</h2>
        {summary ? <span className="step-summary">{summary}</span> : null}
      </div>

      {(state === 'active' || alwaysOpen) && children ? (
        <div className="step-content">{children}</div>
      ) : null}
    </div>
  </section>
);
