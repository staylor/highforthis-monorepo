import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import VenueForm from '@/components/Admin/Venue/Form';
import type { VenueEditQuery } from '@/types/graphql';
import { handleSubmission } from '@/utils/action';
import query from '@/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: venueQuery,
    variables: { id: params.id },
  });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: venueMutation,
    variables: { id: params.id, input: { excludeFromSearch: false, permanentlyClosed: false } },
    parseFormDataArgs: { skipKeys: ['capacity', 'postalCode'] },
  });
};

export default function VenueEdit() {
  const data = useLoaderData<VenueEditQuery>();
  const label = 'Edit Venue';
  return <VenueForm data={data} heading={label} buttonLabel={label} />;
}

const venueQuery = gql`
  query VenueEdit($id: ObjID) {
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
  ${VenueForm.fragments.venue}
`;

const venueMutation = gql`
  mutation UpdateVenue($id: ObjID!, $input: UpdateVenueInput!) {
    updateVenue(id: $id, input: $input) {
      ...VenueForm_venue
    }
  }
  ${VenueForm.fragments.venue}
`;
