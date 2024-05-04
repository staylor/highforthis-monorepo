import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, Thumbnail, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import Search from '@/components/Admin/ListTable/Search';
import query, { addPageOffset, addSearchParam } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Artist, ArtistConnection, ArtistsAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';

export const loader: LoaderFunction = ({ request, context, params }) => {
  const variables = addSearchParam(request, addPageOffset(params));

  return query({
    request,
    context,
    query: artistsQuery,
    variables,
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: artistsMutation });
};

export default function Artists() {
  const path = usePath();
  const data = useLoaderData<ArtistsAdminQuery>();
  const artists = data.artists as ArtistConnection;

  let columns: Columns = [
    {
      className: 'w-16',
      render: (artist: Artist) => {
        if (artist.featuredMedia?.[0] && artist.featuredMedia[0].type === 'image') {
          return <Thumbnail media={artist.featuredMedia[0]} />;
        }

        return null;
      },
    },
    {
      label: 'Name',
      render: (artist: Artist) => {
        const urlPath = `${path}/${artist.id}`;

        return (
          <>
            <RowTitle url={urlPath} title={artist.name} />
            <RowActions
              actions={[
                { type: 'edit', url: urlPath },
                { type: 'delete', url: urlPath, ids: [artist.id] },
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
      render: (artist: Artist) =>
        artist?.website && (
          <a className="text-pink underline" href={artist.website} target="_blank" rel="noreferrer">
            {artist.website}
          </a>
        ),
    },
  ];

  return (
    <>
      <Heading>Artists</Heading>
      <HeaderAdd label="Add Artist" />
      <Message param="deleted" text="Deleted %s Artists." />
      <Search placeholder="Search Artists" />
      <ListTable columns={columns} data={artists} />
    </>
  );
}

const artistsQuery = gql`
  query ArtistsAdmin($after: String, $first: Int, $search: String) {
    artists(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
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

const artistsMutation = gql`
  mutation DeleteArtist($ids: [ObjID]!) {
    removeArtist(ids: $ids)
  }
`;
