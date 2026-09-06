'use client';

import type {ComponentProps} from 'react';

/**
 * shadcn/ui's Skeleton, in this project's idiom.
 *
 * Upstream it is three Tailwind utilities — `animate-pulse rounded-md bg-accent` —
 * and there is no Tailwind here, so the recipe moves to `.skeleton` in globals.css.
 * The props and the `data-slot` are kept identical, so if Tailwind ever arrives
 * this file is deleted and the import path changes and nothing else does.
 */
export const Skeleton = ({className = '', ...props}: ComponentProps<'div'>) => (
  <div data-slot="skeleton" className={`skeleton ${className}`.trim()} {...props} />
);
