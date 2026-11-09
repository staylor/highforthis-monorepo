import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import env from '#/env';

import { ticketmasterListings } from '../ticketmaster';

// Each test uses its own venue, since venue and event lookups are cached
const venuePage = (legacyId: number) =>
  new URL(`https://www.ticketmaster.com/barclays-center-tickets-brooklyn/venue/${legacyId}`);

function event(id: string, name: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name,
    url: `https://www.ticketmaster.com/event/${id}`,
    dates: {
      start: { localDate: '2027-02-12', localTime: '20:00:00', dateTime: '2027-02-13T01:00:00Z' },
      timezone: 'America/New_York',
      status: { code: 'onsale' },
    },
    _embedded: {
      attractions: [
        { id: 'K8vZ917Kew0', name: 'Olivia Rodrigo' },
        { id: 'K8vZ9171o-7', name: 'Chappell Roan' },
      ],
    },
    ...overrides,
  };
}

function serve(events: unknown[]) {
  const requests: URL[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string) => {
      const url = new URL(input);
      requests.push(url);
      if (url.pathname.endsWith('/venues.json')) {
        return Response.json({
          _embedded: {
            venues: [
              { id: 'KovZpZAEF7FA', url: 'https://www.ticketmaster.com/other/venue/3990' },
              ...[399, 400, 401, 403, 404].map((legacyId) => ({
                id: `KovZ${legacyId}`,
                url: `https://www.ticketmaster.com/barclays-center-tickets-brooklyn/venue/${legacyId}`,
              })),
              {
                id: 'KovZ591368',
                url: 'https://www.ticketmaster.com/venue/flushing-meadows-corona-park-queens-ny/591368',
              },
            ],
          },
        });
      }
      return Response.json({ _embedded: { events }, page: { totalPages: 1 } });
    })
  );
  return requests;
}

const { TICKETMASTER_API_KEY } = env;

describe('ticketmasterListings', () => {
  beforeEach(() => {
    env.TICKETMASTER_API_KEY = 'test-key';
  });

  afterEach(() => {
    env.TICKETMASTER_API_KEY = TICKETMASTER_API_KEY;
    vi.unstubAllGlobals();
  });

  it("lists the music at the venue the page's legacy ID belongs to", async () => {
    const requests = serve([event('G5v', 'Olivia Rodrigo')]);

    const [listing] = await ticketmasterListings(venuePage(399));

    expect(requests[0].searchParams.get('keyword')).toBe('barclays center');
    expect(requests[1].searchParams.get('venueId')).toBe('KovZ399');
    expect(requests[1].searchParams.get('classificationName')).toBe('music');
    expect(listing).toEqual({
      source: 'ticketmaster',
      sourceId: 'G5v',
      localDate: '2027-02-12',
      localTime: '20:00',
      startsAt: new Date('2027-02-13T01:00:00Z'),
      timeZone: 'America/New_York',
      headliners: ['Olivia Rodrigo'],
      support: ['Chappell Roan'],
      status: 'On sale',
      cancelled: false,
      url: 'https://www.ticketmaster.com/event/G5v',
    });
  });

  it('drops add-ons and passes that repeat a show', async () => {
    serve([
      event('vip', 'Olivia Rodrigo - Official VIP Packages'),
      event('G5v', 'Olivia Rodrigo'),
      event('pass', 'Olivia Rodrigo 2-Day Ticket (2/12-2/13)', {
        dates: {
          start: { localDate: '2027-02-12', noSpecificTime: true },
          end: { localDate: '2027-02-13' },
          status: { code: 'onsale' },
        },
      }),
      event('next', 'Olivia Rodrigo', {
        dates: {
          start: { localDate: '2027-02-13', localTime: '20:00:00' },
          status: { code: 'onsale' },
        },
      }),
    ]);

    const listings = await ticketmasterListings(venuePage(400));

    expect(listings.map(({ sourceId }) => sourceId)).toEqual(['G5v', 'next']);
  });

  it("keeps the same show from another seller's duplicate whatever the order", async () => {
    const axs = event('k7vGF', 'Olivia Rodrigo', {
      url: 'https://www.axs.com/events/1631716/olivia-rodrigo-tickets',
    });
    const own = event('Z7r9j', 'Olivia Rodrigo');

    serve([axs, own]);
    const [first] = await ticketmasterListings(venuePage(403));
    serve([own, axs]);
    const [second] = await ticketmasterListings(venuePage(404));

    expect([first.sourceId, second.sourceId]).toEqual(['Z7r9j', 'Z7r9j']);
  });

  it('reads venue pages that put the venue name after /venue/', async () => {
    const requests = serve([event('G5v', 'Olivia Rodrigo')]);

    await ticketmasterListings(
      new URL('https://www.ticketmaster.com/venue/flushing-meadows-corona-park-queens-ny/591368')
    );

    expect(requests[0].searchParams.get('keyword')).toBe('flushing meadows corona park queens ny');
    expect(requests[1].searchParams.get('venueId')).toBe('KovZ591368');
  });

  it('starts unannounced times at 8 PM and flags cancellations', async () => {
    serve([
      event('tba', 'Gracie Abrams', {
        dates: {
          start: { localDate: '2027-03-16', timeTBA: true },
          timezone: 'America/New_York',
          status: { code: 'cancelled' },
        },
      }),
    ]);

    const [listing] = await ticketmasterListings(venuePage(401));

    expect(listing).toMatchObject({
      localTime: null,
      startsAt: new Date('2027-03-17T00:00:00Z'),
      cancelled: true,
      status: 'Cancelled',
    });
  });

  it('needs an API key', async () => {
    env.TICKETMASTER_API_KEY = undefined;

    await expect(ticketmasterListings(venuePage(402))).rejects.toThrow('TICKETMASTER_API_KEY');
  });
});
