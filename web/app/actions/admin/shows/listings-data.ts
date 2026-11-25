import { gql } from 'graphql-tag';

import type { GraphQLClient, RedirectResult } from '#/lib/admin/forms.ts';
import { attempt } from '#/lib/graphql.ts';
import { withEveryPage } from '#/lib/paging.ts';
import { routes } from '#/routes.ts';
import type {
  ImportListingsMutation,
  ListingsVenuesQuery,
  VenueListingsAdminQuery,
} from '#/types/graphql.ts';
import { splitArtists } from '#/ui/admin/public/split-artists.ts';

// The venues to choose from, a page at a time
const listingsVenuesFragment = gql`
  fragment Listings_venues on VenueConnection {
    edges {
      cursor
      node {
        id
        listingsUrl
        name
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

const listingsVenuesQuery = gql`
  query ListingsVenues($after: String) {
    venues(after: $after, first: 500) {
      ...Listings_venues
    }
  }
  ${listingsVenuesFragment}
`;

const listingsQuery = gql`
  query VenueListingsAdmin($venueId: String!, $withListings: Boolean!) {
    venueListings(venueId: $venueId) @include(if: $withListings) {
      error
      source
      listings {
        cancelled
        dateChanged
        headliners
        localDate
        localTime
        newArtists
        sourceId
        status
        support
        url
        show {
          id
        }
      }
    }
    venues(first: 500) {
      ...Listings_venues
    }
  }
  ${listingsVenuesFragment}
`;

const importMutation = gql`
  mutation ImportListings($input: [ImportListingInput!]!, $venueId: String!) {
    importListings(input: $input, venueId: $venueId) {
      artistsCreated
      showsCreated
    }
  }
`;

export async function loadVenueListings({
  gql: client,
  venueId,
}: {
  gql: GraphQLClient;
  venueId?: string;
}) {
  const data = await client.query<VenueListingsAdminQuery>(listingsQuery, {
    venueId: venueId ?? '',
    withListings: Boolean(venueId),
  });
  // Every venue, so the menu doesn't stop at the first page
  const venues =
    data.venues &&
    (await withEveryPage(
      data.venues,
      async (after) =>
        (await client.query<ListingsVenuesQuery>(listingsVenuesQuery, { after })).venues
    ));
  return { ...data, venues };
}

/** Adds the checked listings as shows, each with the artists entered for it. */
export async function importListings({
  gql: client,
  venueId,
  formData,
}: {
  gql: GraphQLClient;
  venueId: string;
  formData: FormData;
}): Promise<{ failed: true } | RedirectResult> {
  const input = formData.getAll('selected').map((value) => {
    const sourceId = value.toString();
    return {
      sourceId,
      artists: splitArtists(formData.get(`artists-${sourceId}`)?.toString() ?? ''),
    };
  });

  const { data } = await attempt(
    client.mutate<ImportListingsMutation>(importMutation, { venueId, input })
  );
  const imported = data?.importListings;
  if (!imported) {
    return { failed: true };
  }

  const search = new URLSearchParams({
    added: imported.showsCreated.toString(),
    artistsCreated: imported.artistsCreated.toString(),
  });
  return { redirectTo: `${routes.admin.shows.listings.index.href({ venueId })}?${search}` };
}
