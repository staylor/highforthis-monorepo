import { css } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { isRedirect, type GraphQLClient } from '../../../lib/admin/forms.ts';
import { getAdminT, type TFunction } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import type { VenueListingsAdminQuery } from '../../../types/graphql.ts';
import { Message } from '../../../ui/admin/message.tsx';
import { Alert, Heading } from '../../../ui/admin/page.tsx';
import { ListingsForm, type ListingRow } from '../../../ui/admin/public/listings-form.tsx';
import { NavigateSelect } from '../../../ui/admin/public/navigate-select.tsx';
import { renderAdminPage } from '../render-page.tsx';
import type { AdminPageContext } from '../render-page.tsx';

import { importListings, loadVenueListings } from './listings-data.ts';

// A venue's upcoming shows from its listings page (Bowery Presents or Ticketmaster), to pick
// from and add to the shows with their artists. Choosing a venue goes to
// /admin/show/listings/:venueId.

const listingsRoute = routes.admin.shows.listings;

type VenueListings = NonNullable<VenueListingsAdminQuery['venueListings']>;
type Listing = VenueListings['listings'][number];

/** A listing's day, such as "Sat, 8/15/26". Noon keeps the calendar day in every time zone. */
function formatDay(localDate: string) {
  return new Date(`${localDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

/** A listing's time, such as "8:00 PM", from its local 20:00:00. */
function formatTime(localTime: string) {
  const [hours, minutes] = localTime.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** What the table needs for each listing, translated and formatted here. */
function listingRow(t: TFunction, listing: Listing): ListingRow {
  const day = listing.localDate ? formatDay(listing.localDate) : t('shows.listings.dateTbd');
  const listed = [...listing.headliners, ...listing.support];
  let tickets: ListingRow['tickets'] = { text: listing.status ?? '', href: null };
  if (listing.cancelled) {
    tickets = { text: t('shows.listings.cancelled'), href: null };
  } else if (listing.url) {
    tickets = { text: listing.status || t('shows.listings.tickets'), href: listing.url };
  }
  return {
    sourceId: listing.sourceId,
    day,
    time: listing.localTime ? formatTime(listing.localTime) : null,
    artists: listing.headliners.join('; '),
    listed: listed.join(', '),
    support: listing.support,
    pills: listed.map((name) => {
      const isNew = listing.newArtists.includes(name);
      return {
        name,
        isNew,
        text: isNew ? t('shows.listings.newName', { name }) : name,
        title: t(isNew ? 'shows.listings.newArtist' : 'shows.listings.existingArtist'),
      };
    }),
    canAdd: !listing.show && Boolean(listing.localDate) && !listing.cancelled,
    tickets,
    showHref: listing.show ? routes.admin.shows.edit.index.href({ id: listing.show.id }) : null,
    dateChanged: Boolean(listing.dateChanged),
    selectLabel: t('shows.listings.select', { date: day }),
    artistsLabel: t('shows.listings.artistsFor', { date: day }),
  };
}

async function renderListingsPage(
  context: AdminPageContext & { admin: { gql: GraphQLClient } },
  venueId: string | undefined,
  options: { failed?: boolean } = {}
) {
  const t = getAdminT();
  const { venues, venueListings } = await loadVenueListings({ gql: context.admin.gql, venueId });
  const choices = (venues?.edges ?? [])
    .map(({ node }) => node)
    .filter(({ listingsUrl }) => listingsUrl)
    .map(({ id, name }) => ({ label: name, href: listingsRoute.index.href({ venueId: id }) }));
  const added = Number(context.url.searchParams.get('added') || 0);
  const label = t('shows.listings.heading');

  let table = null;
  if (venueListings?.error) {
    table = <Alert>{venueListings.error}</Alert>;
  } else if (venueListings) {
    const listings = venueListings.listings.map((listing) => listingRow(t, listing));
    const addable = listings.filter((listing) => listing.canAdd).length;
    table = (
      <ListingsForm
        listings={listings}
        summary={t('shows.listings.summary', {
          source: t(`shows.listings.source.${venueListings.source}`),
          count: listings.length,
        })}
        labels={{
          hideAdded: t('shows.listings.hideAdded'),
          add: Array.from({ length: addable + 1 }, (_, count) =>
            t('shows.listings.add', { count })
          ),
          empty: t('shows.listings.empty'),
          date: t('shows.listings.date'),
          artists: t('shows.listings.artists'),
          tickets: t('shows.listings.tickets'),
          inYourData: t('shows.listings.inYourData'),
          added: t('shows.listings.added'),
          dateChanged: t('shows.listings.dateChanged'),
          addSupport: t('shows.listings.addSupport', { names: '{{names}}' }),
        }}
      />
    );
  }

  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      {choices.length === 0 ? (
        <p
          mix={css({ marginBlock: '1rem', fontSize: '0.875rem', lineHeight: 'calc(1.25 / 0.875)' })}
        >
          {t('shows.listings.noVenues')}
        </p>
      ) : (
        <div mix={css({ marginBottom: '1rem' })}>
          <NavigateSelect
            value={venueId ? listingsRoute.index.href({ venueId }) : ''}
            placeholder={t('shows.listings.chooseVenue')}
            choices={choices}
          />
        </div>
      )}
      {added > 0 && (
        <Message
          param="added"
          text={t('shows.listings.success', {
            count: added,
            artistsCreated: Number(context.url.searchParams.get('artistsCreated') || 0),
          })}
        />
      )}
      {options.failed && <Alert>{t('shows.listings.failed')}</Alert>}
      {table}
    </>,
    { title: label, status: options.failed ? 502 : undefined }
  );
}

export const showListings = createController(listingsRoute, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      return renderListingsPage(context, context.params.venueId);
    },

    // Adds the picked listings, then comes back to the venue's listings, which say how many
    async action(context) {
      const { venueId } = context.params;
      if (!venueId) {
        return createRedirectResponse(listingsRoute.index.href(), 303);
      }
      const formData = await context.request.formData();
      const result = await importListings({ gql: context.admin.gql, venueId, formData });
      if (isRedirect(result)) {
        return createRedirectResponse(result.redirectTo, 303);
      }
      return renderListingsPage(context, venueId, { failed: true });
    },
  },
});
