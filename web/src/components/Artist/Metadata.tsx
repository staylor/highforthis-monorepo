import type { PropsWithChildren } from 'react';

import type { AppleMusicData } from '@/types/graphql';

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
      className="mb-2 block text-lg text-pink underline"
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
  const { url } = data;

  let site;
  let listen;
  let image = <Artwork name={name} imageSize={imageSize} data={data} />;
  if (website) {
    site = <ArtistLink url={website}>Artist Website</ArtistLink>;
  }
  if (url) {
    listen = <ArtistLink url={url}>Listen on Apple Music</ArtistLink>;
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
