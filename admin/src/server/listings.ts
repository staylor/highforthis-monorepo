import { gql } from 'graphql-tag';

import type { ImportListingsMutation, VenueListingsAdminQuery } from '#/types/graphql';
import { splitArtists } from '#/utils/splitArtists';

import type { RedirectResult } from './forms';
import type { GraphQLClient } from './graphql';

// A venue's upcoming shows from its listings page, to add to the shows

const listingsQuery = gql`
  query VenueListingsAdmin($venueId: String!, $withListings: Boolean!) {
    venues(first: 500) {
      edges {
        node {
          id
          listingsUrl
          name
        }
      }
    }
    venueListings(venueId: $venueId) @include(if: $withListings) {
      error
      listings {
        cancelled
        dateChanged
        headliners
        localDate
        localTime
        newArtists
        show {
          id
        }
        sourceId
        status
        support
        url
      }
      source
    }
  }
`;

const importMutation = gql`
  mutation ImportListings($venueId: String!, $input: [ImportListingInput!]!) {
    importListings(venueId: $venueId, input: $input) {
      artistsCreated
      showsCreated
    }
  }
`;

// The venues to choose from, and the chosen venue's listings
export function loadVenueListings({ gql, venueId }: { gql: GraphQLClient; venueId?: string }) {
  return gql.query<VenueListingsAdminQuery>(listingsQuery, {
    venueId: venueId ?? '',
    withListings: Boolean(venueId),
  });
}

// Adds the checked listings as shows, each with the artists entered for it
export async function importListings({
  gql,
  venueId,
  formData,
}: {
  gql: GraphQLClient;
  venueId?: string;
  formData: FormData;
}): Promise<{ failed: true } | RedirectResult> {
  const input = formData.getAll('selected').map((value) => {
    const sourceId = value.toString();
    return {
      sourceId,
      artists: splitArtists(formData.get(`artists-${sourceId}`)?.toString() ?? ''),
    };
  });

  const result = await gql.mutate<Partial<ImportListingsMutation>>(importMutation, {
    venueId,
    input,
  });
  const imported = result.importListings;
  if (!imported) {
    return { failed: true };
  }

  const search = new URLSearchParams({
    added: imported.showsCreated.toString(),
    artistsCreated: imported.artistsCreated.toString(),
  });
  return { redirectTo: `/admin/show/listings/${venueId}?${search.toString()}` };
}
