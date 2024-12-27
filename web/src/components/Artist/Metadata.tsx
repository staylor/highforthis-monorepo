import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import type { AppleMusicData } from '~/types/graphql';

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
      className="text-pink mb-2 block text-lg underline"
      target="_blank"
      rel="noreferrer"
    >
      {children} &rarr;
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
    <div className="mb-8 mt-4 md:mb-12 md:mt-8 md:flex">
      {image}
      <div className="md:mt-4">
        {site}
        {listen}
      </div>
    </div>
  );
}
