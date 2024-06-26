import { Fragment } from 'react';
import { gql } from 'graphql-tag';

import Link from '@/components/Link';
import type { ShowConnection } from '@/types/graphql';

import { formatArtists, formatDate, formatShowLink } from './utils';
import { Cell } from './Cell';

export default function ShowsGrid({
  shows,
  className,
}: {
  shows: ShowConnection;
  className?: string;
}) {
  if (!shows || !shows.edges || shows.edges.length === 0) {
    return <p>No recommended shows at this time.</p>;
  }

  const years = {} as { [key: number]: number };
  const months = {} as { [key: string]: number };
  const date = formatDate();
  const sorted = shows.edges.sort(({ node: showA }, { node: showB }) => {
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
    <article className={className}>
      <p className="mb-2 font-stylized">Upcoming Shows {`(Today's date is: ${date.formatted})`}</p>
      <table className="w-full border-collapse">
        <tbody>
          {sorted.map(({ node }) => {
            const d = formatDate(node.date);
            const showRow = (
              <tr key={node.id}>
                <Cell className="text-right font-stylized text-sm">{d.formatted}</Cell>
                <Cell className="text-base">
                  <Link className="text-pink underline" to={formatShowLink(node)}>
                    {formatArtists(node)}
                  </Link>
                </Cell>
                <Cell className="text-base font-medium uppercase">
                  <Link
                    className="hover:text-neutral-800 hover:underline dark:hover:text-pink"
                    to={`/venue/${node.venue.slug}`}
                  >
                    {node.venue.name}
                  </Link>
                </Cell>
              </tr>
            );

            if (!years[d.year]) {
              years[d.year] = 1;
              months[`${d.year}${d.month}`] = 1;
              return (
                <Fragment key={`${d.year}${d.month}`}>
                  <tr>
                    <Cell colSpan={3} className="font-stylized font-bold">
                      {d.year}
                    </Cell>
                  </tr>
                  <tr>
                    <Cell colSpan={3} className="font-stylized">
                      {d.monthName}
                    </Cell>
                  </tr>
                  {showRow}
                </Fragment>
              );
            }
            if (!months[`${d.year}${d.month}`]) {
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
    </article>
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
