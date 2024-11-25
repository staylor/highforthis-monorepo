import type { SyntheticEvent } from 'react';
import { useState } from 'react';

import Button from '~/components/Button';
import Link from '~/components/Link';
import { formatArtists, formatDate } from '~/components/Shows/utils';
import type { ShowConnection } from '~/types/graphql';

function Shows({ shows, dataKey }: { shows: ShowConnection; dataKey: 'artists' | 'venue' }) {
  const limit = 10;

  const [showAll, setShowAll] = useState(false);
  if (!shows?.edges || shows.edges.length === 0) {
    return 'No associated shows.';
  }

  const onClick = (e: SyntheticEvent) => {
    e.preventDefault();

    setShowAll(!showAll);
  };

  const edges = showAll ? shows.edges : shows.edges.slice(0, limit);

  return (
    <>
      <ul>
        {edges.map(({ node }, idx: number) => {
          const d = formatDate(node.date);
          let name;
          if (dataKey === 'artists') {
            name = formatArtists(node);
          } else {
            name = node[dataKey].name;
          }
          return (
            <li key={idx.toString()} className="my-3">
              <Link to={`/admin/show/${node.id}`} className="text-pink underline">
                {d.formatted}/{d.year} {name}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-8">
        {shows.edges.length > limit && (
          <Button onClick={onClick}>{showAll ? 'Show Less' : 'Show More'}</Button>
        )}
        <Link to="/admin/show/add" className="ml-4 mt-1 inline-block underline">
          Add Show
        </Link>
      </div>
    </>
  );
}

export default Shows;
