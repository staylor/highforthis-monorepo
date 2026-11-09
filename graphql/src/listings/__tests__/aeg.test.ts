import { afterEach, describe, expect, it, vi } from 'vitest';

import { aegListings, parseSupport } from '../aeg';

const FEEDS = 'https://aegwebprod.blob.core.windows.net/json';
const BROOKLYN_STEEL = '126144';

function event(overrides: Record<string, unknown> = {}) {
  return {
    eventId: '1480566',
    eventDateTime: '2026-11-10T19:30:00',
    eventDateTimeUTC: '2026-11-11T00:30:00',
    eventDateTimeZone: 'America/New_York',
    title: { headlinersText: 'Chat Pile ', supportingText: 'Soul Glo, Shallowater' },
    ticketing: {
      statusId: 1,
      status: 'Buy Tickets',
      eventUrl: 'https://www.axs.com/events/1480566/chat-pile-tickets',
    },
    venue: { venueId: BROOKLYN_STEEL, timezone: 'America/New_York' },
    ...overrides,
  };
}

function section(file: string, venueIds?: string[]) {
  const filter = venueIds ? JSON.stringify(venueIds).replaceAll('"', '&quot;') : '';
  return `<div class="c-axs-event-list__list js-axs-events-section"
    data-file="${FEEDS}/${file}" data-limit="100" data-venue_id_filter="${filter}"></div>`;
}

function serve(responses: Record<string, unknown>) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const body = responses[url];
      if (body === undefined) {
        return new Response('missing', { status: 404 });
      }
      return new Response(typeof body === 'string' ? body : JSON.stringify(body));
    })
  );
}

describe('aegListings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps one venue's shows from the shared feeds its page filters", async () => {
    serve({
      'https://bowerypresents.com/steel/': `<main>${section('resources/a/events.json', [BROOKLYN_STEEL])}${section('events/59/events.json', [BROOKLYN_STEEL])}</main>`,
      [`${FEEDS}/resources/a/events.json`]: { events: [event()] },
      [`${FEEDS}/events/59/events.json`]: {
        events: [
          event(),
          event({ eventId: '2', venue: { venueId: '124878' } }),
          event({ eventId: '3', eventDateTime: '2026-12-01T20:00:00', eventDateTimeUTC: null }),
        ],
      },
    });

    const listings = await aegListings(new URL('https://bowerypresents.com/steel/'));

    expect(listings.map(({ sourceId }) => sourceId)).toEqual(['1480566', '3']);
    expect(listings[0]).toEqual({
      source: 'aeg',
      sourceId: '1480566',
      localDate: '2026-11-10',
      localTime: '19:30',
      startsAt: new Date('2026-11-11T00:30:00Z'),
      timeZone: 'America/New_York',
      headliners: ['Chat Pile'],
      support: ['Soul Glo', 'Shallowater'],
      status: 'Buy Tickets',
      cancelled: false,
      url: 'https://www.axs.com/events/1480566/chat-pile-tickets',
    });
    // without a UTC time, the venue-local time is converted
    expect(listings[1].startsAt).toEqual(new Date('2026-12-02T01:00:00Z'));
  });

  it('leaves undated shows without a start and flags cancellations', async () => {
    serve({
      [`${FEEDS}/events/1/events.json`]: {
        events: [
          event({ eventId: 'tbd', eventDateTime: 'TBD', eventDateTimeUTC: 'TBD' }),
          event({ eventId: 'off', ticketing: { statusId: 2, status: 'Cancelled' } }),
        ],
      },
    });

    const [tbd, off] = await aegListings(new URL(`${FEEDS}/events/1/events.json`));

    expect(tbd).toMatchObject({ localDate: null, localTime: null, startsAt: null });
    expect(off).toMatchObject({ cancelled: true, status: 'Cancelled', url: null });
  });

  it("reads a venue's own site, whose feeds list only that venue", async () => {
    serve({
      'https://www.websterhall.com/': section('events/85/events.json'),
      [`${FEEDS}/events/85/events.json`]: {
        events: [event({ venue: { venueId: '101385' } })],
      },
    });

    const listings = await aegListings(new URL('https://www.websterhall.com/'));

    expect(listings).toHaveLength(1);
  });

  it('rejects a page whose feeds cover several venues', async () => {
    serve({
      'https://bowerypresents.com/kings/': section('events/featured/events.json'),
      [`${FEEDS}/events/featured/events.json`]: {
        events: [event(), event({ eventId: '2', venue: { venueId: '125269' } })],
      },
    });

    await expect(aegListings(new URL('https://bowerypresents.com/kings/'))).rejects.toThrow(
      'several venues'
    );
  });

  it('picks venues out of a shared feed URL', async () => {
    serve({
      [`${FEEDS}/events/60/events.json`]: {
        events: [event(), event({ eventId: '2', venue: { venueId: '125269' } })],
      },
    });

    const listings = await aegListings(new URL(`${FEEDS}/events/60/events.json?venue=125269`));

    expect(listings.map(({ sourceId }) => sourceId)).toEqual(['2']);
  });

  it('reports a page without a show list', async () => {
    serve({ 'https://example.com/': '<main>No shows</main>' });

    await expect(aegListings(new URL('https://example.com/'))).rejects.toThrow(
      "doesn't have a Bowery Presents/AEG show list"
    );
  });
});

describe('parseSupport', () => {
  it.each([
    ['Soul Glo, Shallowater', ['Soul Glo', 'Shallowater']],
    ['with special guest Starcrawler', ['Starcrawler']],
    ['with Pelican, The Life and Times', ['Pelican', 'The Life and Times']],
    [
      'with Eric Church, Sheryl Crow, and Greylan James',
      ['Eric Church', 'Sheryl Crow', 'Greylan James'],
    ],
    [
      'w/ Megan Falley, The Wordless Music Orchestra, and Special Guest Ani DiFranco',
      ['Megan Falley', 'The Wordless Music Orchestra', 'Ani DiFranco'],
    ],
    [
      'with Megan Falley, the Goosebump Orchestra, and extremely special guests',
      ['Megan Falley', 'the Goosebump Orchestra'],
    ],
    ['Within Temptation', ['Within Temptation']],
    [null, []],
  ])('parses %j', (text, names) => {
    expect(parseSupport(text)).toEqual(names);
  });
});
