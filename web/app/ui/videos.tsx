import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { Video_VideoFragment, Videos_VideosFragment } from '#/types/graphql.ts';

import { getApp } from './app-context.tsx';
import { TextTitle } from './heading.tsx';
import { Link } from './link.tsx';
import { lg, merge, pinkButton, sm, text } from './public/styles.ts';
import { VideoThumbnail } from './public/video-thumbnail.tsx';

export const videoFragment = gql`
  fragment Video_video on Video {
    id
    dataId
    slug
    title
    thumbnails {
      height
      url
      width
    }
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
  handle: Handle<{
    video: Video_VideoFragment;
    single?: boolean;
    embed?: boolean;
  }>
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
        embedded={embed}
      />
    );

    if (embed) {
      return (
        <>
          {thumbnail}
          <h3 mix={css({ marginBottom: '1.5rem', ...text.base })}>
            {single ? video.title : <Link href={href}>{video.title}</Link>}
          </h3>
        </>
      );
    }

    return (
      <article>
        {thumbnail}
        {single ? (
          <TextTitle>{video.title}</TextTitle>
        ) : (
          <h1 mix={css({ fontSize: '1rem', lineHeight: 1.375, fontWeight: 600 })}>
            <Link href={href}>{video.title}</Link>
          </h1>
        )}
      </article>
    );
  };
}

const pageButton = {
  borderRadius: '0.5rem',
  padding: '0.625rem 1.25rem',
  ...text.sm,
  fontWeight: 500,
  transition: 'all 150ms var(--ease)',
  cursor: 'pointer',
};

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

    return (
      <>
        <div
          mix={css({
            display: 'grid',
            gap: '1.5rem',
            [sm]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
            [lg]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
          })}
        >
          {videos.edges.length === 0 && <p>{t('videos.noFound')}</p>}
          {videos.edges.map((edge) => (
            <Video key={edge.node.id} video={edge.node} />
          ))}
        </div>
        {paginate && (hasPrevious || hasNext) && (
          <div
            mix={css({
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '0.75rem',
            })}
          >
            {hasPrevious && (
              <Link
                href={`?before=${videos.edges[0].cursor}`}
                mix={css(
                  merge(pageButton, {
                    border: '1px solid light-dark(var(--neutral-200), rgb(255 255 255 / 0.1))',
                    backgroundColor: 'var(--card)',
                    color: 'var(--muted)',
                    boxShadow: 'var(--shadow-sm)',
                    '&:hover': {
                      borderColor: 'rgb(229 0 130 / 0.3)',
                      color: 'light-dark(var(--neutral-900), #fff)',
                    },
                  })
                )}
              >
                ← {t('videos.previous')}
              </Link>
            )}
            {hasNext && (
              <Link
                href={`?after=${videos.edges[videos.edges.length - 1].cursor}`}
                mix={css(merge(pageButton, pinkButton))}
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
