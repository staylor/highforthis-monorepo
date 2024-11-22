import { useParams } from 'react-router';
import type { MetaFunction } from 'react-router';

import TextTitle from '~/components/TextTitle';
import Videos from '~/components/Videos';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

import type { Route } from './+types/year';

export { loader } from '.';

export const meta: MetaFunction = ({ params, matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: `${params.year} » Videos`, siteSettings }),
    },
  ];
};

export default function VideosByYear({ loaderData }: Route.ComponentProps) {
  const params = useParams();

  return (
    <>
      <TextTitle>{params.year}</TextTitle>
      <Videos videos={loaderData.videos} />
    </>
  );
}
