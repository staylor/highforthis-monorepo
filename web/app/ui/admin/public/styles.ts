import { css } from 'remix/component';

import { colorTransition, lg, merge, sm, text, type Styles } from '#/ui/public/styles.ts';

/** The admin's text fields and selects, on top of base.css's defaults for them. */
export const input = {
  marginBlock: '0.25rem',
  marginRight: '0.25rem',
  borderRadius: '0.375rem',
  borderColor: 'var(--gray-300)',
  boxShadow: 'var(--shadow-xs)',
  ...colorTransition,
  '&:last-child': { marginRight: 0 },
  '&:focus': {
    borderColor: 'var(--pink)',
    boxShadow: '0 0 0 3px var(--pink-200), var(--shadow-xs)',
  },
} satisfies Styles;

/** A text field the width of its form. */
export const wideInput = css(merge(input, { width: '100%' }));

/** A form's select: smaller than base.css's, with a lighter border. */
export const select = css(
  merge(input, { borderColor: 'var(--neutral-300)', backgroundColor: '#fff', ...text.sm })
);

/** A select in a list's toolbar. */
export const toolbarSelect = merge(input, {
  height: '2.25rem',
  borderColor: 'var(--neutral-300)',
  backgroundColor: '#fff',
  paddingBlock: 0,
  paddingRight: '2.25rem',
  ...text.sm,
});

/** A checkbox in pink. */
export const checkbox = {
  borderRadius: '0.25rem',
  borderColor: 'var(--gray-300)',
  color: 'var(--pink)',
  boxShadow: 'var(--shadow-sm)',
  '&:focus': { boxShadow: '0 0 0 3px var(--pink), var(--shadow-sm)' },
} satisfies Styles;

export const heading1 = {
  fontWeight: 900,
  textTransform: 'uppercase',
  ...text['2xl'],
  [lg]: text['3xl'],
} satisfies Styles;

/** A field's label. */
export const label = css({
  marginBottom: '0.25rem',
  display: 'block',
  ...text.sm,
  letterSpacing: '0.025em',
  color: 'var(--gray-700)',
});

/** A link in pink, underlined. */
export const pinkLink = css({ color: 'var(--pink)', textDecoration: 'underline' });

/** A button, dark for the main action on a page. Merge more styles into it to change it. */
export function button(primary?: boolean) {
  return {
    margin: 0,
    display: 'inline-block',
    boxSizing: 'border-box',
    height: '1.75rem',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    border: '1px solid var(--gray-400)',
    backgroundColor: 'var(--slate-50)',
    padding: '0 0.625rem 1px',
    verticalAlign: 'top',
    textDecoration: 'none',
    ...text.sm,
    lineHeight: '1.5rem',
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-xs)',
    ...colorTransition,
    '&:hover': {
      borderColor: 'var(--gray-600)',
      backgroundColor: 'var(--slate-100)',
      boxShadow: 'var(--shadow-md)',
    },
    '&:active': { translate: '0 1px' },
    ...(primary && {
      borderColor: 'var(--gray-800)',
      backgroundColor: 'var(--gray-800)',
      color: '#fff',
      '&:visited': { color: '#fff' },
      '&:hover': {
        borderColor: '#000',
        backgroundColor: '#000',
        boxShadow: 'var(--shadow-md)',
      },
    }),
  } satisfies Styles;
}

/** The button that saves a form: a little bigger. */
export const saveButton = css(
  merge(button(true), { height: '1.875rem', paddingInline: '0.75rem', lineHeight: '1.75rem' })
);

/** Scrolls a wide table sideways on narrow screens, instead of squeezing its columns. */
export const tableScroller = css({
  marginInline: '-1rem',
  overflowX: 'auto',
  paddingInline: '1rem',
  [sm]: { marginInline: 0, paddingInline: 0 },
});

export const table = css({
  width: '100%',
  minWidth: '40rem',
  tableLayout: 'fixed',
  borderSpacing: 0,
  border: '1px solid var(--detail)',
  boxShadow: 'var(--shadow-sm)',
});

/** A button that's faded and can't be clicked while it's disabled. */
export const disabledFades = {
  '&:disabled': { cursor: 'not-allowed', opacity: 0.5 },
} satisfies Styles;
