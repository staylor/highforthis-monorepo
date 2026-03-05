import cn from 'classnames';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppleMusicData } from '#/types/graphql';

import Artwork, { DEFAULT_IMAGE_SIZE } from './Artwork';

interface AppleMusicProps {
  name: string;
  website?: string;
  imageSize?: number;
  data: AppleMusicData;
}

function ArtistLink({ url, children }: PropsWithChildren<{ url: string }>) {
  return (
    <a
      href={url}
      className={cn(
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

export default function Metadata({
  name,
  website,
  imageSize = DEFAULT_IMAGE_SIZE,
  data,
}: AppleMusicProps) {
  const { t } = useTranslation();
  const { url } = data;

  let site;
  let listen;
  const image = <Artwork name={name} imageSize={imageSize} data={data} className="rounded-lg" />;
  if (website) {
    site = <ArtistLink url={website}>{t('artists.website')}</ArtistLink>;
  }
  if (url) {
    listen = <ArtistLink url={url}>{t('artists.listen')}</ArtistLink>;
  }

  if (!(image || listen || site)) {
    return null;
  }

  return (
    <div className="mt-4 mb-8 items-center md:mt-6 md:mb-10 md:flex">
      {image}
      <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
        {site}
        {listen}
      </div>
    </div>
  );
}
