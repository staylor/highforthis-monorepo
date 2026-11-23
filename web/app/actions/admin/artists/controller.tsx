import { css } from 'remix/component';
import { createController } from 'remix/router';

import { selectedMedia } from '#/actions/admin/media/data.ts';
import {
  backTo,
  backToList,
  renderAdminNotFound,
  renderAdminPage,
  type AdminContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import { isRedirect, type SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { ArtistEditQuery, ArtistsAdminQuery } from '#/types/graphql.ts';
import { EntityShows, PageLink } from '#/ui/admin/entity.tsx';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { FeaturedMedia } from '#/ui/admin/public/featured-media.tsx';
import { InlineToggle } from '#/ui/admin/public/inline-toggle.tsx';
import { pinkLink } from '#/ui/admin/public/styles.ts';
import { artworkUrl } from '#/ui/public/media.ts';

import {
  createArtist,
  deleteArtists,
  loadArtist,
  loadArtists,
  setArtistExcludeFromSearch,
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
    {
      label: t('entity.featuredMedia'),
      prop: 'featuredMedia',
      type: 'custom',
      render: () => (
        <FeaturedMedia
          name="featuredMedia"
          type="image"
          media={selectedMedia(artist?.featuredMedia)}
          buttonText={t('entity.setFeaturedMedia')}
          heading={t('media.heading')}
          closeLabel={t('admin.close')}
          loadingText={t('admin.loading')}
        />
      ),
    },
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
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
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
          render: (artist: ArtistRow) => {
            const href = artists.edit.index.href({ id: artist.id });
            return (
              <>
                <RowTitle href={href} title={artist.name} />
                <RowActions editHref={href} id={artist.id} />
              </>
            );
          },
        },
        { label: t('entity.slug'), render: (artist: ArtistRow) => artist.slug },
        {
          label: t('entity.excludeFromSearch'),
          styles: { textAlign: 'center' },
          render: (artist: ArtistRow) => (
            <InlineToggle
              intent="excludeFromSearch"
              name="excludeFromSearch"
              id={artist.id}
              checked={Boolean(artist.excludeFromSearch)}
              label={`${t('entity.excludeFromSearch')}: ${artist.name}`}
            />
          ),
        },
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
          {deleted > 0 && (
            <Message param="deleted" text={t('artists.deleted', { count: deleted })} />
          )}
          <Search placeholder={t('artists.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('artists.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete, and a row's "exclude from search" box
    // posts intent=excludeFromSearch with fetch, which only needs to hear whether it saved.
    // Apply with no action chosen posts an empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      const intent = formData.get('intent');
      if (intent === 'delete') {
        return backTo(await deleteArtists({ gql: context.admin.gql, formData, url: context.url }));
      }
      if (intent === 'excludeFromSearch') {
        const saved = await setArtistExcludeFromSearch({ gql: context.admin.gql, formData });
        return new Response(null, { status: saved ? 204 : 500 });
      }
      return backToList(context.url);
    },
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
  actions: {
    index: (context) => addPage(context),

    // Goes to the new artist's page, or shows the form again with what was entered
    async action(context) {
      const formData = await context.request.formData();
      const result = await createArtist({ gql: context.admin.gql, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : addPage(context, result);
    },
  },
});

async function editPage(context: AdminContext, id: string, failure?: SaveFailure) {
  const t = getAdminT();
  const { artist, shows } = await loadArtist({ gql: context.admin.gql, id });
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
  actions: {
    index: (context) => editPage(context, context.params.id),

    async action(context) {
      const { id } = context.params;
      const formData = await context.request.formData();
      const result = await updateArtist({ gql: context.admin.gql, id, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : editPage(context, id, result);
    },
  },
});
