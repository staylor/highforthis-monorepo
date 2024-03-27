import { useLoaderData, useParams } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

import Videos from '@/components/Videos';
import TextTitle from '@/components/TextTitle';
import titleTemplate from '@/utils/title';
import { rootData } from '@/utils/rootData';
import type { VideoConnection, VideosQuery } from '@/types/graphql';

export { loader } from './videos._index';

export const meta: MetaFunction = ({ params, matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: `${params.year} » Videos`, siteSettings }),
    },
  ];
};

export default function VideosByYear() {
  const params = useParams();
  const data = useLoaderData<VideosQuery>();
  const videos = data.videos as VideoConnection;

  return (
    <>
      <TextTitle>{params.year}</TextTitle>
      <Videos videos={videos} />
    </>
  );
}
