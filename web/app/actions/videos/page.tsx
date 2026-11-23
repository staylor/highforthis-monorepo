import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { VideosQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Heading1 } from '#/ui/heading.tsx';
import { Videos, videoFragment, videosFragment } from '#/ui/videos.tsx';

import { YearSelect } from './public/year-select.tsx';

export const videosQuery = gql`
  query Videos($after: String, $before: String, $first: Int, $last: Int, $year: Int) {
    ...Videos_videos
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

// The years there are videos from, newest first
const FIRST_YEAR = 2011;
const yearChoices = () =>
  Array.from({ length: new Date().getFullYear() - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i)
    .reverse()
    .map((year) => ({ year, href: routes.videos.href({ year: String(year) }) }));

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
        <div
          mix={css({
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          })}
        >
          <Heading1>{year ? t('videos.headingIn', { year }) : t('videos.heading')}</Heading1>
          <YearSelect
            value={year || ''}
            placeholder={t('nav.videosByYear')}
            years={yearChoices()}
            allHref={routes.videos.href()}
          />
        </div>
        <Videos videos={videos} search={search} />
      </>
    );
  };
}
