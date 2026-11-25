import { css, type Handle, type RemixNode } from 'remix/component';

import type { AppleMusicData } from '#/types/graphql.ts';

import { getApp } from './app-context.tsx';
import { artworkUrl } from './public/media.ts';
import { md, pinkButton } from './public/styles.ts';

// The picture is this wide, in a frame that's narrower on a screen that is
const IMAGE_SIZE = 300;

type AppleMusic = Partial<Pick<AppleMusicData, 'url'>> & {
  artwork?: { url?: string | null } | null;
};

// Square and rounded, and tinted until the picture loads
const frame = css({
  display: 'block',
  flexShrink: 0,
  overflow: 'hidden',
  width: IMAGE_SIZE,
  maxWidth: '100%',
  aspectRatio: '1',
  borderRadius: '0.75rem',
  backgroundColor: 'light-dark(rgb(229 0 130 / 0.08), rgb(229 0 130 / 0.16))',
  boxShadow: 'var(--shadow-lg)',
});

const picture = css({ width: '100%', height: '100%', objectFit: 'cover' });

/** An artist's Apple Music artwork, which links to them there when their link is known. */
function Artwork(handle: Handle<{ name: string; data: AppleMusic }>) {
  return () => {
    const { name, data } = handle.props;
    if (!data.artwork?.url) {
      return null;
    }
    const image = (
      <img
        mix={picture}
        // Twice the size in pixels, for screens with two pixels to a point
        src={artworkUrl(data.artwork.url, IMAGE_SIZE * 2)}
        alt={name}
        width={IMAGE_SIZE}
        height={IMAGE_SIZE}
      />
    );
    return data.url ? (
      <a href={data.url} target="_blank" rel="noreferrer" mix={frame}>
        {image}
      </a>
    ) : (
      <div mix={frame}>{image}</div>
    );
  };
}

/**
 * How an artist's page and a show's open: the artist's picture beside the page's header and what
 * goes with it, or over them on a narrow screen. Without a picture, they have the row.
 */
export function Billing(
  handle: Handle<{ name?: string; data?: AppleMusic | null; children?: RemixNode }>
) {
  return () => {
    const { name, data, children } = handle.props;
    return (
      <div
        mix={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          [md]: { flexDirection: 'row', alignItems: 'center', gap: '2rem' },
        })}
      >
        {name && data && <Artwork name={name} data={data} />}
        <div mix={css({ minWidth: 0 })}>{children}</div>
      </div>
    );
  };
}

const externalLink = css(pinkButton);

/** An artist's links: to their own site, and to them on Apple Music. */
export function ArtistLinks(handle: Handle<{ website?: string | null; data: AppleMusic }>) {
  const { t } = getApp(handle);

  return () => {
    const { website, data } = handle.props;
    const links = [
      { href: website, label: t('artists.website') },
      { href: data.url, label: t('artists.listen') },
    ].filter(({ href }) => href);
    if (links.length === 0) {
      return null;
    }
    return (
      <div mix={css({ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' })}>
        {links.map(({ href, label }) => (
          <a href={href!} target="_blank" rel="noreferrer" mix={externalLink}>
            {label} →
          </a>
        ))}
      </div>
    );
  };
}
