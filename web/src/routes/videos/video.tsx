import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Video from '@highforthis/shared/components/Videos/Video';
import query from '@highforthis/shared/utils/query';
import { rootData } from '@highforthis/shared/utils/rootData';
import titleTemplate from '@highforthis/shared/utils/title';

import type { VideoQuery } from '#/types/graphql';
import { createClientCache } from '#/utils/cache';

import type { Route } from './+types/video';

export const meta: MetaFunction = ({ loaderData, matches }) => {
  const { siteSettings } = rootData(matches);
  const { video } = loaderData as VideoQuery;
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
