import { gql } from 'graphql-tag';

import VenueForm from '~/components/Admin/Venue/Form';
import type { VenueEditQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<VenueEditQuery>({
    request,
    context,
    query: venueQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: venueMutation,
    variables: { id: params.id, input: { excludeFromSearch: false, permanentlyClosed: false } },
    parseFormDataArgs: { skipKeys: ['capacity', 'postalCode'] },
  });
}

export default function VenueEdit({ loaderData }: Route.ComponentProps) {
  const label = 'Edit Venue';
  return <VenueForm data={loaderData} heading={label} buttonLabel={label} />;
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
