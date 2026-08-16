import {Fragment} from 'react';

/**
 * The widget copy lives in `loan.ts` as plain data, so it cannot carry JSX. This
 * renders the two bits of markup that copy actually needs: `**bold**` and
 * `` `code` ``. Anything more and the notes should become components.
 */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`)/g;

export const RichText = ({children}: {children: string}) => (
  <>
    {children.split(TOKEN).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code className="pw-code" key={i}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return <Fragment key={i}>{part}</Fragment>;
    })}
  </>
);
