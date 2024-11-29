import { gql } from 'graphql-tag';

import Metadata from '~/components/Artist/Metadata';
import { Heading1 } from '~/components/Heading';
import Shows from '~/components/Shows';
import Attended from '~/components/Shows/Attended';
import type { ArtistQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';

import type { Route } from './+types/artist';

export async function loader({ request, params, context }: Route.LoaderArgs) {
  return query<ArtistQuery>({
    request,
    context,
    query: artistQuery,
    variables: { first: 100, slug: params.slug },
  });
}

export const clientLoader = createClientCache();

export default function Artist({ loaderData }: Route.ComponentProps) {
  const { artist, shows, attended } = loaderData;

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
