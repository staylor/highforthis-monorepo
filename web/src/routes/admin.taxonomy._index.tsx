import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { TaxonomiesAdminQuery, Taxonomy, TaxonomyConnection } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context }) => {
  return query({ request, context, query: taxQuery });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: taxMutation });
};

export default function Taxonomies() {
  const path = usePath();
  const data = useLoaderData<TaxonomiesAdminQuery>();
  const taxonomies = data.taxonomies as TaxonomyConnection;

  const columns = [
    {
      label: 'Name',
      render: (taxonomy: Taxonomy) => {
        const taxonomyUrl = `${path}/${taxonomy.id}`;
        return (
          <>
            <RowTitle url={taxonomyUrl} title={taxonomy.name} />
            <RowActions
              actions={[
                { type: 'edit', url: taxonomyUrl },
                { type: 'delete', url: taxonomyUrl, ids: [taxonomy.id] },
              ]}
            />
          </>
        );
      },
    },
  ];

  return (
    <>
      <Heading>Taxonomies</Heading>
      <HeaderAdd label="Taxonomy" />
      <Message param="deleted" text="Deleted %s taxonomies." />
      <ListTable columns={columns} data={taxonomies} />
    </>
  );
}

const taxQuery = gql`
  query TaxonomiesAdmin {
    taxonomies @cache(key: "admin") {
      count
      edges {
        node {
          description
          id
          name
          slug
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const taxMutation = gql`
  mutation DeleteTaxonomy($ids: [ObjID]!) {
    removeTaxonomy(ids: $ids)
  }
`;
