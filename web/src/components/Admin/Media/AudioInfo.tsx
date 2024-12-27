import { filesize } from 'filesize';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import type { AudioUpload, ImageUploadCrop } from '~/types/graphql';
import { uploadUrl } from '~/utils/media';

export default function AudioInfo({ media }: { media: AudioUpload }) {
  const { t } = useTranslation();
  const crops = [...(media.images || [])].filter(Boolean) as ImageUploadCrop[];
  let cropInfo = null;
  if (crops.length > 0) {
    crops.sort((a, b) => a.width - b.width);
    const first = crops.shift() as ImageUploadCrop;
    const src = uploadUrl(media.destination, first.fileName);
    cropInfo = (
      <>
        <img className="my-2.5" src={src} alt="" />
        <strong>
          {t('audio.showing')}:
          <br />
        </strong>{' '}
        {first.width}
        {' x '}
        {first.height}
      </>
    );
  }

  const mediaInfo = (
    <>
      <strong>{t('audio.fileSize')}:</strong> {filesize(media.fileSize)}
      <br />
      <strong>{t('audio.fileType')}:</strong> {media.mimeType}
      {cropInfo}
    </>
  );

  return crops.length > 0 ? (
    <>
      {mediaInfo}
      <br />
      <strong>{t('audio.otherCrops')}:</strong>
      {crops.map((crop) => (
        <Fragment key={crop.fileName}>
          <br />
          <a href={uploadUrl(media.destination, crop.fileName)}>
            {crop.width}
            {' x '}
            {crop.height}
          </a>{' '}
        </Fragment>
      ))}
    </>
  ) : (
    mediaInfo
  );
}
