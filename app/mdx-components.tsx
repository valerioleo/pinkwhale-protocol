import type {MDXComponents} from 'mdx/types';

/**
 * Required by `@next/mdx` at the app root. Element styling lives in the stylesheet
 * rather than here, so this stays a passthrough until a tag actually needs a
 * component behind it.
 */
export const useMDXComponents = (components: MDXComponents): MDXComponents => components;
