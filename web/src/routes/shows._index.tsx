import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import type { MetaFunction } from '@remix-run/node';
import { gql } from 'graphql-tag';

import Shows from '@/components/Shows';
import type { ShowConnection, ShowsQuery } from '@/types/graphql';
import { createClientCache } from '@/utils/cache';
import query from '@/utils/query';
import titleTemplate from '@/utils/title';
import ShowsGrid from '@/components/Shows/Grid';
import { rootData } from '@/utils/rootData';

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Shows', siteSettings }),
    },
  ];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const variables = { first: 200 } as any;
  if (params.taxonomy && params.term) {
    variables.taxonomy = params.taxonomy;
    variables.term = params.term;
  }

  return query({
    context,
    query: showsQuery,
    variables,
  });
};

export const showsQuery = gql`
  query Shows($after: String, $first: Int, $taxonomy: String, $term: String) {
    shows(after: $after, first: $first, latest: true, taxonomy: $taxonomy, term: $term) {
      ...ShowsGrid_shows
    }
  }
  ${ShowsGrid.fragments.shows}
`;

export const clientLoader = createClientCache();

function ShowsRoute() {
  const data = useLoaderData<ShowsQuery>();
  const shows = data.shows as ShowConnection;
  return <Shows shows={shows} />;
}

export default ShowsRoute;
