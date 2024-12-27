import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import type { MetaFunction } from 'react-router';

import { Heading2 } from '~/components/Heading';
import Shows from '~/components/Shows';
import ShowsGrid from '~/components/Shows/Grid';
import { formatDate } from '~/components/Shows/utils';
import type { ShowsQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';
import titleTemplate from '~/utils/title';

import type { Route } from './+types/index';

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Shows', siteSettings }),
    },
  ];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<ShowsQuery>({
    request,
    context,
    query: showsQuery,
    variables: { first: 200 },
  });
}

export const showsQuery = gql`
  query Shows($after: String, $first: Int) {
    shows(after: $after, first: $first, latest: true) {
      ...ShowsGrid_shows
    }
  }
  ${ShowsGrid.fragments.shows}
`;

export const clientLoader = createClientCache();

function ShowsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const date = formatDate();
  return (
    <article>
      <Heading2>{t('shows.recommended')}</Heading2>
      <p className="mb-6 text-xl">
        {t('shows.todaysDate')}: <strong>{date.formatted}</strong>
      </p>
      <Shows shows={loaderData.shows} />
    </article>
  );
}

export default ShowsRoute;
