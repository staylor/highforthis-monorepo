import cn from 'classnames';
import { gql } from 'graphql-tag';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, redirect, useLocation, useNavigation } from 'react-router';

import Search from '#/components/Admin/ListTable/Search';
import { Alert, Heading } from '#/components/Admin/styles';
import Button from '#/components/Button';
import type { AlbumCoversAdminQuery } from '#/types/graphql';
import mutate from '#/utils/mutate';
import query from '#/utils/query';

import type { Route } from './+types/album-covers';

type Album = AlbumCoversAdminQuery['appleMusicAlbums']['albums'][number];

export async function loader({ request, context, url }: Route.LoaderArgs) {
  const term = url.searchParams.get('search')?.trim();
  if (!term) {
    return { appleMusicAlbums: null };
  }
  return query<AlbumCoversAdminQuery>({
    request,
    context,
    query: albumsQuery,
    variables: { term },
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const ids = formData.getAll('selected').map(String);
  const result = await mutate({ context, request, mutation: addMutation, variables: { ids } });
  const added: { id: string }[] | undefined = result.addAlbumCovers;
  if (!added) {
    return { failed: true };
  }
  return redirect(`/admin/media?added=${added.length}`);
}

function Covers({ albums }: { albums: Album[] }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);

  if (albums.length === 0) {
    return <p className="my-10">{t('media.albumCovers.empty')}</p>;
  }

  const submitting = navigation.state === 'submitting';
  const onToggle = (id: string, checked: boolean) =>
    setSelected((ids) => (checked ? [...ids, id] : ids.filter((selectedId) => selectedId !== id)));

  return (
    <Form method="post">
      <Button
        buttonType="primary"
        type="submit"
        disabled={selected.length === 0 || submitting}
        className="mb-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? t('media.albumCovers.adding')
          : t('media.albumCovers.add', { count: selected.length })}
      </Button>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {albums.map(({ id, name, artistName, releaseDate, cover, artwork }) => {
          const checked = selected.includes(id);
          const details = [
            releaseDate?.slice(0, 4),
            artwork.width && artwork.height && `${artwork.width} × ${artwork.height}`,
          ]
            .filter(Boolean)
            .join(' · ');
          return (
            <li key={id}>
              <label
                className={cn(
                  'grid h-full cursor-pointer grid-cols-[auto_1fr] content-start gap-x-2 rounded-sm border-2 p-1.5 text-sm',
                  checked ? 'border-pink' : 'border-transparent hover:border-detail'
                )}
              >
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  className="col-span-2 mb-2 aspect-square w-full bg-neutral-100 object-cover dark:bg-neutral-800"
                />
                <input
                  type="checkbox"
                  name="selected"
                  value={id}
                  checked={checked}
                  onChange={(e) => onToggle(id, e.target.checked)}
                  className="mt-0.5 rounded-sm border-gray-300 text-pink shadow-sm focus:ring-pink"
                />
                <span className="min-w-0">
                  <strong className="block">{name}</strong>
                  {artistName}
                  <small className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {details}
                  </small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Form>
  );
}

export default function AlbumCovers({ loaderData, actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const results = loaderData.appleMusicAlbums;

  return (
    <>
      <Heading>{t('media.albumCovers.heading')}</Heading>
      <Search placeholder={t('media.albumCovers.search')} />
      <div className="clear-both">
        {actionData?.failed && <Alert>{t('media.albumCovers.failed')}</Alert>}
        {results?.error && <Alert>{results.error}</Alert>}
        {!results && <p className="my-4 text-sm">{t('media.albumCovers.hint')}</p>}
        {results && !results.error && (
          // a new search starts a fresh selection
          <Covers key={location.key} albums={results.albums} />
        )}
      </div>
    </>
  );
}

const albumsQuery = gql`
  query AlbumCoversAdmin($term: String!) {
    appleMusicAlbums(term: $term) {
      albums {
        id
        name
        artistName
        releaseDate
        cover(size: 600)
        artwork {
          width
          height
        }
      }
      error
    }
  }
`;

const addMutation = gql`
  mutation AddAlbumCovers($ids: [String!]!) {
    addAlbumCovers(ids: $ids) {
      id
    }
  }
`;
