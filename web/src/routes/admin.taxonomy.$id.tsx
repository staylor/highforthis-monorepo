import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import TaxonomyForm from '@/components/Admin/Taxonomy/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { Taxonomy, TaxonomyEditQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: taxQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: taxMutation,
    variables: { id: params.id },
  });
};

export default function TaxonomyEdit() {
  const data = useLoaderData<TaxonomyEditQuery>();
  const taxonomy = data.taxonomy as Taxonomy;
  return <TaxonomyForm data={taxonomy} heading="Edit Taxonomy" buttonLabel="Update Taxonomy" />;
}

const taxQuery = gql`
  query TaxonomyEdit($id: ObjID) {
    taxonomy(id: $id) {
      ...TaxonomyForm_taxonomy
    }
  }
  ${TaxonomyForm.fragments.taxonomy}
`;

const taxMutation = gql`
  mutation UpdateTaxonomy($id: ObjID!, $input: UpdateTaxonomyInput!) {
    updateTaxonomy(id: $id, input: $input) {
      ...TaxonomyForm_taxonomy
    }
  }
  ${TaxonomyForm.fragments.taxonomy}
`;
