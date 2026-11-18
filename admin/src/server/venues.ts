import { gql } from 'graphql-tag';

import { venueFormFragment } from '#/components/Admin/Venue/Form.graphql';
import type { UpdateVenueExcludeMutation, VenueEditQuery, VenuesAdminQuery } from '#/types/graphql';
import { addPageOffset, addSearchParam } from '#/utils/listVariables';

import { deleteSelected, parseForm, submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

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
  mutation UpdateVenueExclude($id: String!, $input: UpdateVenueInput!) {
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
          venue {
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

// String fields in the schema that a form can fill with digits
const skipKeys = ['capacity', 'postalCode'];

export function loadVenues({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return gql.query<VenuesAdminQuery>(venuesQuery, variables);
}

// The list's "exclude from search" and "permanently closed" checkboxes, named by formAction
export function setVenueFlag({ gql, formData }: { gql: GraphQLClient; formData: FormData }) {
  const { id, excludeFromSearch, permanentlyClosed, formAction } = parseForm(formData);
  let input;
  if (formAction === 'excludeFromSearch') {
    input = { excludeFromSearch };
  } else if (formAction === 'permanentlyClosed') {
    input = { permanentlyClosed };
  }
  return gql.mutate<UpdateVenueExcludeMutation>(updateVenueFlagMutation, { id, input });
}

export function deleteVenues(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteVenueMutation });
}

export function loadVenue({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<VenueEditQuery>(venueQuery, { id });
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
    // the form leaves out empty fields and unchecked boxes, so these defaults clear them
    variables: {
      id,
      input: { excludeFromSearch: false, listingsUrl: null, permanentlyClosed: false },
    },
    skipKeys,
  });
}
