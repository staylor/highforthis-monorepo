import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';
import cn from 'classnames';
import { gql } from 'graphql-tag';

import Artwork from '@/components/Artist/Artwork';
import { Heading1, Heading2 } from '@/components/Heading';
import Link from '@/components/Link';
import { formatDate } from '@/components/Shows/utils';
import type { Show, ShowQuery } from '@/types/graphql';
import query from '@/utils/query';

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
    <article className="mx-auto text-center md:flex md:text-left">
      <div className="mb-8 mt-3 md:mr-8">
        <Artwork
          name={artist.name}
          data={artist.appleMusic || {}}
          className="mx-auto rounded-lg md:mx-0"
        />
      </div>
      <div className="md:mt-4">
        <p className="mb-3 text-lg">
          {d.monthName} {d.month}, {d.year} - {d.time}
        </p>
        {show.title && <Heading1>{show.title}</Heading1>}
        <ArtistHeading className="font-sans">
          {show.artists.map((artist, i) => (
            <Link
              key={artist.id}
              to={`/artist/${artist.slug}`}
              className={cn('block', {
                'mb-1': i < lastIndex,
              })}
            >
              {artist.name} →
            </Link>
          ))}
        </ArtistHeading>
        <Heading2 className="mt-4">
          <Link to={`/venue/${show.venue.slug}`} className="text-gray-400">
            {show.venue.name}
          </Link>
        </Heading2>
        {show.url && (
          <a
            href={show.url}
            target="_blank"
            className="my-2 inline-block rounded-md border border-pink px-3 py-2 font-sans text-xl text-pink"
            rel="noreferrer"
          >
            Event Website
          </a>
        )}
      </div>
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
      url
      venue {
        id
        name
        slug
      }
    }
  }
`;
