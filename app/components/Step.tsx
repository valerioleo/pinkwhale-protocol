'use client';

import type {ReactNode} from 'react';

/**
 * One rung of the stepper. Done steps collapse to a line you can reopen, the
 * active one is expanded, and later ones say why they are shut rather than just
 * being greyed out.
 */
export type StepState = 'done' | 'active' | 'locked';

export const Step = ({
  index,
  title,
  persona,
  state,
  summary,
  /** Keeps a finished step expanded, for the ones worth looking at afterwards. */
  alwaysOpen = false,
  children
}: {
  index: number;
  title: string;
  persona?: 'lender' | 'borrower';
  state: StepState;
  summary?: ReactNode;
  alwaysOpen?: boolean;
  children?: ReactNode;
}) => (
  <section className={`step step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
    <span className="step-marker">{state === 'done' ? '✓' : index}</span>

    <div className="step-body">
      <div className="step-head">
        <h2>
          {index} · {title}
          {persona ? <span className={`tag tag--${persona}`}>{persona}</span> : null}
        </h2>
        {summary ? <span className="step-summary">{summary}</span> : null}
      </div>

      {(state === 'active' || alwaysOpen) && children ? (
        <div className="step-content">{children}</div>
      ) : null}
    </div>
  </section>
);
