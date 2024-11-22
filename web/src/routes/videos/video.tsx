import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Video from '~/components/Videos/Video';
import type { VideoQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

import type { Route } from './+types/video';

export const meta: MetaFunction = ({ data, matches }) => {
  const { siteSettings } = rootData(matches);
  const { video } = data as VideoQuery;
  return [
    {
      title: titleTemplate({ title: video?.title, siteSettings }),
    },
  ];
};

export async function loader({ request, params, context }: Route.LoaderArgs) {
  return query<VideoQuery>({
    request,
    context,
    query: videoQuery,
    variables: { slug: params.slug },
  });
}

export const clientLoader = createClientCache();

export default function VideoRoute({ loaderData }: Route.ComponentProps) {
  return <Video single video={loaderData.video} />;
}

const videoQuery = gql`
  query Video($slug: String) {
    video(slug: $slug) {
      ...Video_video
    }
  }
  ${Video.fragments.video}
`;
