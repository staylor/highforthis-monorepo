import { aegListings } from './aeg';
import { isTicketmasterUrl, ticketmasterListings } from './ticketmaster';
import { dayKey } from './time';
import type { Listing, ListingSource } from './types';

export { matchListing, normalizeName } from './match';

function byDate(a: Listing, b: Listing) {
  // listings without a date yet go last
  const dateA = a.localDate ?? '9999';
  const dateB = b.localDate ?? '9999';
  return dateA.localeCompare(dateB) || (a.localTime ?? '').localeCompare(b.localTime ?? '');
}

// Upcoming shows on a venue's listings page: a Bowery Presents/AEG venue page or feed,
// or a ticketmaster.com venue page
export async function getListings(listingsUrl: string) {
  if (!URL.canParse(listingsUrl)) {
    throw new Error(`${listingsUrl} isn't a URL.`);
  }
  const url = new URL(listingsUrl);
  const source: ListingSource = isTicketmasterUrl(url) ? 'ticketmaster' : 'aeg';
  const listings =
    source === 'ticketmaster' ? await ticketmasterListings(url) : await aegListings(url);
  const now = new Date();

  return {
    source,
    listings: listings
      .filter(({ localDate, timeZone }) => !localDate || localDate >= dayKey(now, timeZone))
      .sort(byDate),
  };
}
