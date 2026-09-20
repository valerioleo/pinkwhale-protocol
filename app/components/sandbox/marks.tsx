/**
 * The status glyphs, inlined.
 *
 * Six paths is not worth a dependency, and inlining them means each takes
 * `currentColor` from the badge it sits in — so a status's colour is decided once,
 * by the badge, and the glyph cannot disagree with it.
 */
import type {ExitOrder} from './model';

const frame = {
  width: 12,
  height: 12,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true
} as const;

const Check = () => (
  <svg {...frame}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const Ban = () => (
  <svg {...frame} strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </svg>
);

const Lock = () => (
  <svg {...frame} strokeWidth={2}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Dot = () => (
  <svg {...frame} viewBox="0 0 12 12" fill="currentColor" stroke="none">
    <circle cx="6" cy="6" r="3.5" />
  </svg>
);

export const Play = () => (
  <svg {...frame} width={9} height={9} viewBox="0 0 12 12" fill="currentColor" stroke="none">
    <path d="M3 1.5 10 6l-7 4.5z" />
  </svg>
);

export const Stop = () => (
  <svg {...frame} width={9} height={9} viewBox="0 0 12 12" fill="currentColor" stroke="none">
    <rect x="2.5" y="2.5" width="7" height="7" />
  </svg>
);

/** One decision: the mark picks the glyph, the badge picks the colour from it. */
export const StatusMark = ({mark}: {mark: ExitOrder['mark']}) => {
  if (mark === 'filled') return <Check />;
  if (mark === 'locked') return <Lock />;
  if (mark === 'live') return <Dot />;

  return <Ban />;
};
