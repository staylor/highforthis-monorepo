import { z } from 'zod';

import env from '#/env';

import { cached, fetchText } from './http';
import { zonedTime } from './time';
import type { Listing } from './types';

const API = 'https://app.ticketmaster.com/discovery/v2';
const SOURCE = 'Ticketmaster';
const VENUE_TTL = 24 * 60 * 60 * 1000;
const EVENTS_TTL = 15 * 60 * 1000;
const PAGE_SIZE = 200;
// The Discovery API doesn't page past the 1,000th result
const MAX_RESULTS = 1000;

const STATUS: Record<string, string> = {
  canceled: 'Cancelled',
  cancelled: 'Cancelled',
  offsale: 'Off sale',
  onsale: 'On sale',
  postponed: 'Postponed',
  rescheduled: 'Rescheduled',
};

const venuesSchema = z.object({
  _embedded: z
    .object({ venues: z.array(z.object({ id: z.string(), url: z.string().nullish() })) })
    .nullish(),
});

const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string().nullish(),
  test: z.boolean().nullish(),
  dates: z.object({
    start: z.object({
      localDate: z.string().nullish(),
      localTime: z.string().nullish(),
      dateTime: z.string().nullish(),
      dateTBD: z.boolean().nullish(),
      dateTBA: z.boolean().nullish(),
      timeTBA: z.boolean().nullish(),
      noSpecificTime: z.boolean().nullish(),
    }),
    timezone: z.string().nullish(),
    status: z.object({ code: z.string().nullish() }).nullish(),
  }),
  _embedded: z
    .object({
      venues: z.array(z.object({ timezone: z.string().nullish() })).nullish(),
      attractions: z.array(z.object({ id: z.string(), name: z.string() })).nullish(),
    })
    .nullish(),
});

const eventsSchema = z.object({
  _embedded: z.object({ events: z.array(eventSchema) }).nullish(),
  page: z.object({ totalPages: z.number() }),
});

type TicketmasterEvent = z.infer<typeof eventSchema>;

export function isTicketmasterUrl(url: URL) {
  return /(^|\.)ticketmaster\.com$/.test(url.hostname);
}

async function discovery(resource: string, params: Record<string, string>) {
  const apiKey = env.TICKETMASTER_API_KEY;
  if (!apiKey) {
    throw new Error('Set TICKETMASTER_API_KEY to load Ticketmaster listings.');
  }
  const url = new URL(`${API}/${resource}.json`);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, value);
  }
  url.searchParams.set('apikey', apiKey);
  return JSON.parse(await fetchText(url.toString(), SOURCE)) as unknown;
}

// Venue pages carry the legacy venue ID at the end of the path, as in
// ticketmaster.com/madison-square-garden-tickets-new-york/venue/483329 or
// ticketmaster.com/venue/flushing-meadows-corona-park-queens-ny/591368. The Discovery API
// wants its own ID, so look the venue up by name and match its URL.
function venueId(url: URL) {
  const [, pageSlug, slug, legacyId] =
    /^\/(?:([^/]+)\/venue|venue\/([^/]+))\/(\d+)\/?$/.exec(url.pathname) ?? [];
  if (!legacyId) {
    throw new Error(`${url} isn't a Ticketmaster venue page (…/venue/123456).`);
  }
  const keyword = (pageSlug?.replace(/-tickets(?:-.*)?$/, '') ?? slug).replaceAll('-', ' ');

  return cached(`ticketmaster-venue:${legacyId}`, VENUE_TTL, async () => {
    const { _embedded } = venuesSchema.parse(await discovery('venues', { keyword, size: '100' }));
    const venue = _embedded?.venues.find((candidate) =>
      candidate.url?.replace(/\/$/, '').endsWith(`/${legacyId}`)
    );
    if (!venue) {
      throw new Error(`Ticketmaster has no venue matching ${url}.`);
    }
    return venue.id;
  });
}

function hasStartTime({ localTime, timeTBA, noSpecificTime }: TicketmasterEvent['dates']['start']) {
  return Boolean(localTime) && !timeTBA && !noSpecificTime;
}

function toListing(event: TicketmasterEvent): Listing {
  const { start, status, timezone } = event.dates;
  const attractions = event._embedded?.attractions ?? [];
  const timeZone = timezone ?? event._embedded?.venues?.[0]?.timezone ?? 'America/New_York';
  const localDate = start.dateTBD || start.dateTBA ? null : (start.localDate ?? null);
  const localTime = hasStartTime(start) ? (start.localTime?.slice(0, 5) ?? null) : null;
  let startsAt: Date | null = null;
  if (localDate) {
    startsAt =
      localTime && start.dateTime
        ? new Date(start.dateTime)
        : zonedTime(localDate, localTime ?? '20:00', timeZone);
  }
  const code = status?.code ?? '';

  return {
    source: 'ticketmaster',
    sourceId: event.id,
    localDate,
    localTime,
    startsAt,
    timeZone,
    headliners: [attractions[0]?.name ?? event.name],
    support: attractions.slice(1).map(({ name }) => name),
    status: STATUS[code] ?? null,
    cancelled: code === 'canceled' || code === 'cancelled',
    url: event.url ?? null,
  };
}

// Shortest name first, then Ticketmaster's own listing over another seller's, then the lower ID,
// so a show keeps its ID whatever order the API lists its duplicates in
function rank(a: TicketmasterEvent, b: TicketmasterEvent) {
  const sold = (event: TicketmasterEvent) =>
    Number(Boolean(event.url && URL.canParse(event.url) && isTicketmasterUrl(new URL(event.url))));
  return a.name.length - b.name.length || sold(b) - sold(a) || a.id.localeCompare(b.id);
}

// VIP packages, multi-day passes and listings from other sellers repeat a show's date and
// artists; keep one
function dedupe(events: TicketmasterEvent[]) {
  const artistsOf = (event: TicketmasterEvent) =>
    (event._embedded?.attractions ?? []).map(({ id }) => id).join(',') || event.name;
  const timedShows = new Set(
    events
      .filter((event) => hasStartTime(event.dates.start))
      .map((event) => `${event.dates.start.localDate}|${artistsOf(event)}`)
  );

  const byShow = new Map<string, TicketmasterEvent>();
  for (const event of events) {
    const { start } = event.dates;
    const day = `${start.localDate}|${artistsOf(event)}`;
    if (!hasStartTime(start) && timedShows.has(day)) {
      continue;
    }
    const key = `${day}|${start.localTime}`;
    const kept = byShow.get(key);
    if (!kept || rank(event, kept) < 0) {
      byShow.set(key, event);
    }
  }
  return [...byShow.values()];
}

export async function ticketmasterListings(url: URL): Promise<Listing[]> {
  const id = await venueId(url);
  return cached(`ticketmaster-events:${id}`, EVENTS_TTL, async () => {
    const events: TicketmasterEvent[] = [];
    for (let page = 0; page * PAGE_SIZE < MAX_RESULTS; page += 1) {
      const data = eventsSchema.parse(
        await discovery('events', {
          venueId: id,
          classificationName: 'music',
          sort: 'date,asc',
          size: String(PAGE_SIZE),
          page: String(page),
        })
      );
      events.push(...(data._embedded?.events ?? []));
      if (page + 1 >= data.page.totalPages) {
        break;
      }
    }
    return dedupe(events.filter((event) => !event.test)).map(toListing);
  });
}
