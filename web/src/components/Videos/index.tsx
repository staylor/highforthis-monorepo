import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import type { VideoConnection } from '~/types/graphql';

import Button from './Button';
import Video from './Video';

function Videos({ videos }: { videos: VideoConnection }) {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loadNext = (e: SyntheticEvent) => {
    e.preventDefault();

    navigate('?after=' + videos.edges[videos.edges.length - 1].cursor);
  };

  const loadPrevious = (e: SyntheticEvent) => {
    e.preventDefault();

    navigate('?before=' + videos.edges[0].cursor);
  };

  const hasPrevious = videos.pageInfo.hasPreviousPage || searchParams.get('after');
  const hasNext = videos.pageInfo.hasNextPage || searchParams.get('before');

  return (
    <>
      {videos.edges.length === 0 && <p>{t('videos.noFound')}</p>}
      {videos.edges.map((edge) => (
        <Video key={edge.node.id} video={edge.node} />
      ))}
      {hasPrevious && <Button onClick={loadPrevious}>{t('videos.previous')}</Button>}
      {hasNext && <Button onClick={loadNext}>{t('videos.next')}</Button>}
    </>
  );
}

export default Videos;
