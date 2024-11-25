import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import Video from '~/components/Videos/Video';
import type { VideoQuery, Video as VideoType } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

export const meta: MetaFunction = ({ data, matches }) => {
  const { siteSettings } = rootData(matches);
  const { video } = data as VideoQuery;
  return [
    {
      title: titleTemplate({ title: video?.title, siteSettings }),
    },
  ];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: videoQuery, variables: { slug: params.slug } });
};

export const clientLoader = createClientCache();

export default function VideoRoute() {
  const data = useLoaderData<VideoQuery>();
  const video = data.video as VideoType;

  return <Video single video={video} />;
}

const videoQuery = gql`
  query Video($slug: String) {
    video(slug: $slug) {
      ...Video_video
    }
  }
  ${Video.fragments.video}
`;
