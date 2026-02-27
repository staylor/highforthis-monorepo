import type { ImageUploadCrop } from '~/types/graphql';

type SelectedImageCrop = Pick<ImageUploadCrop, 'width' | 'fileName'>;

export interface SelectedImageData {
  id: string;
  destination: string;
  crops: SelectedImageCrop[];
}

export interface SelectedImage {
  imageId: string;
  image: SelectedImageData;
  size: string;
}
