import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';

import { Heading1 } from '@/components/Heading';
import Shows from '@/components/Shows';
import Attended from '@/components/Shows/Attended';
import query from '@/utils/query';
import type { Artist, ArtistQuery, ShowConnection } from '@/types/graphql';
import { createClientCache } from '@/utils/cache';
import Metadata from '@/components/Artist/Metadata';

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: artistQuery, variables: { first: 100, slug: params.slug } });
};

export const clientLoader = createClientCache();

export default function Artist() {
  const data = useLoaderData<ArtistQuery>();
  const artist = data.artist as Artist;
  const shows = data.shows as ShowConnection;
  const attended = data.attended as ShowConnection;

  return (
    <>
      <Heading1>{artist.name}</Heading1>
      <Metadata name={artist.name} website={artist.website || ''} data={artist.appleMusic || {}} />
      <Shows shows={shows} />
      <Attended shows={attended} relation="artist" />
    </>
  );
}

const artistQuery = gql`
  query Artist($first: Int, $slug: String!) {
    artist(slug: $slug) {
      appleMusic {
        artwork {
          url
        }
        id
        url
      }
      id
      name
      website
    }
    attended: shows(artist: { slug: $slug }, attended: true, first: $first) {
      ...Attended_shows
    }
    shows(artist: { slug: $slug }, first: $first, latest: true) {
      ...ShowsGrid_shows
    }
  }
  ${Attended.fragments.shows}
  ${Shows.fragments.shows}
`;
