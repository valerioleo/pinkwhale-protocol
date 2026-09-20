'use client';

import Image from 'next/image';

import {ASSETS, type AssetId} from './story';

/**
 * An asset, as a pill with its own mark.
 *
 * The label is passed in rather than read from the asset, because the USDC pile
 * keeps its identity while its amount changes — the chip that reads 100 and the
 * chip that reads 110 are the same chip, and that is the whole reason it can
 * travel instead of being replaced.
 *
 * `moved` is the green ring: whatever has just changed, marked for as long as its
 * moment is on screen.
 */
export const Chip = ({
  id,
  label,
  moved,
  innerRef
}: {
  id: AssetId;
  label: string;
  moved: boolean;
  innerRef?: (node: HTMLElement | null) => void;
}) => {
  const {kind, icon} = ASSETS[id];

  return (
    <span ref={innerRef} className="ls-chip" data-kind={kind} data-moved={moved}>
      <Image className="ls-chip-mark" src={icon} alt="" width={18} height={18} data-kind={kind} />
      {label}
    </span>
  );
};
