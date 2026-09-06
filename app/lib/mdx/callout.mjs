import {visit} from 'unist-util-visit';

/**
 * `:::warning` and `:::info`, the two containers the article uses.
 *
 * `remark-directive` parses the syntax and stops there, leaving a
 * `containerDirective` node for someone else to decide about. This turns the names
 * the article uses into a plain `<aside>` and leaves anything else alone, rather
 * than rendering an unrecognised directive as a bare div.
 */
const KINDS = ['warning', 'info', 'note', 'tip', 'danger'];

const remarkCallout = () => (tree) => {
  visit(tree, (node) => {
    if (node.type !== 'containerDirective' || !KINDS.includes(node.name)) return;

    node.data = {
      ...node.data,
      hName: 'aside',
      hProperties: {className: `callout callout--${node.name}`}
    };
  });
};

export default remarkCallout;
