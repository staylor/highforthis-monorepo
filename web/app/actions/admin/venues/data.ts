import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  saveFlag,
  submitForm,
  type FlagArgs,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { listVariables, type ListArgs } from '#/lib/admin/list-variables.ts';
import { withEveryPage } from '#/lib/paging.ts';
import type { VenueEditQuery, VenueShowsAdminQuery, VenuesAdminQuery } from '#/types/graphql.ts';

const venueFormFragment = gql`
  fragment VenueForm_venue on Venue {
    id
    capacity
    city
    description
    excludeFromSearch
    listingsUrl
    name
    permanentlyClosed
    postalCode
    slug
    state
    streetAddress
    website
    coordinates {
      latitude
      longitude
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
  }
  ${featuredMediaFragment}
`;

const venuesQuery = gql`
  query VenuesAdmin($after: String, $first: Int, $search: String) {
    venues(after: $after, first: $first, search: $search) {
      count
      edges {
        node {
          id
          address
          capacity
          excludeFromSearch
          name
          permanentlyClosed
          slug
          website
          featuredMedia {
            ... on ImageUpload {
              id
              destination
              type
              crops {
                fileName
                width
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const updateVenueFlagMutation = gql`
  mutation UpdateVenueFlag($id: String!, $input: UpdateVenueInput!) {
    updateVenue(id: $id, input: $input) {
      id
    }
  }
`;

const deleteVenueMutation = gql`
  mutation DeleteVenue($ids: [String]!) {
    removeVenue(ids: $ids)
  }
`;

// The venue's shows, beside the form, a page at a time
const venueShowsFragment = gql`
  fragment VenueForm_shows on ShowConnection {
    edges {
      cursor
      node {
        id
        date
        title
        artists {
          id
          name
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

const venueShowsQuery = gql`
  query VenueShowsAdmin($id: String, $after: String) {
    shows(after: $after, first: 200, venue: { id: $id }) {
      ...VenueForm_shows
    }
  }
  ${venueShowsFragment}
`;

const venueQuery = gql`
  query VenueEdit($id: String) {
    shows(first: 200, venue: { id: $id }) {
      ...VenueForm_shows
    }
    venue(id: $id) {
      ...VenueForm_venue
    }
  }
  ${venueFormFragment}
  ${venueShowsFragment}
`;

const createVenueMutation = gql`
  mutation CreateVenue($input: CreateVenueInput!) {
    createVenue(input: $input) {
      ...VenueForm_venue
    }
  }
  ${venueFormFragment}
`;

const updateVenueMutation = gql`
  mutation UpdateVenue($id: String!, $input: UpdateVenueInput!) {
    updateVenue(id: $id, input: $input) {
      ...VenueForm_venue
    }
  }
  ${venueFormFragment}
`;

const textFields = [
  'name',
  'slug',
  'description',
  'website',
  'listingsUrl',
  'capacity',
  'streetAddress',
  'city',
  'state',
  'postalCode',
];

/**
 * A venue's coordinates are saved as a pair. Parsing leaves out one that was emptied, and then
 * both are cleared, so the save looks the address up again.
 */
function pairCoordinates(input: Record<string, any>) {
  const { coordinates } = input;
  if (coordinates && (coordinates.latitude === undefined || coordinates.longitude === undefined)) {
    input.coordinates = { latitude: null, longitude: null };
  }
}

export function loadVenues({ gql: client, searchParams }: ListArgs) {
  return client.query<VenuesAdminQuery>(venuesQuery, listVariables(searchParams));
}

/** One of the list's boxes. Resolves to whether it saved. */
export function saveVenueFlag(args: FlagArgs) {
  return saveFlag({ ...args, mutation: updateVenueFlagMutation });
}

export function deleteVenues(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteVenueMutation });
}

export async function loadVenue({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  const data = await client.query<VenueEditQuery>(venueQuery, { id });
  // Every show, so the list beside the form doesn't stop at the first page
  const shows =
    data.venue && data.shows
      ? await withEveryPage(
          data.shows,
          async (after) =>
            (await client.query<VenueShowsAdminQuery>(venueShowsQuery, { after, id })).shows
        )
      : data.shows;
  return { ...data, shows };
}

export function createVenue(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createVenueMutation,
    createMutation: 'createVenue',
    textFields,
  });
}

export function updateVenue({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateVenueMutation,
    // An unchecked box isn't submitted, so these defaults clear them
    variables: { id, input: { excludeFromSearch: false, permanentlyClosed: false } },
    textFields,
    prepare: pairCoordinates,
  });
}
