import { gql } from 'graphql-tag';
import { Fragment } from 'react';

import Link from '~/components/Link';
import type { ShowConnection } from '~/types/graphql';

import { Cell } from './Cell';
import { formatArtists, formatDate, formatShowLink } from './utils';

export default function ShowsGrid({
  shows,
  className,
  showMonths = true,
  showYears = true,
}: {
  shows: ShowConnection;
  className?: string;
  showMonths?: boolean;
  showYears?: boolean;
}) {
  const years = {} as { [key: number]: number };
  const months = {} as { [key: string]: number };
  const sorted = [...shows.edges];
  sorted.sort(({ node: showA }, { node: showB }) => {
    const dateA = showA.date;
    const dateB = showB.date;
    if (dateA === dateB) {
      const artistA = showA.artists[0].name;
      const artistB = showB.artists[0].name;

      if (artistA === artistB) {
        return 0;
      }
      return artistA < artistB ? -1 : 1;
    }
    return showA.date < showB.date ? -1 : 1;
  });

  return (
    <div className={className}>
      <table className="w-full border-collapse">
        <tbody>
          {sorted.map(({ node }) => {
            const d = formatDate(node.date);
            const showRow = (
              <tr key={node.id}>
                <Cell className="font-stylized text-right text-sm">{d.formatted}</Cell>
                <Cell className="text-base">
                  <Link className="text-pink underline" to={formatShowLink(node)}>
                    {formatArtists(node)}
                  </Link>
                </Cell>
                <Cell className="text-base font-medium uppercase">
                  <Link
                    className="dark:hover:text-pink hover:text-neutral-800 hover:underline"
                    to={`/venue/${node.venue.slug}`}
                  >
                    {node.venue.name}
                  </Link>
                </Cell>
              </tr>
            );

            if (showYears && !years[d.year]) {
              years[d.year] = 1;
              months[`${d.year}${d.month}`] = 1;
              return (
                <Fragment key={`${d.year}${d.month}`}>
                  <tr>
                    <Cell colSpan={3} className="font-stylized font-bold">
                      {d.year}
                    </Cell>
                  </tr>
                  {showMonths && (
                    <tr>
                      <Cell colSpan={3} className="font-stylized">
                        {d.monthName}
                      </Cell>
                    </tr>
                  )}
                  {showRow}
                </Fragment>
              );
            }
            if (showMonths && !months[`${d.year}${d.month}`]) {
              months[`${d.year}${d.month}`] = 1;
              return (
                <Fragment key={`${d.year}${d.month}`}>
                  <tr>
                    <Cell colSpan={3} className="font-stylized">
                      {d.monthName}
                    </Cell>
                  </tr>
                  {showRow}
                </Fragment>
              );
            }
            return showRow;
          })}
        </tbody>
      </table>
    </div>
  );
}

ShowsGrid.fragments = {
  shows: gql`
    fragment ShowsGrid_shows on ShowConnection {
      edges {
        cursor
        node {
          artists {
            id
            name
            slug
          }
          date
          id
          title
          url
          venue {
            id
            name
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  `,
};
