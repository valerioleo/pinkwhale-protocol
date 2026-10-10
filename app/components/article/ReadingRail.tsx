'use client';

import {useEffect, useState} from 'react';

const CHAPTERS = [
  ['the-idea', 'The idea'], ['one-loan', 'One loan'], ['four-orders', 'Four orders'],
  ['the-guard', 'The missing guard'], ['what-comes-free', 'What comes free'], ['the-catch', 'The catch']
] as const;

export function ReadingRail() {
  const [active, setActive] = useState<string>('the-idea');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let current: string = CHAPTERS[0][0];
        for (const [id] of CHAPTERS) {
          if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < innerHeight * 0.35) current = id;
        }
        setActive(current);
      });
    };
    update();
    window.addEventListener('scroll', update, {passive: true});
    return () => {cancelAnimationFrame(frame); window.removeEventListener('scroll', update);};
  }, []);
  return <nav className="reading-rail" aria-label="Essay chapters">
    <span className="eyebrow">In this essay</span>
    <ol>{CHAPTERS.map(([id, label], index) => <li key={id}>
      <a href={`#${id}`} aria-current={active === id ? 'location' : undefined}><span>{index === 0 ? '—' : String(index).padStart(2, '0')}</span>{label}</a>
    </li>)}</ol>
    <a className="reading-rail__source" href="https://github.com/valerioleo/pinkwhale-protocol">View the source ↗</a>
  </nav>;
}
