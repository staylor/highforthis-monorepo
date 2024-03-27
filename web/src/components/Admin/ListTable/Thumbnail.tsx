import type { AudioUpload, ImageUpload, ImageUploadCrop, MediaUpload } from '@/types/graphql';
import { uploadUrl } from '@/utils/media';

interface ThumbnailProps {
  media: MediaUpload;
}

const Thumbnail = ({ media }: ThumbnailProps) => {
  const crops =
    media.type === 'audio' ? (media as AudioUpload).images : (media as ImageUpload).crops;
  if (!crops || crops.length === 0) {
    return null;
  }
  const sorted = [...crops] as ImageUploadCrop[];
  sorted.sort((a, b) => a.width - b.width);
  return <img className="w-16" src={uploadUrl(media.destination, sorted[0].fileName)} alt="" />;
};

export default Thumbnail;
