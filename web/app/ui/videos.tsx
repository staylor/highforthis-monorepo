import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { Video_VideoFragment, Videos_VideosFragment } from '#/types/graphql.ts';

import { getApp } from './app-context.tsx';
import { Link } from './link.tsx';
import { findThumbnail } from './public/media.ts';
import { cardGrid, pinkButton, quietButton, text } from './public/styles.ts';
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
    videos(after: $after, before: $before, first: $first, last: $last, year: $year) {
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

/** The heading a video's title is in a grid of them: one level below the heading over the grid. */
type TitleHeading = 'h2' | 'h3';

/**
 * A video to play: in a grid, with its title under it; in a post (`embed`), with a smaller title;
 * or on its own page (`single`), which has the title already, so only the player.
 */
export function Video(
  handle: Handle<{
    video: Video_VideoFragment;
    single?: boolean;
    embed?: boolean;
    heading?: TitleHeading;
  }>
) {
  return () => {
    const { video, single = false, embed = false, heading: Title = 'h2' } = handle.props;
    if (!video) {
      return null;
    }
    const href = routes.video.href({ slug: video.slug });
    const thumbnail = (
      <VideoThumbnail
        href={href}
        dataId={video.dataId}
        title={video.title}
        thumbUrl={findThumbnail(video.thumbnails, single)?.url}
        embedded={embed || single}
      />
    );

    if (single) {
      return thumbnail;
    }

    if (embed) {
      return (
        <>
          {thumbnail}
          <h3 mix={css({ marginBottom: '1.5rem', ...text.base })}>
            <Link href={href}>{video.title}</Link>
          </h3>
        </>
      );
    }

    return (
      <article>
        {thumbnail}
        <Title mix={css({ fontSize: '1rem', lineHeight: 1.375, fontWeight: 600 })}>
          <Link href={href}>{video.title}</Link>
        </Title>
      </article>
    );
  };
}

const previousPage = css(quietButton);
const nextPage = css(pinkButton);

/**
 * A grid of videos. Previous/next are plain links, which work without JavaScript and are
 * intercepted for client navigation with it.
 */
export function Videos(
  handle: Handle<{
    videos: NonNullable<Videos_VideosFragment['videos']>;
    paginate?: boolean;
    search?: URLSearchParams;
    /** For a grid under a section's own heading, as on the home page. */
    heading?: TitleHeading;
  }>
) {
  const { t } = getApp(handle);

  return () => {
    const { videos, paginate = true, search, heading } = handle.props;
    // The links page from the first and last videos here, so a page without any has neither
    const first = videos.edges.at(0);
    const last = videos.edges.at(-1);
    const hasPrevious = first && (videos.pageInfo.hasPreviousPage || search?.get('after'));
    const hasNext = last && (videos.pageInfo.hasNextPage || search?.get('before'));

    return (
      <>
        <div mix={css(cardGrid)}>
          {videos.edges.length === 0 && <p>{t('videos.noFound')}</p>}
          {videos.edges.map((edge) => (
            <Video key={edge.node.id} video={edge.node} heading={heading} />
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
              <Link href={`?before=${first.cursor}`} mix={previousPage}>
                ← {t('videos.previous')}
              </Link>
            )}
            {hasNext && (
              <Link href={`?after=${last.cursor}`} mix={nextPage}>
                {t('videos.next')} →
              </Link>
            )}
          </div>
        )}
      </>
    );
  };
}
