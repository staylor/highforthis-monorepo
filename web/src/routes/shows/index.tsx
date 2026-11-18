import { Heading1 } from '@highforthis/shared/web/components/Heading';
import { formatDate } from '@highforthis/shared/web/components/Shows/utils';
import type { ShowsQuery } from '@highforthis/shared/web/types/graphql';
import query from '@highforthis/shared/web/utils/query';
import { rootData } from '@highforthis/shared/web/utils/rootData';
import titleTemplate from '@highforthis/shared/web/utils/title';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import type { MetaFunction } from 'react-router';

import Shows from '#/components/Shows';
import ShowsGrid from '#/components/Shows/Grid';

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

function ShowsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const date = formatDate();
  return (
    <article>
      <Heading1>{t('shows.recommended')}</Heading1>
      <p className="mb-8 text-base text-muted dark:text-muted-dark">
        {t('shows.todaysDate')}:{' '}
        <strong className="text-neutral-900 dark:text-white">{date.formatted}</strong>
      </p>
      <Shows shows={loaderData.shows!} />
    </article>
  );
}

export default ShowsRoute;
