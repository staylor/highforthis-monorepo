import type { LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import cn from 'classnames';

import query from '@/utils/query';
import { Heading1, Heading2 } from '@/components/Heading';
import Link from '@/components/Link';
import type { Show, ShowQuery } from '@/types/graphql';
import { formatDate } from '@/components/Shows/utils';
import Artwork from '@/components/Artist/Artwork';

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: showQuery, variables: { id: params.id } });
};

export default function ShowRoute() {
  const data = useLoaderData<ShowQuery>();
  const show = data.show as Show;
  const lastIndex = show.artists.length - 1;
  const d = formatDate(show.date);
  const ArtistHeading = show.title ? Heading2 : Heading1;
  const [artist] = show.artists;

  return (
    <article className="w-160 max-w-full">
      <p className="mb-3 text-lg">
        {d.monthName} {d.month}, {d.year} - {d.time}
      </p>
      {show.title && <Heading1>{show.title}</Heading1>}
      <div className="mb-8 mt-3">
        <Artwork name={artist.name} data={artist.appleMusic || {}} />
      </div>
      <ArtistHeading className="font-sans">
        {show.artists.map((artist, i) => (
          <>
            <Link
              key={artist.id}
              to={`/artist/${artist.slug}`}
              className={cn('block', {
                'mb-1': i < lastIndex,
              })}
            >
              {artist.name} →
            </Link>
          </>
        ))}
      </ArtistHeading>
      <Heading2 className="mt-8">
        <Link to={`/venue/${show.venue.slug}`}>{show.venue.name}</Link>
      </Heading2>
    </article>
  );
}

const showQuery = gql`
  query Show($id: ObjID) {
    show(id: $id) {
      artists {
        appleMusic {
          artwork {
            url
          }
          id
        }
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
`;
