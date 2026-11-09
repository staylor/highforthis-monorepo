import cn from 'classnames';
import { gql } from 'graphql-tag';
import type { PropsWithChildren, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Form,
  redirect,
  useLocation,
  useNavigate,
  useNavigation,
  useSearchParams,
} from 'react-router';

import { Heading } from '#/components/Admin/styles';
import Button from '#/components/Button';
import Message from '#/components/Form/Message';
import Select from '#/components/Form/Select';
import { inputBase } from '#/components/Form/styles';
import Link from '#/components/Link';
import type { VenueListingsAdminQuery } from '#/types/graphql';
import mutate from '#/utils/mutate';
import query from '#/utils/query';

import type { Route } from './+types/listings';

type VenueListings = NonNullable<VenueListingsAdminQuery['venueListings']>;
type Listing = VenueListings['listings'][number];

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<VenueListingsAdminQuery>({
    request,
    context,
    query: listingsQuery,
    variables: { venueId: params.venueId ?? '', withListings: Boolean(params.venueId) },
  });
}

const splitArtists = (value: string) =>
  value
    .split(';')
    .map((name) => name.trim())
    .filter(Boolean);

export async function action({ request, context, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = formData.getAll('selected').map((value) => {
    const sourceId = value.toString();
    return {
      sourceId,
      artists: splitArtists(formData.get(`artists-${sourceId}`)?.toString() ?? ''),
    };
  });

  const result = await mutate({
    context,
    request,
    mutation: importMutation,
    variables: { venueId: params.venueId, input },
  });
  const imported = result.importListings;
  if (!imported) {
    return { failed: true };
  }

  const search = new URLSearchParams({
    added: imported.showsCreated.toString(),
    artistsCreated: imported.artistsCreated.toString(),
  });
  return redirect(`/admin/show/listings/${params.venueId}?${search.toString()}`);
}

function formatDay(localDate: string) {
  // noon keeps the calendar day the same in every time zone
  return new Date(`${localDate}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  });
}

function formatTime(localTime: string) {
  const [hours, minutes] = localTime.split(':').map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

const Alert = ({ children }: PropsWithChildren) => (
  <div
    role="alert"
    className="mb-5 max-w-2xl border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900 dark:bg-red-950/30 dark:text-red-200"
  >
    {children}
  </div>
);

const cell = 'px-2.5 py-2 align-top text-sm';
const pill = 'rounded-full border px-2 py-px text-xs';

function ListingRow({
  listing,
  checked,
  onToggle,
}: {
  listing: Listing;
  checked: boolean;
  onToggle: (sourceId: string, checked: boolean) => void;
}) {
  const { t } = useTranslation();
  const [artists, setArtists] = useState(listing.headliners.join('; '));
  const names = splitArtists(artists);
  const listed = [...listing.headliners, ...listing.support];
  const missingSupport = listing.support.filter((name) => !names.includes(name));
  const canAdd = !listing.show && Boolean(listing.localDate) && !listing.cancelled;
  const day = listing.localDate ? formatDay(listing.localDate) : t('shows.listings.dateTbd');

  let tickets: ReactNode = listing.status;
  if (listing.cancelled) {
    tickets = t('shows.listings.cancelled');
  } else if (listing.url) {
    tickets = (
      <a href={listing.url} target="_blank" rel="noreferrer" className="text-pink underline">
        {listing.status || t('shows.listings.tickets')}
      </a>
    );
  }

  return (
    <tr className={cn('border-detail border-b', { 'text-neutral-500': !canAdd })}>
      <td className={cell}>
        <input
          type="checkbox"
          name="selected"
          value={listing.sourceId}
          checked={checked}
          disabled={!canAdd}
          onChange={(e) => onToggle(listing.sourceId, e.target.checked)}
          aria-label={t('shows.listings.select', { date: day })}
          className="text-pink focus:ring-pink rounded-sm border-gray-300 shadow-sm disabled:opacity-40"
        />
      </td>
      <td className={cn(cell, 'whitespace-nowrap')}>
        {day}
        {listing.localTime && (
          <span className="block text-xs">{formatTime(listing.localTime)}</span>
        )}
      </td>
      <td className={cell}>
        {canAdd ? (
          <>
            <input
              name={`artists-${listing.sourceId}`}
              value={artists}
              onChange={(e) => setArtists(e.target.value)}
              required={checked}
              aria-label={t('shows.listings.artistsFor', { date: day })}
              className={cn(inputBase, 'w-full')}
            />
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {names
                .filter((name) => listed.includes(name))
                .map((name) =>
                  listing.newArtists.includes(name) ? (
                    <span
                      key={name}
                      title={t('shows.listings.newArtist')}
                      className={cn(pill, 'border-amber-600 text-amber-700')}
                    >
                      {t('shows.listings.newName', { name })}
                    </span>
                  ) : (
                    <span
                      key={name}
                      title={t('shows.listings.existingArtist')}
                      className={cn(pill, 'border-green-700 text-green-700')}
                    >
                      {name}
                    </span>
                  )
                )}
              {missingSupport.length > 0 && (
                <button
                  type="button"
                  className="text-pink cursor-pointer text-xs underline"
                  onClick={() => setArtists([...names, ...missingSupport].join('; '))}
                >
                  {t('shows.listings.addSupport', { names: missingSupport.join(', ') })}
                </button>
              )}
            </div>
          </>
        ) : (
          listed.join(', ')
        )}
      </td>
      <td className={cell}>{tickets}</td>
      <td className={cell}>
        {listing.show && (
          <>
            <Link to={`/admin/show/${listing.show.id}`} className="text-green-700 underline">
              {t('shows.listings.added')}
            </Link>
            {listing.dateChanged && (
              <span className="block text-xs text-amber-700">
                {t('shows.listings.dateChanged')}
              </span>
            )}
          </>
        )}
      </td>
    </tr>
  );
}

function ListingsTable({ venueListings }: { venueListings: VenueListings }) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);
  const [hideAdded, setHideAdded] = useState(false);

  if (venueListings.error) {
    return <Alert>{venueListings.error}</Alert>;
  }

  const { listings, source } = venueListings;
  const visible = hideAdded ? listings.filter(({ show }) => !show) : listings;
  const onToggle = (sourceId: string, checked: boolean) =>
    setSelected((ids) => (checked ? [...ids, sourceId] : ids.filter((id) => id !== sourceId)));

  return (
    <Form method="post">
      <div className="mb-3 flex flex-wrap items-center gap-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-300">
          {t('shows.listings.summary', {
            source: t(`shows.listings.source.${source}`),
            count: listings.length,
          })}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hideAdded}
            onChange={(e) => setHideAdded(e.target.checked)}
            className="text-pink focus:ring-pink rounded-sm border-gray-300 shadow-sm"
          />
          {t('shows.listings.hideAdded')}
        </label>
        <Button
          buttonType="primary"
          type="submit"
          disabled={selected.length === 0 || navigation.state === 'submitting'}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('shows.listings.add', { count: selected.length })}
        </Button>
      </div>
      {listings.length === 0 ? (
        <p className="my-10">{t('shows.listings.empty')}</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="border-detail w-full min-w-160 table-fixed border-spacing-0 border shadow-sm">
            <thead>
              <tr className="border-detail border-b text-left text-sm">
                <th className={cn(cell, 'w-10')} aria-hidden />
                <th className={cn(cell, 'w-32')}>{t('shows.listings.date')}</th>
                <th className={cell}>{t('shows.listings.artists')}</th>
                <th className={cn(cell, 'w-32')}>{t('shows.listings.tickets')}</th>
                <th className={cn(cell, 'w-44')}>{t('shows.listings.inYourData')}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((listing) => (
                <ListingRow
                  key={listing.sourceId}
                  listing={listing}
                  checked={selected.includes(listing.sourceId)}
                  onToggle={onToggle}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Form>
  );
}

export default function Listings({ loaderData, actionData, params }: Route.ComponentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const venues = (loaderData.venues?.edges ?? [])
    .map(({ node }) => node)
    .filter(({ listingsUrl }) => listingsUrl);
  const added = Number(searchParams.get('added') || 0);

  return (
    <>
      <Heading>{t('shows.listings.heading')}</Heading>
      {venues.length === 0 ? (
        <p className="my-4 text-sm">{t('shows.listings.noVenues')}</p>
      ) : (
        <div className="mb-4">
          <Select
            key={params.venueId}
            value={params.venueId ?? ''}
            placeholder={t('shows.listings.chooseVenue')}
            aria-label={t('shows.listings.chooseVenue')}
            choices={venues.map(({ id, name }) => ({ label: name, value: id }))}
            onChange={(venueId: string) => navigate(`/admin/show/listings/${venueId}`)}
          />
        </div>
      )}
      {added > 0 && (
        <Message
          param="added"
          text={t('shows.listings.success', {
            count: added,
            artistsCreated: Number(searchParams.get('artistsCreated') || 0),
          })}
        />
      )}
      {actionData?.failed && <Alert>{t('shows.listings.failed')}</Alert>}
      {loaderData.venueListings && (
        // a new location (another venue, or the redirect after adding) starts a fresh selection
        <ListingsTable key={location.key} venueListings={loaderData.venueListings} />
      )}
    </>
  );
}

const listingsQuery = gql`
  query VenueListingsAdmin($venueId: String!, $withListings: Boolean!) {
    venues(first: 500) {
      edges {
        node {
          id
          listingsUrl
          name
        }
      }
    }
    venueListings(venueId: $venueId) @include(if: $withListings) {
      error
      listings {
        cancelled
        dateChanged
        headliners
        localDate
        localTime
        newArtists
        show {
          id
        }
        sourceId
        status
        support
        url
      }
      source
    }
  }
`;

const importMutation = gql`
  mutation ImportListings($venueId: String!, $input: [ImportListingInput!]!) {
    importListings(venueId: $venueId, input: $input) {
      artistsCreated
      showsCreated
    }
  }
`;
