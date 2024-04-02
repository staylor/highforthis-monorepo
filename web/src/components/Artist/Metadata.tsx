import type { PropsWithChildren } from 'react';

import type { AppleMusicData } from '@/types/graphql';
import Image from '@/components/Image';

interface AppleMusicProps {
  name: string;
  website?: string;
  imageSize?: number;
  data: AppleMusicData;
}

const DEFAULT_IMAGE_SIZE = 300;

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
  const { url, artwork } = data;

  let site;
  let listen;
  let image;
  if (website) {
    site = <ArtistLink url={website}>Artist Website</ArtistLink>;
  }
  if (url) {
    listen = <ArtistLink url={url}>Listen on Apple Music</ArtistLink>;
  }
  if (artwork?.url) {
    image = (
      <Image
        className="block rounded-lg"
        src={artwork.url?.replace(/\{[wh]\}/g, String(imageSize))}
        alt={name}
        width={imageSize}
        height={imageSize}
      />
    );

    if (url) {
      image = (
        <a
          href={url}
          className="mb-4 block rounded-lg md:mb-0 md:mr-8"
          style={{ width: imageSize, height: imageSize }}
          target="_blank"
          rel="noreferrer"
        >
          {image}
        </a>
      );
    }
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
