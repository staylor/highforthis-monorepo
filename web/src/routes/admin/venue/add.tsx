import { gql } from 'graphql-tag';

import VenueForm from '~/components/Admin/Venue/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: venueMutation,
    createMutation: 'createVenue',
    parseFormDataArgs: { skipKeys: ['capacity', 'postalCode'] },
  });
}

export default function VenueAdd() {
  const label = 'Add Venue';
  return <VenueForm heading={label} buttonLabel={label} />;
}

const venueMutation = gql`
  mutation CreateVenue($input: CreateVenueInput!) {
    createVenue(input: $input) {
      ...VenueForm_venue
    }
  }
  ${VenueForm.fragments.venue}
`;
