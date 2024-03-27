import type { ImageUpload } from '@/types/graphql';
import { uploadUrl } from '@/utils/media';

const cropMap = {
  FEATURE: 640,
  MEDIUM: 300,
  THUMB: 150,
} as any;

interface ImageProps {
  image: ImageUpload;
  size: string;
}

function Image({ image, size }: ImageProps) {
  if (!image) {
    return null;
  }

  // this logic is insufficient, it assumes all images are at least 640px,
  // else it goes down to the next size, which is probably too small
  // probably want to use the original size, but that might be too big
  let crop = image.crops.find((c) => c.width === cropMap[size]);
  if (!crop) {
    [crop] = image.crops;
  }

  return <img className="my-2.5" alt="" src={uploadUrl(image.destination, crop.fileName)} />;
}

export default Image;
