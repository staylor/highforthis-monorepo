import cn from 'classnames';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';

import type { VideoConnection } from '#/types/graphql';

import Video from './Video';

function Videos({ videos, paginate = true }: { videos: VideoConnection; paginate?: boolean }) {
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

  const buttonBase = cn(
    'rounded-lg border px-5 py-2.5 text-sm font-medium transition-all',
    'cursor-pointer'
  );

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.edges.length === 0 && <p>{t('videos.noFound')}</p>}
        {videos.edges.map((edge) => (
          <Video key={edge.node.id} video={edge.node} />
        ))}
      </div>
      {paginate && (hasPrevious || hasNext) && (
        <div className="mt-10 flex justify-center gap-3">
          {hasPrevious && (
            <button
              className={cn(
                buttonBase,
                'text-muted border-neutral-200 bg-white shadow-sm',
                'hover:border-pink/30 hover:text-neutral-900',
                'dark:bg-surface-dark-card dark:text-muted-dark dark:border-white/10',
                'dark:hover:border-pink/30 dark:hover:text-white'
              )}
              type="button"
              onClick={loadPrevious}
            >
              ← {t('videos.previous')}
            </button>
          )}
          {hasNext && (
            <button
              className={cn(
                buttonBase,
                'border-pink/20 bg-pink/5 text-pink',
                'hover:bg-pink/10',
                'dark:border-pink/30 dark:bg-pink/10',
                'dark:hover:bg-pink/20'
              )}
              type="button"
              onClick={loadNext}
            >
              {t('videos.next')} →
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default Videos;
