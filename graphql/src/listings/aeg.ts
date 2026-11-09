import { z } from 'zod';

import { cached, fetchText } from './http';
import { zonedTime } from './time';
import type { Listing } from './types';

// Bowery Presents and other AEG venue sites load their show lists from JSON feeds on this host
const FEED_HOST = 'aegwebprod.blob.core.windows.net';
const SOURCE = 'Bowery Presents';
const PAGE_TTL = 60 * 60 * 1000;
const FEED_TTL = 15 * 60 * 1000;
const CANCELLED = 2;

const eventSchema = z.object({
  eventId: z.coerce.string(),
  eventDateTime: z.string().nullish(),
  eventDateTimeUTC: z.string().nullish(),
  eventDateTimeZone: z.string().nullish(),
  title: z
    .object({
      headlinersText: z.string().nullish(),
      supportingText: z.string().nullish(),
      eventTitleText: z.string().nullish(),
    })
    .nullish(),
  ticketing: z
    .object({
      statusId: z.number().nullish(),
      status: z.string().nullish(),
      eventUrl: z.string().nullish(),
      url: z.string().nullish(),
    })
    .nullish(),
  venue: z.object({
    venueId: z.coerce.string(),
    timezone: z.string().nullish(),
  }),
});

const feedSchema = z.object({ events: z.array(eventSchema) });

type FeedListing = Listing & { venueId: string };

interface Section {
  file: string;
  venueIds: string[];
}

const LOCAL_DATE_TIME = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/;
const SECTION = /<div\b[^>]*\bjs-axs-events-section\b[^>]*>/g;
const SECTION_ATTRIBUTE = /\bdata-(file|venue_id_filter)="([^"]*)"/g;

// "w/ …", "with special guests …", "with support from …"
const SUPPORT_PREFIX =
  /^(?:(?:w\/|with\s|feat\.|featuring\s)\s*)?(?:(?:(?:very|extremely)\s+)?(?:special|musical)\s+guests?\s*:?\s*|(?:comedy|music|support)\s+from\s+)?/i;
const SUPPORT_ITEM_PREFIX =
  /^(?:(?:and|&)\s+)?(?:(?:(?:very|extremely)\s+)?special\s+guests?\s*:?\s*)?/i;
const NOT_A_NAME = /^(?:(?:and|&)\s+)?(?:more|(?:(?:very|extremely)\s+)?special\s+guests?)!?$/i;

// Support acts come as one string: "Soul Glo, Shallowater" or "with special guest Starcrawler"
export function parseSupport(text?: string | null) {
  if (!text) {
    return [];
  }
  return text
    .trim()
    .replace(SUPPORT_PREFIX, '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name && !NOT_A_NAME.test(name))
    .map((name) => name.replace(SUPPORT_ITEM_PREFIX, '').trim())
    .filter(Boolean);
}

function decodeEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, '&');
}

function parseVenueIds(value?: string): string[] {
  if (!value) {
    return [];
  }
  try {
    const ids: unknown = JSON.parse(value);
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

// A venue page lists its shows in sections that name a feed and, on shared sites, the venue IDs to keep
function parseSections(html: string): Section[] {
  return [...html.matchAll(SECTION)].flatMap(([tag]) => {
    const attributes = Object.fromEntries(
      [...tag.matchAll(SECTION_ATTRIBUTE)].map(([, name, value]) => [name, decodeEntities(value)])
    );
    const { file } = attributes;
    if (!file || !URL.canParse(file) || new URL(file).hostname !== FEED_HOST) {
      return [];
    }
    return [{ file, venueIds: parseVenueIds(attributes.venue_id_filter) }];
  });
}

function toListing(event: z.infer<typeof eventSchema>): FeedListing {
  const local = LOCAL_DATE_TIME.exec(event.eventDateTime ?? '');
  const timeZone = event.eventDateTimeZone ?? event.venue.timezone ?? 'America/New_York';
  let startsAt: Date | null = null;
  if (local) {
    startsAt = event.eventDateTimeUTC
      ? new Date(`${event.eventDateTimeUTC}Z`)
      : zonedTime(local[1], local[2], timeZone);
  }
  const status = event.ticketing?.status?.trim() || null;
  const headliner = event.title?.headlinersText?.trim() || event.title?.eventTitleText?.trim();

  return {
    source: 'aeg',
    sourceId: event.eventId,
    venueId: event.venue.venueId,
    localDate: local?.[1] ?? null,
    localTime: local?.[2] ?? null,
    startsAt: startsAt && !Number.isNaN(startsAt.getTime()) ? startsAt : null,
    timeZone,
    headliners: headliner ? [headliner] : [],
    support: parseSupport(event.title?.supportingText),
    status,
    cancelled: event.ticketing?.statusId === CANCELLED || /cancel/i.test(status ?? ''),
    url: event.ticketing?.eventUrl || event.ticketing?.url || null,
  };
}

function loadFeed(file: string) {
  return cached(`aeg-feed:${file}`, FEED_TTL, async () => {
    const text = await fetchText(file, SOURCE);
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`${SOURCE} sent something other than JSON for ${file}.`);
    }
    const feed = feedSchema.safeParse(json);
    if (!feed.success) {
      throw new Error(`${SOURCE} changed the format of ${file}.`);
    }
    return feed.data.events.map(toListing);
  });
}

function dedupe(listings: FeedListing[]): Listing[] {
  const byId = new Map<string, Listing>();
  for (const { venueId: _, ...listing } of listings) {
    byId.set(listing.sourceId, listing);
  }
  return [...byId.values()];
}

// Accepts a venue page (bowerypresents.com/brooklyn-steel/, websterhall.com) or a feed URL,
// optionally with ?venue=<AXS venue ID> to pick one venue out of a shared feed
export async function aegListings(url: URL): Promise<Listing[]> {
  let sections: Section[];
  if (url.hostname === FEED_HOST) {
    const file = new URL(url);
    file.search = '';
    sections = [
      {
        file: file.toString(),
        venueIds: url.searchParams.getAll('venue').flatMap((ids) => ids.split(',')),
      },
    ];
  } else {
    sections = await cached(`aeg-page:${url}`, PAGE_TTL, async () =>
      parseSections(await fetchText(url.toString(), SOURCE))
    );
  }
  if (sections.length === 0) {
    throw new Error(`${url} doesn't have a Bowery Presents/AEG show list.`);
  }

  const venueIds = new Set(sections.flatMap((section) => section.venueIds));
  if (venueIds.size > 0) {
    const files = new Set(
      sections.filter(({ venueIds: ids }) => ids.length).map(({ file }) => file)
    );
    const feeds = await Promise.all([...files].map(loadFeed));
    return dedupe(feeds.flat().filter((listing) => venueIds.has(listing.venueId)));
  }

  // Without a venue filter the page is a venue's own site, whose feeds only list that venue
  const feeds = await Promise.all([...new Set(sections.map(({ file }) => file))].map(loadFeed));
  const singleVenueFeeds = feeds.filter(
    (feed) => new Set(feed.map((listing) => listing.venueId)).size === 1
  );
  const venues = new Set(singleVenueFeeds.flat().map((listing) => listing.venueId));
  const listsOtherVenues = singleVenueFeeds.length === 0 && feeds.some((feed) => feed.length > 0);
  if (venues.size > 1 || listsOtherVenues) {
    throw new Error(`${url} lists shows at several venues. Use the venue's own page instead.`);
  }
  return dedupe(singleVenueFeeds.flat());
}
