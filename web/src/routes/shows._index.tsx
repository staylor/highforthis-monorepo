import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import { Heading2 } from '@/components/Heading';
import Shows from '@/components/Shows';
import ShowsGrid from '@/components/Shows/Grid';
import { formatDate } from '@/components/Shows/utils';
import type { ShowConnection, ShowsQuery } from '@/types/graphql';
import { createClientCache } from '@/utils/cache';
import query from '@/utils/query';
import { rootData } from '@/utils/rootData';
import titleTemplate from '@/utils/title';

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Shows', siteSettings }),
    },
  ];
};

export const loader: LoaderFunction = async ({ context }) => {
  return query({
    context,
    query: showsQuery,
    variables: { first: 200 },
  });
};

export const showsQuery = gql`
  query Shows($after: String, $first: Int) {
    shows(after: $after, first: $first, latest: true) {
      ...ShowsGrid_shows
    }
  }
  ${ShowsGrid.fragments.shows}
`;

export const clientLoader = createClientCache();

function ShowsRoute() {
  const data = useLoaderData<ShowsQuery>();
  const shows = data.shows as ShowConnection;
  const date = formatDate();
  return (
    <article>
      <Heading2>Recommended Shows</Heading2>
      <p className="mb-6 text-xl">
        Today's date is: <strong>{date.formatted}</strong>
      </p>
      <Shows shows={shows} />
    </article>
  );
}

export default ShowsRoute;
