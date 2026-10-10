import type {MDXComponents} from 'mdx/types';
import type {ComponentProps} from 'react';

/**
 * Keep wide reference tables inside a keyboard-scrollable region so they never
 * widen the reading surface on a phone.
 */
const Table = (props: ComponentProps<'table'>) => (
  <div className="table-scroll" role="region" aria-label="Scrollable table" tabIndex={0}>
    <table {...props} />
  </div>
);

export const useMDXComponents = (components: MDXComponents): MDXComponents => ({table: Table, ...components});
