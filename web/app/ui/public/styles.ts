import { css } from 'remix/component';

/** The style objects css() takes. */
export type Styles = Parameters<typeof css>[0];

// Breakpoints, as keys in a style object: `[md]: { … }`
export const xs = '@media (width >= 320px)';
export const sm = '@media (width >= 40rem)';
export const md = '@media (width >= 48rem)';
export const lg = '@media (width >= 64rem)';
export const xl = '@media (width >= 80rem)';

/** Dark mode, for what light-dark() can't express: the `dark` class on <html>. */
export const dark = ':where(.dark) &';

/** While a link around the element is hovered, as in cards that are links. */
export const linkHover = ':where(a:hover) &';

function isStyles(value: unknown): value is Styles {
  return typeof value === 'object' && value !== null;
}

/**
 * Merges style objects, later ones winning, with nested rules merged rather than replaced, so
 * one css() call holds them all. (When two css() styles on an element set the same property,
 * which one wins depends on which the page inserted first.)
 */
export function merge(...styles: Array<Styles | undefined>): Styles {
  const merged: Styles = {};
  for (const style of styles) {
    for (const [key, value] of Object.entries(style ?? {})) {
      const current = merged[key];
      merged[key] = isStyles(value) && isStyles(current) ? merge(current, value) : value;
    }
  }
  return merged;
}

/** Font sizes, each with its line height. */
export const text = {
  xs: { fontSize: '0.75rem', lineHeight: 'calc(1 / 0.75)' },
  sm: { fontSize: '0.875rem', lineHeight: 'calc(1.25 / 0.875)' },
  base: { fontSize: '1rem', lineHeight: 1.5 },
  lg: { fontSize: '1.125rem', lineHeight: 'calc(1.75 / 1.125)' },
  xl: { fontSize: '1.25rem', lineHeight: 'calc(1.75 / 1.25)' },
  '2xl': { fontSize: '1.5rem', lineHeight: 'calc(2 / 1.5)' },
  '3xl': { fontSize: '1.875rem', lineHeight: 1.2 },
  '4xl': { fontSize: '2.25rem', lineHeight: 'calc(2.5 / 2.25)' },
} satisfies Record<string, Styles>;

/** Eases changes of color, background and border. */
export const colorTransition = {
  transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  transitionTimingFunction: 'var(--ease)',
  transitionDuration: '150ms',
} satisfies Styles;

/** Cuts text off after a number of lines, with an ellipsis. */
export function lineClamp(lines: number) {
  return {
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: lines,
  } satisfies Styles;
}

/** A card that rises and glows pink when hovered. */
export const card = {
  border: '1px solid var(--card-border)',
  backgroundColor: 'var(--card)',
  boxShadow: 'var(--shadow-sm)',
  transition: 'all 300ms var(--ease)',
  '&:hover': {
    translate: '0 -0.125rem',
    boxShadow: '0 10px 15px -3px var(--lift), 0 4px 6px -4px var(--lift)',
  },
} satisfies Styles;

/** The colors of a pink outlined button. */
export const pinkButton = {
  border: '1px solid light-dark(rgb(229 0 130 / 0.2), rgb(229 0 130 / 0.3))',
  backgroundColor: 'light-dark(rgb(229 0 130 / 0.05), rgb(229 0 130 / 0.1))',
  color: 'var(--pink)',
  '&:hover': {
    backgroundColor: 'light-dark(rgb(229 0 130 / 0.1), rgb(229 0 130 / 0.2))',
  },
} satisfies Styles;

/** Hidden, except from screen readers: the styles, to use under a breakpoint or a selector. */
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
} satisfies Styles;

/** Hidden, except from screen readers. */
export const srOnly = css(visuallyHidden);
