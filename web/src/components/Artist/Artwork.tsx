import type { AppleMusicData } from '@/types/graphql';
import Image from '@/components/Image';

interface ArtworkProps {
  name: string;
  imageSize?: number;
  data: AppleMusicData;
}

export const DEFAULT_IMAGE_SIZE = 300;

export default function Artwork({ name, imageSize = DEFAULT_IMAGE_SIZE, data }: ArtworkProps) {
  const { url, artwork } = data;
  if (!artwork?.url) {
    return null;
  }

  let image = (
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

  return image;
}
