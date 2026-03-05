import cn from 'classnames';
import { gql } from 'graphql-tag';
import { Trans } from 'react-i18next';

import Link from '#/components/Link';
import type { ShowConnection } from '#/types/graphql';

import { cellBase, rowBorder, rowHover } from './styles';
import { formatArtists, formatDate, formatShowLink } from './utils';

export default function Attended({
  shows,
  relation,
  className,
}: {
  shows: ShowConnection;
  relation: string;
  className?: string;
}) {
  if (!shows?.edges || shows.edges.length === 0) {
    return null;
  }

  return (
    <article className={className || 'mt-12'}>
      <p className="mb-3 text-sm">
        <Link to={`/shows/stats/${relation}`} className="text-pink hover:underline">
          <Trans
            i18nKey={`shows.attended.${relation}`}
            count={shows.edges.length}
            components={{
              Bold: <span className="underline" />,
            }}
          />
        </Link>
        :
      </p>
      <table className="w-full border-collapse">
        <tbody>
          {shows.edges.map(({ node }) => {
            const d = formatDate(node.date);

            return (
              <tr key={node.id} className={cn(rowHover, rowBorder)}>
                <td
                  className={cn(
                    cellBase,
                    'text-muted dark:text-muted-dark w-16 tabular-nums md:w-24'
                  )}
                >
                  {d.formatted}/{d.year}
                </td>
                <td className={cellBase}>
                  <Link
                    className="hover:text-pink transition-colors hover:underline"
                    to={relation === 'artist' ? `/venue/${node.venue.slug}` : formatShowLink(node)}
                  >
                    {relation === 'artist' ? node.venue.name : formatArtists(node)}
                  </Link>
                  {relation === 'artist' && (
                    <span className="text-muted dark:text-muted-dark block text-xs sm:hidden">
                      {node.venue.city}, {node.venue.state}
                    </span>
                  )}
                </td>
                {relation === 'artist' && (
                  <td
                    className={cn(
                      cellBase,
                      'text-muted dark:text-muted-dark hidden uppercase sm:table-cell'
                    )}
                  >
                    {node.venue.city}, {node.venue.state}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}

Attended.fragments = {
  shows: gql`
    fragment Attended_shows on ShowConnection {
      edges {
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
            city
            id
            name
            slug
            state
          }
        }
      }
    }
  `,
};
