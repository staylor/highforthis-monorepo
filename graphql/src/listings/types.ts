export type ListingSource = 'aeg' | 'ticketmaster';

export interface Listing {
  source: ListingSource;
  sourceId: string;
  // Venue-local calendar date (YYYY-MM-DD) and start time (HH:MM); null until announced
  localDate: string | null;
  localTime: string | null;
  // Actual instant when supplied or unambiguously resolved by the venue zone.
  startsAt: Date | null;
  timeZone: string | null;
  headliners: string[];
  support: string[];
  status: string | null;
  cancelled: boolean;
  url: string | null;
}
