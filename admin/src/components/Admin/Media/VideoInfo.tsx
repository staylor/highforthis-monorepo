import type { VideoUpload } from '@highforthis/shared/web/types/graphql';
import { Trans, useTranslation } from 'react-i18next';

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
