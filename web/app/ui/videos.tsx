import { gql } from 'graphql-tag';
import type { Handle } from 'remix/component';

import type { Video_VideoFragment, Videos_VideosFragment } from '../types/graphql.ts';

import { getApp } from './app-context.tsx';
import { TextTitle } from './heading.tsx';
import { Link } from './link.tsx';
import { cn } from './public/cn.ts';
import { VideoThumbnail } from './public/video-thumbnail.tsx';

export const videoFragment = gql`
  fragment Video_video on Video {
    dataId
    id
    slug
    thumbnails {
      height
      url
      width
    }
    title
  }
`;

export const videosFragment = gql`
  fragment Videos_videos on Query {
    videos(after: $after, before: $before, first: $first, last: $last, year: $year)
      @cache(key: $cacheKey) {
      count
      edges {
        cursor
        node {
          ...Video_video
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${videoFragment}
`;

const findThumb = (thumbs: Video_VideoFragment['thumbnails']) => {
  for (const size of [640, 480, 320]) {
    const thumb = thumbs.find((t) => t.width === size);
    if (thumb) {
      return thumb;
    }
  }
  return undefined;
};

export function Video(
  handle: Handle<{ video: Video_VideoFragment; single?: boolean; embed?: boolean }>
) {
  return () => {
    const { video, single = false, embed = false } = handle.props;
    if (!video) {
      return null;
    }
    const href = `/video/${video.slug}`;
    const thumbnail = (
      <VideoThumbnail
        href={href}
        dataId={video.dataId}
        title={video.title}
        thumbUrl={findThumb(video.thumbnails)?.url}
        class={embed ? 'm-0' : 'mb-3'}
      />
    );

    if (embed) {
      return (
        <>
          {thumbnail}
          <h3 class="mb-6 text-base">
            {single ? video.title : <Link href={href}>{video.title}</Link>}
          </h3>
        </>
      );
    }

    return (
      <article class="group">
        {thumbnail}
        {single ? (
          <TextTitle>{video.title}</TextTitle>
        ) : (
          <h1 class="text-base leading-snug font-semibold transition-colors group-hover:text-pink">
            <Link href={href}>{video.title}</Link>
          </h1>
        )}
      </article>
    );
  };
}

/**
 * A grid of videos. Previous/next are plain links, which work without JavaScript and are
 * intercepted for client navigation with it.
 */
export function Videos(
  handle: Handle<{
    videos: NonNullable<Videos_VideosFragment['videos']>;
    paginate?: boolean;
    search?: URLSearchParams;
  }>
) {
  const { t } = getApp(handle);

  return () => {
    const { videos, paginate = true, search } = handle.props;
    const hasPrevious = videos.pageInfo.hasPreviousPage || search?.get('after');
    const hasNext = videos.pageInfo.hasNextPage || search?.get('before');
    const buttonBase =
      'rounded-lg border px-5 py-2.5 text-sm font-medium transition-all cursor-pointer';

    return (
      <>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.edges.length === 0 && <p>{t('videos.noFound')}</p>}
          {videos.edges.map((edge) => (
            <Video key={edge.node.id} video={edge.node} />
          ))}
        </div>
        {paginate && (hasPrevious || hasNext) && (
          <div class="mt-10 flex justify-center gap-3">
            {hasPrevious && (
              <Link
                href={`?before=${videos.edges[0].cursor}`}
                class={cn(
                  buttonBase,
                  'text-muted border-neutral-200 bg-white shadow-sm',
                  'hover:border-pink/30 hover:text-neutral-900',
                  'dark:bg-surface-dark-card dark:text-muted-dark dark:border-white/10',
                  'dark:hover:border-pink/30 dark:hover:text-white'
                )}
              >
                ← {t('videos.previous')}
              </Link>
            )}
            {hasNext && (
              <Link
                href={`?after=${videos.edges[videos.edges.length - 1].cursor}`}
                class={cn(
                  buttonBase,
                  'border-pink/20 bg-pink/5 text-pink',
                  'hover:bg-pink/10',
                  'dark:border-pink/30 dark:bg-pink/10',
                  'dark:hover:bg-pink/20'
                )}
              >
                {t('videos.next')} →
              </Link>
            )}
          </div>
        )}
      </>
    );
  };
}
