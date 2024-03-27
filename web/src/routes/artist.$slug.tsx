import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { LoaderFunction } from '@remix-run/server-runtime';

import { Heading1 } from '@/components/Heading';
import Shows from '@/components/Shows';
import query from '@/utils/query';
import type { Artist, ArtistQuery, ShowConnection } from '@/types/graphql';
import { createClientCache } from '@/utils/cache';
import AppleMusic from '@/components/Artist/AppleMusic';

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: artistQuery, variables: { first: 100, slug: params.slug } });
};

export const clientLoader = createClientCache();

export default function Artist() {
  const data = useLoaderData<ArtistQuery>();
  const artist = data.artist as Artist;
  const shows = data.shows as ShowConnection;

  return (
    <>
      <Heading1>{artist.name}</Heading1>
      <AppleMusic name={artist.name} data={artist.appleMusic || {}} />
      <Shows shows={shows} />
    </>
  );
}

const artistQuery = gql`
  query Artist($first: Int, $slug: String!) {
    artist: term(slug: $slug, taxonomy: "artist") {
      id
      name
      ... on Artist {
        appleMusic {
          artwork {
            url
          }
          id
          url
        }
      }
    }
    shows(first: $first, latest: true, taxonomy: "artist", term: $slug) {
      ...ShowsGrid_shows
    }
  }
  ${Shows.fragments.shows}
`;
