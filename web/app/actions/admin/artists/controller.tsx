import { css } from 'remix/component';
import { createController } from 'remix/router';

import { mediaField } from '#/actions/admin/media/field.tsx';
import {
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminEditContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { ArtistEditQuery, ArtistsAdminQuery } from '#/types/graphql.ts';
import { EntityShows, PageLink } from '#/ui/admin/entity.tsx';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, Search, TitleCell, toggleColumn } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { pinkLink } from '#/ui/admin/public/styles.ts';
import { artworkUrl } from '#/ui/public/media.ts';

import {
  createArtist,
  deleteArtists,
  loadArtist,
  loadArtists,
  saveArtistFlag,
  updateArtist,
} from './data.ts';

const block = css({ display: 'block' });

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const artists = routes.admin.artists;

type ArtistRow = NonNullable<ArtistsAdminQuery['artists']>['edges'][number]['node'];
type Artist = NonNullable<ArtistEditQuery['artist']>;

function artistFields(t: TFunction, artist?: Artist): Field[] {
  const artwork = artist?.appleMusic?.artwork?.url;
  return [
    ...(artwork
      ? [
          {
            label: '',
            prop: 'artwork',
            type: 'custom' as const,
            render: () => (
              <img
                src={artworkUrl(artwork, 300)}
                alt={artist?.name}
                mix={css({ marginBlock: '1rem', borderRadius: '0.25rem' })}
              />
            ),
          },
        ]
      : []),
    { label: t('entity.name'), prop: 'name', required: true },
    // The slug comes from the name when the artist is added
    ...(artist?.slug ? [{ label: t('entity.slug'), prop: 'slug', required: true }] : []),
    { label: t('entity.description'), prop: 'description', type: 'textarea' },
    { label: t('entity.website'), prop: 'website' },
    mediaField({
      label: t('entity.featuredMedia'),
      prop: 'featuredMedia',
      media: artist?.featuredMedia,
      buttonText: t('entity.setFeaturedMedia'),
    }),
    { label: t('entity.excludeFromSearch'), prop: 'excludeFromSearch', type: 'checkbox' },
  ];
}

export const artistsList = createController(artists.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { artists: connection } = await loadArtists({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const columns = [
        {
          styles: { width: '4rem' },
          render: (artist: ArtistRow) => {
            const artwork = artist.appleMusic?.artwork?.url;
            if (!artwork) {
              return null;
            }
            const image = (
              <img
                src={artworkUrl(artwork, 44)}
                alt={artist.name}
                width={44}
                height={44}
                loading="lazy"
                mix={block}
              />
            );
            return artist.appleMusic?.url ? (
              <a href={artist.appleMusic.url} target="_blank" rel="noreferrer" mix={block}>
                {image}
              </a>
            ) : (
              image
            );
          },
        },
        {
          label: t('entity.name'),
          render: (artist: ArtistRow) => (
            <TitleCell
              href={artists.edit.index.href({ id: artist.id })}
              title={artist.name}
              id={artist.id}
            />
          ),
        },
        { label: t('entity.slug'), render: (artist: ArtistRow) => artist.slug },
        toggleColumn(
          'excludeFromSearch',
          t('entity.excludeFromSearch'),
          (artist: ArtistRow) => artist.name
        ),
        {
          label: t('entity.website'),
          render: (artist: ArtistRow) =>
            artist.website && (
              <a mix={pinkLink} href={artist.website} target="_blank" rel="noreferrer">
                {artist.website}
              </a>
            ),
        },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('artists.heading')}</Heading>
          <HeaderAdd href={artists.add.index.href()} label={t('artists.add')} />
          <Message param="deleted" text={(count) => t('artists.deleted', { count })} />
          <Search placeholder={t('artists.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('artists.heading') }
      );
    },

    action: listAction(deleteArtists, { flags: ['excludeFromSearch'], save: saveArtistFlag }),
  },
});

function addPage(context: AdminPageContext, failure?: SaveFailure) {
  const t = getAdminT();
  const label = t('artists.add');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <HeaderAdd href={artists.list.index.href()} label={t('artists.all')} />
      <AdminForm fields={artistFields(t)} failure={failure} buttonLabel={label} />
    </>,
    { title: label, status: failure?.status }
  );
}

export const artistsAdd = createController(artists.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(addPage, createArtist),
});

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { artist, shows } = await loadArtist({ gql: context.admin.gql, id: context.params.id });
  if (!artist) {
    return renderAdminNotFound(context);
  }
  const label = t('artists.edit');
  const artistShows = (shows?.edges ?? []).map(({ node }) => ({
    id: node.id,
    date: node.date,
    name: node.venue?.name ?? '',
  }));
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <HeaderAdd href={artists.list.index.href()} label={t('artists.all')} />
      <PageLink href={routes.artist.href({ slug: artist.slug })}>{t('artists.view')}</PageLink>
      <Message text={t('artists.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={artistFields(t, artist)}
        data={artist}
        failure={failure}
        buttonLabel={label}
        meta={artistShows.length > 0 && <EntityShows shows={artistShows} />}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const artistsEdit = createController(artists.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updateArtist),
});
