import { SITE_TIME_ZONE } from '#/time';

import { dayKey } from './time';
import type { Listing } from './types';

interface ExistingShow {
  date: Date;
  source: string | null;
  sourceId: string | null;
  artists: { artist: { name: string } | null }[];
}

// A show's time is stored as the venue's clock reads it, read as New York's, so its day there is
// the day on New York's clocks
const dayOf = (show: ExistingShow) => dayKey(show.date, SITE_TIME_ZONE);

// Compares artist names without regard to case, accents or punctuation: "Dinosaur Jr." = "dinosaur jr"
export function normalizeName(name: string) {
  const key = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return key || name.trim().toLowerCase();
}

// A listing is already in the data when a show was added from it, or, for shows entered by hand
// or from another source, when a show on the same day shares an artist with it
export function matchListing<T extends ExistingShow>(listing: Listing, shows: T[]) {
  const added = shows.find(
    (show) => show.source === listing.source && show.sourceId === listing.sourceId
  );
  if (added) {
    const dateChanged = listing.localDate !== null && dayOf(added) !== listing.localDate;
    return { show: added, dateChanged };
  }
  if (!listing.localDate) {
    return { show: null, dateChanged: false };
  }

  const names = new Set([...listing.headliners, ...listing.support].map(normalizeName));
  const sameDay = shows.find(
    (show) =>
      show.source !== listing.source &&
      dayOf(show) === listing.localDate &&
      show.artists.some(({ artist }) => artist !== null && names.has(normalizeName(artist.name)))
  );
  return { show: sameDay ?? null, dateChanged: false };
}
