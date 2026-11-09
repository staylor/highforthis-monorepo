export type ListingSource = 'aeg' | 'ticketmaster';

export interface Listing {
  source: ListingSource;
  sourceId: string;
  // Venue-local calendar date (YYYY-MM-DD) and start time (HH:MM); null until announced
  localDate: string | null;
  localTime: string | null;
  // When a show added from this listing starts; 8 PM venue time if the time isn't announced
  startsAt: Date | null;
  timeZone: string;
  headliners: string[];
  support: string[];
  status: string | null;
  cancelled: boolean;
  url: string | null;
}
