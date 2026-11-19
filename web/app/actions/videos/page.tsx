import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { VideosQuery } from '../../types/graphql.ts';
import { getApp } from '../../ui/app-context.tsx';
import { Heading1 } from '../../ui/heading.tsx';
import { Videos, videoFragment, videosFragment } from '../../ui/videos.tsx';

import { YearSelect } from './public/year-select.tsx';

export const videosQuery = gql`
  query Videos(
    $after: String
    $before: String
    $cacheKey: String
    $first: Int
    $last: Int
    $year: Int
  ) {
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

const currentYear = new Date().getFullYear() + 1;
const yearChoices = [...Array(currentYear - 2011).keys()].map((i) => 2011 + i).reverse();

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
          <Heading1>{year ? `${year} Videos` : 'Videos'}</Heading1>
          <YearSelect value={year || ''} placeholder={t('nav.videosByYear')} years={yearChoices} />
        </div>
        <Videos videos={videos} search={search} />
      </>
    );
  };
}
