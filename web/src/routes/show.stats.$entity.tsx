import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';
import { useLoaderData, useParams } from '@remix-run/react';
import cn from 'classnames';

import query from '@/utils/query';
import type { ShowStat, ShowStatsQuery } from '@/types/graphql';
import { Heading1 } from '@/components/Heading';
import Link from '@/components/Link';

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({
    context,
    query: showStatsQuery,
    variables: { entity: params.entity?.toUpperCase() },
  });
};

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

export default function ShowStatsRoute() {
  const params = useParams();
  const data = useLoaderData<ShowStatsQuery>();
  const stats = data.showStats as ShowStat[];
  const buckets: Record<string, ShowStat[]> = {};
  stats.forEach((stat) => {
    const key = `bucket_${stat.count}`;
    buckets[key] ||= [];
    buckets[key].push(stat);
  });
  const other = params.entity === 'artist' ? 'venue' : 'artist';
  const count = sizes.length;
  const total = stats[0].count;
  const size = (total - (total % count)) / count;

  return (
    <article className="w-160 max-w-full">
      <Heading1>Show Stats: {params.entity}s</Heading1>
      <p className="mb-8">
        <Link to={`/show/stats/${other}`} className="text-lg text-pink underline">
          See {other} stats
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
