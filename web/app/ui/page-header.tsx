import { css, type Handle, type RemixNode } from 'remix/component';

import { Link } from './link.tsx';
import { displayType, eyebrow, lg, merge, sm, text, type Styles } from './public/styles.ts';

interface PageHeaderProps {
  /** A line over the title: what the page is, or how much it holds */
  eyebrow?: RemixNode;
  /** Where the eyebrow links back to, as a video's does to the videos */
  back?: string;
  title: RemixNode;
  /** In the site's title type, for the pages a section opens with */
  display?: boolean;
  /** A line or two under the title */
  lede?: RemixNode;
  /** The section's other pages, under the title */
  nav?: RemixNode;
  /** What sits beside the title: a menu of years, or tabs */
  children?: RemixNode;
  /** Add to or override the header's own, as the space under it */
  styles?: Styles;
}

// The title and what's beside it share a row, and the section's pages have the row under it. On
// a phone, what was beside the title goes under those pages instead: they're the way around, and
// it's a choice about this page.
const header = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '1rem 2rem',
  marginBottom: '2rem',
} satisfies Styles;

const beside = css({ order: 3, [sm]: { order: 1 } });

const under = css({ order: 2, flex: '1 0 100%', marginTop: '0.5rem' });

const eyebrowStyle = css({
  ...eyebrow,
  marginBottom: '0.5rem',
  '& a': { color: 'inherit' },
  '& a:hover': { textDecoration: 'underline', textUnderlineOffset: '0.25em' },
});

// The headline of a page about one thing: an artist, a post, a video
const plainTitle = css({
  ...text['2xl'],
  fontWeight: 900,
  letterSpacing: '-0.01em',
  textTransform: 'uppercase',
  textWrap: 'balance',
  [lg]: text['3xl'],
});

// As large as fits: a phone's width holds the longest word a title has, and wider screens get
// the size the logo's type was drawn to be read at
const displayTitle = css({
  ...displayType,
  fontSize: 'clamp(1.75rem, 8.5vw, 4rem)',
  textWrap: 'balance',
});

const ledeStyle = css({
  marginTop: '0.75rem',
  maxWidth: '44rem',
  ...text.base,
  lineHeight: 1.625,
  color: 'var(--muted)',
});

/**
 * What every page opens with: its title, the page's one h1, under an eyebrow and over a lede,
 * with room beside it for a control and under it for the section's pages.
 */
export function PageHeader(handle: Handle<PageHeaderProps>) {
  return () => {
    const { eyebrow: over, back, title, display, lede, nav, children, styles } = handle.props;
    return (
      <header mix={css(merge(header, styles))}>
        <div mix={css({ order: 1, minWidth: 0 })}>
          {over && <p mix={eyebrowStyle}>{back ? <Link href={back}>← {over}</Link> : over}</p>}
          <h1 mix={display ? displayTitle : plainTitle}>{title}</h1>
          {lede && <p mix={ledeStyle}>{lede}</p>}
        </div>
        {children && <div mix={beside}>{children}</div>}
        {nav && <div mix={under}>{nav}</div>}
      </header>
    );
  };
}
