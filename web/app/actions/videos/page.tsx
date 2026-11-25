import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { VideoQuery, VideosQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { PageHeader } from '#/ui/page-header.tsx';
import { YearSelect } from '#/ui/public/year-select.tsx';
import { Video, Videos, videoFragment, videosFragment } from '#/ui/videos.tsx';

// The page's videos, and the years there are videos from for its menu, which the home page's
// videos don't need
export const videosQuery = gql`
  query Videos($after: String, $before: String, $first: Int, $last: Int, $year: Int) {
    ...Videos_videos
    videos(after: $after, before: $before, first: $first, last: $last, year: $year) {
      years
    }
  }
  ${videosFragment}
`;

export const videoQuery = gql`
  query Video($slug: String) {
    video(slug: $slug) {
      ...Video_video
    }
  }
  ${videoFragment}
`;

/**
 * The menu's years: those there are videos from, newest first, and the one the page is for, which
 * can have none. Every year since the first video would offer years that have none.
 */
function yearChoices(years: readonly number[], year?: string) {
  const choices = new Set(years);
  // As the menu would write it: 0999 would add 999, whose page there isn't
  if (year && String(Number(year)) === year) {
    choices.add(Number(year));
  }
  return [...choices]
    .sort((a, b) => b - a)
    .map((choice) => ({ year: choice, href: routes.videos.href({ year: String(choice) }) }));
}

export function VideosPage(
  handle: Handle<{
    videos: NonNullable<VideosQuery['videos']>;
    year?: string;
    search: URLSearchParams;
  }>
) {
  const { t } = getApp(handle);

  return () => {
    const { videos, year, search } = handle.props;
    return (
      <>
        <PageHeader
          display
          eyebrow={t('videos.count', { count: videos.count })}
          title={year ? t('videos.headingIn', { year }) : t('videos.heading')}
        >
          <YearSelect
            value={year || ''}
            label={t('nav.videosByYear')}
            placeholder={t('nav.years')}
            years={yearChoices(videos.years ?? [], year)}
            allHref={routes.videos.href()}
          />
        </PageHeader>
        <Videos videos={videos} search={search} />
      </>
    );
  };
}

/** One video, under its title and a link back to the rest. It's no wider than its picture is sharp. */
export function VideoPage(handle: Handle<{ video: NonNullable<VideoQuery['video']> }>) {
  const { t } = getApp(handle);

  return () => {
    const { video } = handle.props;
    return (
      <article mix={css({ maxWidth: '60rem' })}>
        <PageHeader eyebrow={t('videos.heading')} back={routes.videos.href()} title={video.title} />
        <Video single video={video} />
      </article>
    );
  };
}
