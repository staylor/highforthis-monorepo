import type { ImageUpload, ImageUploadCrop } from '@/types/graphql';
import { uploadUrl } from '@/utils/media';

interface FeaturedMediaProps {
  featuredMedia: ImageUpload[];
  alt?: string;
  cropSize?: number;
  className?: string;
}

function FeaturedMedia({ featuredMedia, alt = '', cropSize = 640, className }: FeaturedMediaProps) {
  if (!featuredMedia) {
    return null;
  }

  return (
    <>
      {featuredMedia.filter(Boolean).map((media) => {
        const crop = media.crops.find((c) => c.width === cropSize) as ImageUploadCrop;
        return (
          <img
            key={crop.fileName}
            className={className || 'mb-4'}
            alt={alt}
            loading="lazy"
            src={uploadUrl(media.destination, crop.fileName)}
          />
        );
      })}
    </>
  );
}

export default FeaturedMedia;
