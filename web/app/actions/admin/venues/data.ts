import { gql } from 'graphql-tag';

import {
  deleteSelected,
  parseForm,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '../../../lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '../../../lib/admin/list-variables.ts';
import type {
  UpdateVenueFlagMutation,
  VenueEditQuery,
  VenuesAdminQuery,
} from '../../../types/graphql.ts';
import { featuredMediaFragment } from '../media/data.ts';

const venueFormFragment = gql`
  fragment VenueForm_venue on Venue {
    capacity
    city
    coordinates {
      latitude
      longitude
    }
    description
    excludeFromSearch
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    listingsUrl
    name
    permanentlyClosed
    postalCode
    slug
    state
    streetAddress
    website
  }
  ${featuredMediaFragment}
`;

const venuesQuery = gql`
  query VenuesAdmin($after: String, $first: Int, $search: String) {
    venues(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          address
          capacity
          excludeFromSearch
          featuredMedia {
            ... on ImageUpload {
              crops {
                fileName
                width
              }
              destination
              id
              type
            }
          }
          id
          name
          permanentlyClosed
          slug
          website
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
          artists {
            id
            name
          }
          date
          id
          title
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

// String fields in the schema that a form can fill with digits
const skipKeys = ['name', 'slug', 'capacity', 'postalCode'];

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
  const fields = parseForm(formData);
  const result = await client.mutate<UpdateVenueFlagMutation>(updateVenueFlagMutation, {
    id: fields.id,
    input: { [flag]: fields[flag] === true },
  });
  return Boolean(result.updateVenue);
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
    skipKeys,
  });
}

export function updateVenue({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateVenueMutation,
    // The form leaves out empty fields and unchecked boxes, so these defaults clear them
    variables: {
      id,
      input: { excludeFromSearch: false, listingsUrl: null, permanentlyClosed: false },
    },
    skipKeys,
  });
}
