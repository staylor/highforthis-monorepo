import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';

import TextTitle from '~/components/TextTitle';
import Videos from '~/components/Videos';
import type { VideoConnection, VideosQuery } from '~/types/graphql';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

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
