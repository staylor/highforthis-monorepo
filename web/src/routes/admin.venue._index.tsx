import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, Thumbnail, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Venue, VenueConnection, VenuesAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: venuesQuery,
    variables: addPageOffset(params),
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: venuesMutation });
};

export default function Venues() {
  const path = usePath();
  const data = useLoaderData<VenuesAdminQuery>();
  const venues = data.venues as VenueConnection;

  let columns: Columns = [
    {
      className: 'w-16',
      render: (venue: Venue) => {
        if (venue.featuredMedia?.[0] && venue.featuredMedia[0].type === 'image') {
          return <Thumbnail media={venue.featuredMedia[0]} />;
        }

        return null;
      },
    },
    {
      label: 'Name',
      render: (venue: Venue) => {
        const urlPath = `${path}/${venue.id}`;

        return (
          <>
            <RowTitle url={urlPath} title={venue.name} />
            <RowActions
              actions={[
                { type: 'edit', url: urlPath },
                { type: 'delete', url: urlPath, ids: [venue.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Slug',
      prop: 'slug',
    },
    {
      label: 'Website',
      prop: 'website',
      render: (venue: Venue) =>
        venue?.website && (
          <a className="text-pink underline" href={venue.website} target="_blank" rel="noreferrer">
            {venue.website}
          </a>
        ),
    },
    {
      label: 'Capacity',
      prop: 'capacity',
    },
    {
      label: 'Address',
      prop: 'address',
    },
  ];

  return (
    <>
      <Heading>Venues</Heading>
      <HeaderAdd label="Add Venue" />
      <Message param="deleted" text="Deleted %s Venues." />
      <ListTable columns={columns} data={venues} />
    </>
  );
}

const venuesQuery = gql`
  query VenuesAdmin($after: String, $first: Int, $search: String) {
    venues(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          address
          capacity
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

const venuesMutation = gql`
  mutation DeleteVenue($ids: [ObjID]!) {
    removeVenue(ids: $ids)
  }
`;
