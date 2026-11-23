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
import type { VenueEditQuery, VenuesAdminQuery } from '#/types/graphql.ts';
import { EntityShows, PageLink } from '#/ui/admin/entity.tsx';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { FeaturedMedia } from '#/ui/admin/public/featured-media.tsx';
import { InlineToggle } from '#/ui/admin/public/inline-toggle.tsx';
import { pinkLink, wideInput } from '#/ui/admin/public/styles.ts';
import { uploadUrl } from '#/ui/public/media.ts';
import { text } from '#/ui/public/styles.ts';

import {
  createVenue,
  deleteVenues,
  loadVenue,
  loadVenues,
  setVenueFlag,
  updateVenue,
  type VenueFlag,
} from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const venues = routes.admin.venues;

type VenueRow = NonNullable<VenuesAdminQuery['venues']>['edges'][number]['node'];
type Venue = NonNullable<VenueEditQuery['venue']>;

const flags = new Set<unknown>(['excludeFromSearch', 'permanentlyClosed'] satisfies VenueFlag[]);
const isFlag = (intent: unknown): intent is VenueFlag => flags.has(intent);

function thumbnail(venue: VenueRow) {
  const [media] = venue.featuredMedia ?? [];
  const crops = media && 'crops' in media ? [...(media.crops ?? [])] : [];
  const [smallest] = crops.sort((a, b) => a.width - b.width);
  if (!media || !('destination' in media) || !smallest) {
    return null;
  }
  return (
    <img
      mix={css({ width: '4rem' })}
      src={uploadUrl(media.destination, smallest.fileName)}
      alt=""
    />
  );
}

function venueFields(t: TFunction, venue?: Venue, values?: SaveFailure['values']): Field[] {
  // What a save that failed submitted, or what's saved
  const coordinates = values ? values.coordinates : venue?.coordinates;
  const coordinate = (axis: 'latitude' | 'longitude') => {
    const label = t(`venues.${axis}`);
    return (
      <input
        type="text"
        name={`coordinates[${axis}]`}
        value={String(coordinates?.[axis] ?? '')}
        placeholder={label}
        aria-label={label}
        mix={wideInput}
      />
    );
  };
  return [
    { label: t('entity.name'), prop: 'name', required: true },
    // The slug comes from the name when the venue is added
    ...(venue?.slug ? [{ label: t('entity.slug'), prop: 'slug', required: true }] : []),
    { label: t('entity.description'), prop: 'description', type: 'textarea' },
    { label: t('entity.website'), prop: 'website' },
    {
      label: t('venues.listingsUrl'),
      prop: 'listingsUrl',
      inputType: 'url',
      placeholder: t('venues.listingsUrlPlaceholder'),
    },
    { label: t('venues.capacity'), prop: 'capacity' },
    { label: t('venues.streetAddress'), prop: 'streetAddress', type: 'textarea' },
    { label: t('venues.city'), prop: 'city' },
    { label: t('venues.state'), prop: 'state' },
    { label: t('venues.postalCode'), prop: 'postalCode' },
    {
      label: t('venues.coordinates'),
      prop: 'coordinates',
      type: 'custom',
      render: () => (
        <>
          {coordinate('latitude')}
          {coordinate('longitude')}
        </>
      ),
    },
    {
      label: t('entity.featuredMedia'),
      prop: 'featuredMedia',
      type: 'custom',
      render: () => (
        <FeaturedMedia
          name="featuredMedia"
          type="image"
          media={selectedMedia(venue?.featuredMedia)}
          buttonText={t('entity.setFeaturedMedia')}
          heading={t('media.heading')}
          closeLabel={t('admin.close')}
          loadingText={t('admin.loading')}
        />
      ),
    },
    { label: t('entity.excludeFromSearch'), prop: 'excludeFromSearch', type: 'checkbox' },
    { label: t('venues.permanentlyClosed'), prop: 'permanentlyClosed', type: 'checkbox' },
  ];
}

export const venuesList = createController(venues.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { venues: connection } = await loadVenues({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
      const toggle = (flag: VenueFlag, label: string) => ({
        label,
        styles: { textAlign: 'center' },
        render: (venue: VenueRow) => (
          <InlineToggle
            intent={flag}
            name={flag}
            id={venue.id}
            checked={Boolean(venue[flag])}
            label={`${label}: ${venue.name}`}
          />
        ),
      });
      const columns = [
        { styles: { width: '4rem' }, render: thumbnail },
        {
          label: t('entity.name'),
          render: (venue: VenueRow) => {
            const href = venues.edit.index.href({ id: venue.id });
            return (
              <>
                <RowTitle href={href} title={venue.name} />
                <RowActions editHref={href} id={venue.id} />
              </>
            );
          },
        },
        { label: t('entity.slug'), render: (venue: VenueRow) => venue.slug },
        {
          label: t('entity.website'),
          render: (venue: VenueRow) =>
            venue.website && (
              <a mix={pinkLink} href={venue.website} target="_blank" rel="noreferrer">
                {venue.website}
              </a>
            ),
        },
        { label: t('venues.capacity'), render: (venue: VenueRow) => venue.capacity },
        { label: t('venues.address'), render: (venue: VenueRow) => venue.address },
        toggle('excludeFromSearch', t('entity.excludeFromSearch')),
        toggle('permanentlyClosed', t('venues.permanentlyClosed')),
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('venues.heading')}</Heading>
          <HeaderAdd href={venues.add.index.href()} label={t('venues.add')} />
          {deleted > 0 && (
            <Message param="deleted" text={t('venues.deleted', { count: deleted })} />
          )}
          <Search placeholder={t('venues.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('venues.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete, and a row's boxes post their flag as the
    // intent with fetch, which only needs to hear whether it saved. Apply with no action chosen
    // posts an empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      const intent = formData.get('intent');
      if (intent === 'delete') {
        return backTo(await deleteVenues({ gql: context.admin.gql, formData, url: context.url }));
      }
      if (isFlag(intent)) {
        const saved = await setVenueFlag({ gql: context.admin.gql, flag: intent, formData });
        return new Response(null, { status: saved ? 204 : 500 });
      }
      return backToList(context.url);
    },
  },
});

function addPage(context: AdminPageContext, failure?: SaveFailure) {
  const t = getAdminT();
  const label = t('venues.add');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <HeaderAdd href={venues.list.index.href()} label={t('venues.all')} />
      <AdminForm
        fields={venueFields(t, undefined, failure?.values)}
        failure={failure}
        buttonLabel={label}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const venuesAdd = createController(venues.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index: (context) => addPage(context),

    // Goes to the new venue's page, or shows the form again with what was entered
    async action(context) {
      const formData = await context.request.formData();
      const result = await createVenue({ gql: context.admin.gql, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : addPage(context, result);
    },
  },
});

async function editPage(context: AdminContext, id: string, failure?: SaveFailure) {
  const t = getAdminT();
  const { venue, shows } = await loadVenue({ gql: context.admin.gql, id });
  if (!venue) {
    return renderAdminNotFound(context);
  }
  const label = t('venues.edit');
  const venueShows = (shows?.edges ?? []).map(({ node }) => ({
    id: node.id,
    date: node.date,
    name: node.title || node.artists.map((artist) => artist.name).join(' / '),
  }));
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <HeaderAdd href={venues.list.index.href()} label={t('venues.all')} />
      <PageLink href={routes.venue.href({ slug: venue.slug })}>{t('venues.view')}</PageLink>
      {venue.listingsUrl && (
        <a
          href={routes.admin.shows.listings.index.href({ venueId: venue.id })}
          mix={[pinkLink, css({ display: 'inline-block', ...text.sm })]}
        >
          {t('shows.listings.view')}
        </a>
      )}
      <Message text={t('venues.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={venueFields(t, venue, failure?.values)}
        data={venue}
        failure={failure}
        buttonLabel={label}
        meta={venueShows.length > 0 && <EntityShows shows={venueShows} />}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const venuesEdit = createController(venues.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index: (context) => editPage(context, context.params.id),

    async action(context) {
      const { id } = context.params;
      const formData = await context.request.formData();
      const result = await updateVenue({ gql: context.admin.gql, id, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : editPage(context, id, result);
    },
  },
});
