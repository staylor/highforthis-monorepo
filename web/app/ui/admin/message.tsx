import { css, type Handle } from 'remix/component';

import { colorTransition, text } from '#/ui/public/styles.ts';

import { getAdmin } from './context.tsx';
import { Icon } from './public/icon.tsx';

interface MessageProps {
  text: string;
  /** The query parameter that shows the message, such as `deleted` for `?deleted=2`. */
  param?: string;
  /** Keeps it from showing, as when the save after the one it reports has failed. */
  hidden?: boolean;
}

/**
 * A notice for the query parameter a save or delete redirected with, such as `?message=updated`.
 * Its close button links to the same page without the parameter, so it works without JavaScript.
 * It renders an empty element when it has nothing to say, so what follows it on the page, such as
 * a form, is the same element with or without the notice, and keeps what was typed into it.
 */
export function Message(handle: Handle<MessageProps>) {
  return () => {
    const { url } = getAdmin(handle);
    const param = handle.props.param ?? 'message';
    if (handle.props.hidden || !url.searchParams.has(param)) {
      return <div />;
    }
    const dismissed = new URL(url);
    dismissed.searchParams.delete(param);

    return (
      <div>
        <div
          mix={css({
            position: 'relative',
            marginBlock: '0.25rem 1rem',
            display: 'block',
            borderLeft: '4px solid var(--pink)',
            backgroundColor: 'var(--neutral-50)',
            padding: '1px 2.25rem 1px 0.75rem',
            boxShadow: 'var(--shadow-xs)',
          })}
        >
          <p
            mix={css({
              marginBlock: '0.5rem',
              padding: '0.125rem',
              ...text.sm,
              color: 'var(--dark)',
            })}
          >
            {handle.props.text}
          </p>
          <a
            href={`${dismissed.pathname}${dismissed.search}`}
            aria-label="Dismiss"
            mix={css({
              position: 'absolute',
              top: 0,
              right: '0.25rem',
              margin: 0,
              padding: '0.5rem',
              color: 'var(--neutral-400)',
              ...colorTransition,
              '&:hover': { color: 'var(--neutral-900)' },
            })}
          >
            <Icon name="close" size="1rem" />
          </a>
        </div>
      </div>
    );
  };
}
