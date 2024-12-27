import { filesize } from 'filesize';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import type { ImageUpload } from '~/types/graphql';
import { uploadUrl } from '~/utils/media';

export default function ImageInfo({ media }: { media: ImageUpload }) {
  const { t } = useTranslation();
  return (
    <>
      <p>
        <strong>{t('image.fileType')}:</strong> {media.mimeType}
      </p>
      <strong>{t('image.availableCrops')}:</strong>
      <br />
      <a href={uploadUrl(media.destination, media.fileName)}>
        {media.width}
        {' x '}
        {media.height}
      </a>{' '}
      - {filesize(media.fileSize)} - {t('image.original')}
      <div>
        {media.crops.map((crop) => (
          <Fragment key={crop.fileName}>
            <>
              <br />
              <a href={uploadUrl(media.destination, crop.fileName)}>
                {crop.width}
                {' x '}
                {crop.height}
              </a>{' '}
              - {filesize(crop.fileSize)}
            </>
          </Fragment>
        ))}
      </div>
    </>
  );
}
