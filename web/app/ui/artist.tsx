import { css, type Handle, type RemixNode } from 'remix/component';

import type { AppleMusicData } from '#/types/graphql.ts';

import { getApp } from './app-context.tsx';
import { md, merge, pinkButton, text, type Styles } from './public/styles.ts';

const DEFAULT_IMAGE_SIZE = 300;

type AppleMusic = Partial<Pick<AppleMusicData, 'url'>> & {
  artwork?: { url?: string | null } | null;
};

/** An artist's Apple Music artwork. `styles` go on the link around it, or the image if none. */
export function Artwork(
  handle: Handle<{
    name: string;
    imageSize?: number;
    data: AppleMusic;
    styles?: Styles;
  }>
) {
  return () => {
    const { name, imageSize = DEFAULT_IMAGE_SIZE, data, styles } = handle.props;
    const { url, artwork } = data;
    if (!artwork?.url) {
      return null;
    }
    const image = (
      <img
        mix={css(merge({ display: 'block' }, !url ? styles : undefined))}
        src={artwork.url.replace(/\{[wh]\}/g, String(imageSize))}
        alt={name}
        width={imageSize}
        height={imageSize}
        loading="lazy"
      />
    );
    if (!url) {
      return image;
    }
    return (
      <a
        href={url}
        mix={css(
          merge(
            {
              display: 'block',
              marginBottom: '1rem',
              [md]: { marginRight: '2rem', marginBottom: 0 },
            },
            styles
          )
        )}
        style={{ width: imageSize, height: imageSize }}
        target="_blank"
        rel="noreferrer"
      >
        {image}
      </a>
    );
  };
}

function ArtistLink(url: string, children: RemixNode) {
  return (
    <a
      href={url}
      mix={css({
        marginRight: '0.75rem',
        display: 'inline-block',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        ...text.sm,
        fontWeight: 500,
        transition: 'all 150ms var(--ease)',
        ...pinkButton,
      })}
      target="_blank"
      rel="noreferrer"
    >
      {children} →
    </a>
  );
}

/** An artist's links and details. */
export function Metadata(
  handle: Handle<{ name: string; website?: string | null; data: AppleMusic }>
) {
  const { t } = getApp(handle);

  return () => {
    const { name, website, data } = handle.props;
    return (
      <div
        mix={css({
          marginBlock: '1rem 2rem',
          alignItems: 'center',
          [md]: { display: 'flex', marginBlock: '1.5rem 2.5rem' },
        })}
      >
        <Artwork name={name} data={data} styles={{ borderRadius: '0.5rem' }} />
        <div
          mix={css({
            marginTop: '0.75rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            [md]: { marginTop: 0 },
          })}
        >
          {website && ArtistLink(website, t('artists.website'))}
          {data.url && ArtistLink(data.url, t('artists.listen'))}
        </div>
      </div>
    );
  };
}
