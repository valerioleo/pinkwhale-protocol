'use client';

import {useRef, useState, type CSSProperties, type KeyboardEvent} from 'react';

export type CodeTab = {
  readonly id: string;
  readonly label: string;
  readonly file: string;
  readonly url: string;
  readonly blurb: string;
  /** Highlighted at build time by shiki, from the repository's own source. */
  readonly html: string;
};

/** Arrow keys move between tabs, as a tablist should; Home and End jump to the ends. */
const KEY_MOVE: Partial<Record<string, (index: number, count: number) => number>> = {
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_, count) => count - 1
};

export const CodeTabs = ({tabs}: {tabs: readonly CodeTab[]}) => {
  const [active, setActive] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const current = tabs[active];

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = KEY_MOVE[event.key];

    if (!move) return;

    event.preventDefault();

    const next = move(active, tabs.length);

    setActive(next);
    buttons.current[next]?.focus();
  };

  if (!current) return null;

  return (
    <div className="ld-code" style={{'--tab': active, '--tabs': tabs.length} as CSSProperties}>
      <div className="ld-code-tabs" role="tablist" aria-label="Contract excerpts" onKeyDown={onKeyDown}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={node => {
              buttons.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`ld-code-tab-${tab.id}`}
            aria-selected={index === active}
            aria-controls="ld-code-panel"
            tabIndex={index === active ? 0 : -1}
            className="ld-code-tab"
            onClick={() => setActive(index)}
          >
            <span className="ld-code-num">{String(index + 1).padStart(2, '0')}</span>
            {tab.label}
          </button>
        ))}
        <span className="ld-code-indicator" aria-hidden="true" />
      </div>

      <div
        className="ld-code-panel"
        id="ld-code-panel"
        role="tabpanel"
        aria-labelledby={`ld-code-tab-${current.id}`}
      >
        <p className="ld-code-blurb">{current.blurb}</p>
        {/* Keyed so a change of tab replaces the block rather than patching it. */}
        <div className="ld-code-block" key={current.id} dangerouslySetInnerHTML={{__html: current.html}} />
        <a className="ld-code-file" href={current.url}>
          {current.file} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
};
