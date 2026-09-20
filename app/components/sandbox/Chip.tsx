'use client';

import Image from 'next/image';

import {ASSETS, type AssetId} from './story';

/**
 * An asset, as a pill with its own mark.
 *
 * `moved` is what the hi-fi draws as a green ring: the thing that has just
 * changed hands, marked for as long as its step is the one being read. Without
 * it the strip is a table; with it the strip is the story.
 */
export const Chip = ({
  id,
  moved,
  innerRef
}: {
  id: AssetId;
  moved: boolean;
  innerRef?: (node: HTMLElement | null) => void;
}) => {
  const asset = ASSETS[id];

  return (
    <span ref={innerRef} className="ls-chip" data-kind={asset.kind} data-moved={moved}>
      <Image
        className="ls-chip-mark"
        src={asset.icon}
        alt=""
        width={18}
        height={18}
        data-kind={asset.kind}
      />
      {asset.label}
    </span>
  );
};
