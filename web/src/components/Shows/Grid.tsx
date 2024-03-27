import type { TdHTMLAttributes } from 'react';
import { Fragment } from 'react';
import cn from 'classnames';
import { gql } from 'graphql-tag';

import Link from '@/components/Link';
import type { ShowConnection } from '@/types/graphql';

import { formatDate } from './utils';

const Cell = ({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn('border-detail dark:border-detail-dark border py-1 px-2', className)}
    {...props}
  />
);

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
  const date = formatDate(new Date());

  return (
    <article className={className}>
      <p className="mb-2 font-stylized">{`Today's date is: ${date.formatted}`}</p>
      <table className="w-full border-collapse">
        <tbody>
          {shows.edges.map(({ node }) => {
            const d = formatDate(new Date(node.date));
            const showRow = (
              <tr key={node.id}>
                <Cell className="text-right font-stylized text-sm">{d.formatted}</Cell>
                <Cell className="text-base">
                  <Link className="text-pink underline" to={`/artist/${node.artist.slug}`}>
                    {node.title || node.artist.name}
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
          artist {
            id
            name
            slug
          }
          date
          id
          title
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
