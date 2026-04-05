import cn from 'classnames';
import { gql } from 'graphql-tag';
import { Fragment } from 'react';

import Link from '#/components/Link';
import type { ShowConnection } from '#/types/graphql';

import { cellBase, rowHover } from './styles';
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

  const headerCell = cn(cellBase, 'font-bold text-neutral-900 dark:text-white');

  return (
    <div className={className}>
      <table className="w-full border-collapse">
        <tbody>
          {sorted.map(({ node }) => {
            const d = formatDate(node.date);
            const showRow = (
              <tr key={node.id} className={rowHover}>
                <td
                  className={cn(
                    cellBase,
                    'text-muted dark:text-muted-dark w-16 tabular-nums md:w-24'
                  )}
                >
                  {d.formatted}
                </td>
                <td className={cellBase}>
                  <Link className="text-pink hover:underline" to={formatShowLink(node)}>
                    {formatArtists(node)}
                  </Link>
                  <span className="text-muted dark:text-muted-dark block text-xs sm:hidden">
                    {node.venue.name}
                  </span>
                </td>
                <td
                  className={cn(
                    cellBase,
                    'text-muted dark:text-muted-dark hidden uppercase sm:table-cell'
                  )}
                >
                  <Link
                    className="hover:text-pink transition-colors"
                    to={`/venue/${node.venue.slug}`}
                  >
                    {node.venue.name}
                  </Link>
                </td>
              </tr>
            );

            if (showYears && !years[d.year]) {
              years[d.year] = 1;
              months[`${d.year}${d.month}`] = 1;
              return (
                <Fragment key={`${d.year}${d.month}`}>
                  <tr>
                    <td colSpan={3} className={cn(headerCell, 'pt-6 text-lg first:pt-0')}>
                      {d.year}
                    </td>
                  </tr>
                  {showMonths && (
                    <>
                      <tr>
                        <td colSpan={3} className="h-2" />
                      </tr>
                      <tr className="dark:bg-surface-dark-card bg-neutral-100">
                        <td
                          colSpan={3}
                          className={cn(
                            cellBase,
                            'text-muted dark:text-muted-dark py-2 text-xs font-semibold tracking-wider uppercase'
                          )}
                        >
                          {d.monthName}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="h-2" />
                      </tr>
                    </>
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
                    <td colSpan={3} className="h-2" />
                  </tr>
                  <tr className="dark:bg-surface-dark-card bg-neutral-100">
                    <td
                      colSpan={3}
                      className={cn(
                        cellBase,
                        'text-muted dark:text-muted-dark py-2 text-xs font-semibold tracking-wider uppercase'
                      )}
                    >
                      {d.monthName}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="h-2" />
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
