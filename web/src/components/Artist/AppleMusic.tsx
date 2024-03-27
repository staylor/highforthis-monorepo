import type { AppleMusicData } from '@/types/graphql';
import Image from '@/components/Image';

interface AppleMusicProps {
  name: string;
  imageSize?: number;
  data: AppleMusicData;
}

const DEFAULT_IMAGE_SIZE = 300;

export default function AppleMusic({
  name,
  imageSize = DEFAULT_IMAGE_SIZE,
  data,
}: AppleMusicProps) {
  const { url, artwork } = data;

  let listen;
  let image;
  if (url) {
    listen = (
      <a href={url} className="text-lg underline md:mt-4" target="_blank" rel="noreferrer">
        Listen on Apple Music &raquo;
      </a>
    );
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

  if (!(image || listen)) {
    return null;
  }

  return (
    <div className="mb-8 mt-4 md:mb-12 md:mt-8 md:flex">
      {image}
      {listen}
    </div>
  );
}
