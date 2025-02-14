import { gql } from 'graphql-tag';
import { Trans } from 'react-i18next';

import Link from '~/components/Link';
import type { ShowConnection } from '~/types/graphql';

import { Cell } from './Cell';
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
    <article className={className || 'mt-16'}>
      <p className="font-stylized mb-2">
        <Link to={`/shows/stats/${relation}`}>
          <Trans i18nKey={`shows.attended.${relation}`} count={shows.edges.length} components={{
            Bold: <span className="underline" />
          }} />
        </Link>
        :
      </p>
      <table className="w-full border-collapse">
        <tbody>
          {shows.edges.map(({ node }) => {
            const d = formatDate(node.date);

            return (
              <tr key={node.id}>
                <Cell className="font-stylized w-36 text-right text-sm">
                  {d.formatted}/{d.year}
                </Cell>
                <Cell className="text-base font-medium uppercase">
                  <Link
                    className="dark:hover:text-pink hover:text-neutral-800 hover:underline"
                    to={relation === 'artist' ? `/venue/${node.venue.slug}` : formatShowLink(node)}
                  >
                    {relation === 'artist' ? node.venue.name : formatArtists(node)}
                  </Link>
                </Cell>
                {relation === 'artist' && (
                  <Cell className="text-base font-medium uppercase">
                    {node.venue.city}, {node.venue.state}
                  </Cell>
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
