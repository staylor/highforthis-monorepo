import type { ShowConnection } from '~/types/graphql';

import { formatArtists, formatDate } from './utils';

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
          <p className="mb-2">
            <strong>{d.formatted}</strong>
            <br />
            {formatArtists(node)}
            <br />
            {node.venue.name}
          </p>
        );

        if (!years[d.year]) {
          years[d.year] = 1;
          months[`${d.year}${d.month}`] = 1;
          return (
            <div key={node.id}>
              <p className="mb-2.5">
                <strong className="text-xl">{d.year}</strong>
              </p>
              <p className="mb-3 uppercase">
                <strong>{d.monthName}</strong>
              </p>
              {showRow}
            </div>
          );
        }
        if (!months[`${d.year}${d.month}`]) {
          months[`${d.year}${d.month}`] = 1;
          return (
            <div key={node.id}>
              <p className="mb-1">
                <strong>{d.monthName}</strong>
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
