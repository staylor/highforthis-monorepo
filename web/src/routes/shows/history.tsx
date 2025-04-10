import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import type { MetaFunction } from 'react-router';

import { Heading2 } from '~/components/Heading';
import Link from '~/components/Link';
import Shows from '~/components/Shows';
import ShowsGrid from '~/components/Shows/Grid';
import type { ShowsHistoryQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

import type { Route } from './+types/history';

export const meta: MetaFunction = ({ params, matches }) => {
  const { siteSettings } = rootData(matches);
  const title = params.year ? `${params.year} Shows > History` : 'Shows > History';
  return [
    {
      title: titleTemplate({ title, siteSettings }),
    },
  ];
};

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const year = params.year ? parseInt(params.year as string, 10) : undefined;
  return query<ShowsHistoryQuery>({
    request,
    context,
    query: showsQuery,
    variables: { first: 1000, year },
  });
}

export const showsQuery = gql`
  query ShowsHistory($after: String, $first: Int, $year: Int) {
    shows(after: $after, attended: true, first: $first, year: $year) {
      ...ShowsGrid_shows
    }
  }
  ${ShowsGrid.fragments.shows}
`;

export const clientLoader = createClientCache();

function ShowsHistoryRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { year } = useParams();
  const { shows } = loaderData;

  return (
    <article>
      {year ? (
        <>
          <Heading2>
            <span className="text-pink">{shows.edges.length}</span>{' '}
            {t('shows.attendedIn', { count: shows.edges.length, year })}
          </Heading2>
          <p className="my-5">
            <Link
              className="bold font-stylized text-pink text-xl uppercase underline"
              to="/shows/history"
            >
              {t('shows.viewFullHistory')}
            </Link>
          </p>
        </>
      ) : (
        <Heading2>{t('shows.attended.heading')}</Heading2>
      )}
      <Shows shows={shows} showMonths={false} />
    </article>
  );
}

export default ShowsHistoryRoute;
