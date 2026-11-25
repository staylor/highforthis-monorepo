import { css, type Handle } from 'remix/component';

import { artworkUrl } from '#/ui/public/media.ts';

import { initials } from './utils.ts';

/** What a show needs for its main artist's picture */
interface HeadlinerShow {
  title?: string | null;
  artists: ReadonlyArray<{
    name: string;
    appleMusic?: { artwork?: { url?: string | null } | null } | null;
  }>;
  venue?: { name: string };
}

const pinkTint = 'light-dark(rgb(229 0 130 / 0.08), rgb(229 0 130 / 0.16))';

// Round, like an artist's on Apple Music, and tinted until it loads
const art = css({
  flexShrink: 0,
  borderRadius: '9999px',
  objectFit: 'cover',
  backgroundColor: pinkTint,
  boxShadow: 'var(--shadow-sm)',
});

// For a main artist without artwork: their initials, as the show stats have for theirs
const monogram = css({
  flexShrink: 0,
  display: 'grid',
  placeItems: 'center',
  borderRadius: '9999px',
  backgroundColor: pinkTint,
  fontWeight: 800,
  color: 'var(--pink)',
});

// A card's beside the date and the names, or a row's beside a line or two of text
const sizes = {
  md: css({ width: '3rem', height: '3rem', fontSize: '0.75rem', lineHeight: 1 }),
  sm: css({ width: '2rem', height: '2rem', fontSize: '0.625rem', lineHeight: 1 }),
};

// Twice the size in pixels, for screens with two pixels to a point
const pixels = { md: 96, sm: 64 };

/** A show's main artist, its first: their Apple Music artwork, or their initials without it. */
export function Headliner(handle: Handle<{ show: HeadlinerShow; size?: keyof typeof sizes }>) {
  return () => {
    const { show, size = 'md' } = handle.props;
    const [headliner] = show.artists;
    const artwork = headliner?.appleMusic?.artwork?.url;
    if (artwork) {
      return (
        <img
          mix={[art, sizes[size]]}
          src={artworkUrl(artwork, pixels[size])}
          alt=""
          width={pixels[size]}
          height={pixels[size]}
          loading="lazy"
        />
      );
    }
    return (
      <span mix={[monogram, sizes[size]]} aria-hidden="true">
        {initials(headliner?.name || show.title || show.venue?.name || '')}
      </span>
    );
  };
}
