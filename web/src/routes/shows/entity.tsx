import cn from 'classnames';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import { Heading1 } from '~/components/Heading';
import Link from '~/components/Link';
import type { ShowStat, ShowStatsQuery } from '~/types/graphql';
import query from '~/utils/query';

import type { Route } from './+types/entity';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  return query<ShowStatsQuery>({
    request,
    context,
    query: showStatsQuery,
    variables: { entity: params.entity?.toUpperCase() },
  });
}

const sizes = ['text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

function parseClasses(total: number, size: number) {
  const count = sizes.length;
  const className: Record<string, boolean> = {};
  const edge = count - 1;
  for (let i = edge; i >= 0; i -= 1) {
    if (i === edge) {
      className[sizes[i]] = total >= i * size;
    } else if (i === 0) {
      className[sizes[i]] = total < size;
    } else {
      className[sizes[i]] = total >= i * size && total < (i + 1) * size;
    }
  }
  return className;
}

export default function ShowStatsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const params = useParams();
  const { showStats } = loaderData;
  const buckets: Record<string, ShowStat[]> = {};
  showStats.forEach((stat) => {
    const key = `bucket_${stat.count}`;
    buckets[key] ||= [];
    buckets[key].push(stat);
  });
  const other = params.entity === 'artist' ? 'venue' : 'artist';
  const count = sizes.length;
  const total = showStats[0].count;
  const size = (total - (total % count)) / count;

  return (
    <article className="w-160 max-w-full">
      <Heading1>{t(`entity.stats.${params.entity}`)}</Heading1>
      <p className="mb-8">
        <Link to={`/shows/stats/${other}`} className="text-pink mr-2 text-lg underline">
          {t(`entity.stats.see.${other}`)}
        </Link>
        {' • '}
        <Link to="/shows/history" className="text-pink ml-2 text-lg underline">
          {t('entity.stats.see.all')}
        </Link>
      </p>
      {Object.entries(buckets).map(([key, stats]) => (
        <ul key={key} className="mb-4">
          {stats.map((stat) => (
            <li key={stat.entity.id} className={cn(parseClasses(stat.count, size))}>
              <Link to={`/${params.entity}/${stat.entity.slug}`} className="hover:underline">
                {stat.entity.name}
              </Link>
              {' - '}
              {stat.count}
            </li>
          ))}
        </ul>
      ))}
    </article>
  );
}

const showStatsQuery = gql`
  query ShowStats($entity: ShowEntityType!) {
    showStats(entity: $entity) {
      count
      entity {
        ... on Artist {
          id
          name
          slug
        }
        ... on Venue {
          id
          name
          slug
        }
      }
    }
  }
`;
