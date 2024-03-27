import { gql } from 'graphql-tag';
import type { ActionFunction } from '@remix-run/server-runtime';

import TaxonomyForm from '@/components/Admin/Taxonomy/Form';
import { handleSubmission } from '@/utils/action';

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: taxMutation,
    createMutation: 'createTaxonomy',
  });
};

export default function TaxonomyAdd() {
  return <TaxonomyForm heading="Add Taxonomy" buttonLabel="Add Taxonomy" />;
}

const taxMutation = gql`
  mutation CreateTaxonomy($input: CreateTaxonomyInput!) {
    createTaxonomy(input: $input) {
      ...TaxonomyForm_taxonomy
    }
  }
  ${TaxonomyForm.fragments.taxonomy}
`;
