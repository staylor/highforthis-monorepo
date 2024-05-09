import { gql } from 'graphql-tag';
import { useFetcher, useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, Thumbnail, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import Search from '@/components/Admin/ListTable/Search';
import query, { addPageOffset, addSearchParam } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Artist, ArtistConnection, ArtistsAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';
import Checkbox from '@/components/Form/Checkbox';
import mutate, { parseFormData } from '@/utils/mutate';

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
  if (request.method === 'POST') {
    const { id, excludeFromSearch } = await parseFormData(request);
    return mutate({
      context,
      mutation: updateMutation,
      variables: {
        id,
        input: {
          excludeFromSearch,
        },
      },
    });
  }
  return handleDelete({ request, context, mutation: deleteMutation });
};

export default function Artists() {
  const fetcher = useFetcher();
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
      label: 'Exclude from search',
      className: 'text-center',
      render: ({ id, excludeFromSearch }: Artist) => {
        return (
          <Checkbox
            checked={Boolean(excludeFromSearch)}
            onChange={(e) => {
              fetcher.submit(
                {
                  id,
                  excludeFromSearch: e.target.checked,
                },
                {
                  method: 'POST',
                }
              );
            }}
          />
        );
      },
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

const updateMutation = gql`
  mutation UpdateArtistExclude($id: ObjID!, $input: UpdateArtistInput!) {
    updateArtist(id: $id, input: $input) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteArtist($ids: [ObjID]!) {
    removeArtist(ids: $ids)
  }
`;
