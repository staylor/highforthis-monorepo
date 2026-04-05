import Link from '#/components/Link';
import type { ShowConnection } from '#/types/graphql';

import { formatArtists, formatDate, formatShowLink } from './utils';

export default function ShowsList({
  shows,
  className,
}: {
  shows: ShowConnection;
  className?: string;
}) {
  const years = {} as { [key: number]: number };
  const months = {} as { [key: string]: number };

  return (
    <article className={className}>
      {shows.edges.map(({ node }) => {
        const d = formatDate(node.date);

        const showRow = (
          <p className="mb-2 text-sm">
            <strong className="tabular-nums">{d.formatted}</strong>
            <br />
            <Link className="text-pink" to={formatShowLink(node)}>
              {formatArtists(node)}
            </Link>
            <br />
            <span className="text-muted dark:text-muted-dark">{node.venue.name}</span>
          </p>
        );

        if (!years[d.year]) {
          years[d.year] = 1;
          months[`${d.year}${d.month}`] = 1;
          return (
            <div key={node.id}>
              <p className="mt-4 mb-1 first:mt-0">
                <strong className="text-lg">{d.year}</strong>
              </p>
              <p className="text-muted dark:text-muted-dark mb-1 text-xs font-semibold tracking-wider uppercase">
                {d.monthName}
              </p>
              {showRow}
            </div>
          );
        }
        if (!months[`${d.year}${d.month}`]) {
          months[`${d.year}${d.month}`] = 1;
          return (
            <div key={node.id}>
              <p className="text-muted dark:text-muted-dark mt-3 mb-1 text-xs font-semibold tracking-wider uppercase">
                {d.monthName}
              </p>
              {showRow}
            </div>
          );
        }
        return <div key={node.id}>{showRow}</div>;
      })}
    </article>
  );
}
