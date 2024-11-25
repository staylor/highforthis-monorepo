import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import Videos from '~/components/Videos';
import { videosQuery as queryFragment } from '~/components/Videos/graphql';
import type { VideoConnection, VideosQuery } from '~/types/graphql';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

const videosQuery = gql`
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
  ${queryFragment}
`;

export const loader: LoaderFunction = ({ params, request, context }) => {
  const url = new URL(request.url);
  const variables = { cacheKey: 'videos' } as any;
  const after = url.searchParams.get('after');
  const before = url.searchParams.get('before');
  if (after) {
    variables.first = 10;
    variables.after = after;
  } else if (before) {
    variables.last = 10;
    variables.before = before;
  } else {
    variables.first = 10;
  }
  if (params.year) {
    variables.year = parseInt(params.year, 10);
  }
  return query({
    context,
    query: videosQuery,
    variables,
  });
};

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Videos', siteSettings }),
    },
  ];
};

export default function VideosByYear() {
  const data = useLoaderData<VideosQuery>();
  const videos = data.videos as VideoConnection;

  return <Videos videos={videos} />;
}
