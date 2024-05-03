import Link from '@/components/Link';
import type { ShowConnection } from '@/types/graphql';

import { formatDate } from './utils';
import { Cell } from './Cell';

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

  const relationText = relation === 'artist' ? 'by this artist' : 'at this venue';

  return (
    <article className={className || 'mt-16'}>
      <p className="mb-2 font-stylized">Shows we have attended {relationText}:</p>
      <table className="w-full border-collapse">
        <tbody>
          {shows.edges.map(({ node }) => {
            const d = formatDate(node.date);

            return (
              <tr key={node.id}>
                <Cell className="w-36 text-right font-stylized text-sm">
                  {d.formatted}/{d.year}
                </Cell>
                <Cell className="text-base font-medium uppercase">
                  <Link
                    className="hover:text-neutral-800 hover:underline dark:hover:text-pink"
                    to={
                      relation === 'artist'
                        ? `/venue/${node.venue.slug}`
                        : `/artist/${node.artist.slug}`
                    }
                  >
                    {relation === 'artist' ? node.venue.name : node.artist.name}
                  </Link>
                </Cell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}
