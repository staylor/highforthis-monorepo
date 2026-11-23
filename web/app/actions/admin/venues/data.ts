import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import { attempt } from '#/lib/graphql.ts';
import type { UpdateVenueFlagMutation, VenueEditQuery, VenuesAdminQuery } from '#/types/graphql.ts';

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

const venueQuery = gql`
  query VenueEdit($id: String) {
    shows(first: 200, venue: { id: $id }) {
      edges {
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
    }
    venue(id: $id) {
      ...VenueForm_venue
    }
  }
  ${venueFormFragment}
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

const coordinateFields = ['coordinates[latitude]', 'coordinates[longitude]'];

/**
 * A venue's coordinates are saved as a pair. When the form has either one emptied, both are
 * cleared, and the save looks the address up again.
 */
function clearedCoordinates(formData: FormData) {
  const submitted = coordinateFields.map((name) => formData.get(name));
  if (submitted.includes(null) || submitted.every((value) => String(value).trim())) {
    return {};
  }
  coordinateFields.forEach((name) => formData.delete(name));
  return { coordinates: { latitude: null, longitude: null } };
}

export function loadVenues({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return client.query<VenuesAdminQuery>(venuesQuery, variables);
}

/** The flags the list's boxes save, each posted as the intent and the field. */
export type VenueFlag = 'excludeFromSearch' | 'permanentlyClosed';

/** One of the list's boxes. Resolves to whether it saved. */
export async function setVenueFlag({
  gql: client,
  flag,
  formData,
}: {
  gql: GraphQLClient;
  flag: VenueFlag;
  formData: FormData;
}) {
  const { data } = await attempt(
    client.mutate<UpdateVenueFlagMutation>(updateVenueFlagMutation, {
      id: formData.get('id'),
      input: { [flag]: formData.get(flag) === 'true' },
    })
  );
  return Boolean(data?.updateVenue);
}

export function deleteVenues(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteVenueMutation });
}

export function loadVenue({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<VenueEditQuery>(venueQuery, { id });
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
    variables: {
      id,
      // An unchecked box isn't submitted, so these defaults clear them
      input: {
        excludeFromSearch: false,
        permanentlyClosed: false,
        ...clearedCoordinates(args.formData),
      },
    },
    textFields,
  });
}
