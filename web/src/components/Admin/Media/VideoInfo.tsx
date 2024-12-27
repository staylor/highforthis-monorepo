import { Trans, useTranslation } from 'react-i18next';

import type { VideoUpload } from '~/types/graphql';

export default function VideoInfo({ media }: { media: VideoUpload }) {
  const { t } = useTranslation();
  return (
    <>
      {media.duration && (
        <>
          <Trans
            i18nKey="videos.duration"
            values={{ minutes: ~~(media.duration / 60), seconds: Math.floor(media.duration % 60) }}
          />
          <br />
        </>
      )}
      <strong>{t('videos.dimensions')}:</strong> {media.width}
      {' x '}
      {media.height}
    </>
  );
}
