import { css, type Handle, type RemixNode } from 'remix/component';

import { displayType, text } from './public/styles.ts';

/**
 * What the 404 and error pages show: the status, huge, in the site's title type, over the
 * message and the ways out of the page, which are its children.
 */
export function ErrorScreen(
  handle: Handle<{ status: number; message: string; children?: RemixNode }>
) {
  return () => (
    <section mix={css({ paddingBlock: '2rem', textAlign: 'center' })}>
      <p
        aria-hidden="true"
        mix={css({
          ...displayType,
          fontSize: 'clamp(6rem, 32vw, 14rem)',
          color: 'var(--pink)',
        })}
      >
        {handle.props.status}
      </p>
      <h1
        mix={css({
          marginTop: '1rem',
          ...text['2xl'],
          fontWeight: 900,
          textTransform: 'uppercase',
          textWrap: 'balance',
        })}
      >
        {handle.props.message}
      </h1>
      <div
        mix={css({
          marginTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.75rem',
        })}
      >
        {handle.props.children}
      </div>
    </section>
  );
}
