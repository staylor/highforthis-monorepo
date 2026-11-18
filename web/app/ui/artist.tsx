import type { Handle, RemixNode } from 'remix/component';

import type { AppleMusicData } from '../types/graphql.ts';

import { getApp } from './app-context.tsx';
import { cn } from './public/cn.ts';

const DEFAULT_IMAGE_SIZE = 300;

type AppleMusic = Partial<Pick<AppleMusicData, 'url'>> & {
  artwork?: { url?: string | null } | null;
};

/** An artist's Apple Music artwork. */
export function Artwork(
  handle: Handle<{ name: string; imageSize?: number; data: AppleMusic; class?: string }>
) {
  return () => {
    const { name, imageSize = DEFAULT_IMAGE_SIZE, data, class: className } = handle.props;
    const { url, artwork } = data;
    if (!artwork?.url) {
      return null;
    }
    const image = (
      <img
        class={cn('block', !url && className)}
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
        class={cn('mb-4 block md:mr-8 md:mb-0', className)}
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
      class={cn(
        'mr-3 inline-block rounded-lg px-4 py-2 text-sm font-medium transition-all',
        'border-pink/20 bg-pink/5 text-pink border',
        'hover:bg-pink/10',
        'dark:border-pink/30 dark:bg-pink/10 dark:hover:bg-pink/20'
      )}
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
      <div class="mt-4 mb-8 items-center md:mt-6 md:mb-10 md:flex">
        <Artwork name={name} data={data} class="rounded-lg" />
        <div class="mt-3 flex flex-wrap gap-2 md:mt-0">
          {website && ArtistLink(website, t('artists.website'))}
          {data.url && ArtistLink(data.url, t('artists.listen'))}
        </div>
      </div>
    );
  };
}
