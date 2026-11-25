import { css, type Handle, type RemixNode } from 'remix/component';

import { lg, merge, text, type Styles } from './public/styles.ts';

// The headings inside a post, as its editor sets them. A page's own title is its PageHeader.

type HeadingProps = { children?: RemixNode };

const heading = {
  display: 'block',
  marginBottom: '0.5rem',
  [lg]: { marginBottom: '0.75rem' },
} satisfies Styles;

// The largest has a pink bar down its left
const heading1 = merge(heading, {
  borderLeft: '8px solid var(--pink)',
  paddingBlock: '0.5rem',
  paddingLeft: '0.625rem',
  fontWeight: 900,
  textTransform: 'uppercase',
  ...text['2xl'],
  [lg]: text['3xl'],
});

const heading2 = merge(heading, { fontWeight: 700, ...text['2xl'] });

const heading3 = merge(heading, {
  display: 'inline-block',
  marginTop: '1.5rem',
  borderBottom: '2px dashed var(--pink)',
  padding: '0.25rem 1.5rem 0.25rem 0.125rem',
  fontWeight: 700,
  ...text['2xl'],
});

const heading4 = merge(heading, { fontWeight: 700, ...text.lg });

export function Heading1(handle: Handle<HeadingProps>) {
  return () => <h1 mix={css(heading1)}>{handle.props.children}</h1>;
}

export function Heading2(handle: Handle<HeadingProps>) {
  return () => <h2 mix={css(heading2)}>{handle.props.children}</h2>;
}

export function Heading3(handle: Handle<HeadingProps>) {
  return () => <h3 mix={css(heading3)}>{handle.props.children}</h3>;
}

export function Heading4(handle: Handle<HeadingProps>) {
  return () => <h4 mix={css(heading4)}>{handle.props.children}</h4>;
}
