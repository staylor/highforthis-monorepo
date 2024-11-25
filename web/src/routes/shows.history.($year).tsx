import type { MetaFunction } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import { Heading2 } from '~/components/Heading';
import Link from '~/components/Link';
import Shows from '~/components/Shows';
import ShowsGrid from '~/components/Shows/Grid';
import type { ShowConnection, ShowsHistoryQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

export const meta: MetaFunction = ({ params, matches }) => {
  const { siteSettings } = rootData(matches);
  const title = params.year ? `${params.year} Shows > History` : 'Shows > History';
  return [
    {
      title: titleTemplate({ title, siteSettings }),
    },
  ];
};

export const loader: LoaderFunction = async ({ params, context }) => {
  const year = params.year ? parseInt(params.year as string, 10) : undefined;
  return query({
    context,
    query: showsQuery,
    variables: { first: 1000, year },
  });
};

export const showsQuery = gql`
  query ShowsHistory($after: String, $first: Int, $year: Int) {
    shows(after: $after, attended: true, first: $first, year: $year) {
      ...ShowsGrid_shows
    }
  }
  ${ShowsGrid.fragments.shows}
`;

export const clientLoader = createClientCache();

function ShowsHistoryRoute() {
  const { year } = useParams();
  const data = useLoaderData<ShowsHistoryQuery>();
  const shows = data.shows as ShowConnection;
  const plural = shows.edges.length === 1 ? 'Show' : 'Shows';

  return (
    <article>
      {year ? (
        <>
          <Heading2>
            <span className="text-pink">{shows.edges.length}</span> {plural} attended in {year}
          </Heading2>
          <p className="my-5">
            <Link
              className="bold font-stylized text-xl uppercase text-pink underline"
              to="/shows/history"
            >
              View Full History
            </Link>
          </p>
        </>
      ) : (
        <Heading2>Shows I have attended</Heading2>
      )}
      <Shows shows={shows} showMonths={false} />
    </article>
  );
}

export default ShowsHistoryRoute;
