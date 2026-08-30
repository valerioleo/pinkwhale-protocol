'use client';

import type {ReactNode} from 'react';

/** A heading and its contents. No box, no number: the page is short enough. */
export const Section = ({
  title,
  aside,
  children
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) => (
  <section className="section">
    <div className="section-head">
      <h2>{title}</h2>
      {aside ? <span className="section-aside">{aside}</span> : null}
    </div>
    {children}
  </section>
);
