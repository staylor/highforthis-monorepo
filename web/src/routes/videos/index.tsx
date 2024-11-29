import { gql } from 'graphql-tag';
import { useParams, type MetaFunction } from 'react-router';

import TextTitle from '~/components/TextTitle';
import Videos from '~/components/Videos';
import { videosQuery as queryFragment } from '~/components/Videos/graphql';
import type { VideoConnection, VideosQuery } from '~/types/graphql';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

import type { Route } from './+types';

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

export async function loader({ params, request, context }: Route.LoaderArgs) {
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
  return query<VideosQuery>({
    request,
    context,
    query: videosQuery,
    variables,
  });
}

export const meta: MetaFunction = ({ matches, params }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({
        title: params.year ? `${params.year} » Videos` : 'Videos',
        siteSettings,
      }),
    },
  ];
};

export default function VideosIndex({ loaderData }: Route.ComponentProps) {
  const params = useParams();
  const { videos } = loaderData;
  if (!videos) {
    return null;
  }

  return (
    <>
      {params.year && <TextTitle>{params.year}</TextTitle>}
      <Videos videos={videos as VideoConnection} />
    </>
  );
}
