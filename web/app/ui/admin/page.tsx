import { css, type Handle, type RemixNode } from 'remix/component';

import { merge, text } from '#/ui/public/styles.ts';

import { button, heading1 } from './public/styles.ts';

export function Heading(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <h1
      mix={css({
        marginRight: '1rem',
        marginBottom: '1rem',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...heading1,
      })}
    >
      {handle.props.children}
    </h1>
  );
}

export function HeaderAdd(handle: Handle<{ href: string; label: string }>) {
  return () => (
    <a href={handle.props.href} mix={css(merge(button(), { marginBottom: '1rem' }))}>
      {handle.props.label}
    </a>
  );
}

export function Alert(handle: Handle<{ children?: RemixNode }>) {
  return () => (
    <div
      role="alert"
      mix={css({
        marginBottom: '1.25rem',
        maxWidth: '42rem',
        borderLeft: '4px solid var(--red-600)',
        backgroundColor: 'var(--red-50)',
        padding: '0.75rem 1rem',
        ...text.sm,
        color: 'var(--red-900)',
      })}
    >
      {handle.props.children}
    </div>
  );
}
