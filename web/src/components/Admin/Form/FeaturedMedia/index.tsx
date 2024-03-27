import type { SyntheticEvent } from 'react';
import { useState } from 'react';
import { gql } from 'graphql-tag';

import MediaModal from '@/components/Admin/Modals/Media';
import Button from '@/components/Button';
import { uploadUrl } from '@/utils/media';
import type { AudioUpload, ImageUpload, MediaUpload } from '@/types/graphql';
import type { SelectedImage } from '@/types/admin';

type SelectedMedia = ImageUpload | AudioUpload | MediaUpload | SelectedImage;

interface MediaProps {
  buttonText?: string;
  className?: string;
  media: SelectedMedia[];
  type?: 'image' | 'audio';
}

function FeaturedMedia({ className, type, media, buttonText = 'Set Featured Media' }: MediaProps) {
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<SelectedMedia[]>([]);

  const onClose = () => setModal(false);

  const onClick = (e: SyntheticEvent) => {
    e.preventDefault();
    setModal(true);
  };

  const selectImage = (data: SelectedImage) => {
    setSelected([data]);
  };

  const selectAudio = (data: AudioUpload) => {
    setSelected([data]);
  };

  let featured: SelectedMedia[] = [];
  if (selected.length) {
    featured = selected;
  } else if (media) {
    featured = media;
  }

  const filtered = featured.filter(Boolean);

  return (
    <div className={className}>
      {modal && (
        <MediaModal
          type={type}
          selectAudio={selectAudio}
          selectImage={selectImage}
          onClose={onClose}
        />
      )}
      {filtered.map((data: SelectedMedia) => {
        const id = (data as SelectedImage).imageId
          ? (data as SelectedImage).imageId
          : (data as MediaUpload).id;
        return (
          // if multiple items are present, an array will be submitted
          // even if, and because, the same name is used multiple times
          <input key={id} type="hidden" name={type || 'featuredMedia'} defaultValue={id} />
        );
      })}
      {filtered.map((upload: SelectedMedia) => {
        if (type === 'audio') {
          const audio = upload as AudioUpload;
          return (
            <figure key={audio.id} className="my-4">
              <audio controls src={uploadUrl(audio.destination, audio.fileName)} />
            </figure>
          );
        }

        let image = selected.length ? (upload as SelectedImage).image : (upload as ImageUpload);
        const crop = image.crops.find((c) => c.width === 300);
        if (crop) {
          return (
            <img
              className="mb-2.5 mr-2.5"
              key={crop.fileName}
              alt=""
              src={uploadUrl(image.destination, crop.fileName)}
            />
          );
        }

        const noMatch = upload as MediaUpload;
        return <p key={noMatch.id}>{noMatch.id}</p>;
      })}
      <Button onClick={onClick}>{buttonText}</Button>
    </div>
  );
}

FeaturedMedia.fragments = {
  media: gql`
    fragment FeaturedMedia_media on MediaUpload {
      destination
      fileName
      id
      type
      ... on ImageUpload {
        crops {
          fileName
          width
        }
      }
    }
  `,
};

export default FeaturedMedia;
