import { and, eq, gte, inList, lt, type TableRow } from 'remix/data-table';
import type { ShowEntityType } from 'types/graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  artists as artistsTable,
  showArtists as showArtistsTable,
  shows as showsTable,
  venues as venuesTable,
} from '#/database/tables';

import resolvers from '../Show';

type Artist = TableRow<typeof artistsTable>;
type Show = TableRow<typeof showsTable>;
type Venue = TableRow<typeof venuesTable>;

/** A query whose steps each answer the query, as the builder's do */
function chain() {
  const query = {
    all: vi.fn(),
    count: vi.fn(),
    join: vi.fn(),
    limit: vi.fn(),
    offset: vi.fn(),
    orderBy: vi.fn(),
    select: vi.fn(),
    where: vi.fn(),
    with: vi.fn(),
  };
  return query;
}

const { db, showsQuery, searchQuery, tx } = vi.hoisted(() => ({
  db: {
    exec: vi.fn(),
    find: vi.fn(),
    findMany: vi.fn(),
    findOne: vi.fn(),
    query: vi.fn(),
    transaction: vi.fn(),
    update: vi.fn(),
  },
  showsQuery: {} as ReturnType<typeof chain>,
  searchQuery: {} as ReturnType<typeof chain>,
  // The shows, and the artists and venues they add, are saved together or not at all
  tx: { count: vi.fn(), create: vi.fn(), createMany: vi.fn(), findOne: vi.fn() },
}));
const fillAppleMusicLater = vi.hoisted(() => vi.fn());

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('../utils/appleMusicData', () => ({ fillAppleMusicLater }));

/** Resets the mocks, with the shows query and the queries a search makes each answering itself */
function resetMocks() {
  vi.resetAllMocks();
  Object.assign(showsQuery, chain());
  Object.assign(searchQuery, chain());
  for (const query of [showsQuery, searchQuery]) {
    for (const step of ['join', 'limit', 'offset', 'orderBy', 'select', 'where', 'with'] as const) {
      query[step].mockReturnValue(query);
    }
  }
  db.query.mockImplementation((table) => (table === showsTable ? showsQuery : searchQuery));
}

describe('bulkCreateShows', () => {
  beforeEach(() => {
    resetMocks();
    tx.count.mockResolvedValue(0);
    tx.findOne.mockImplementation(async (table, { where }) => {
      if (table === venuesTable) return { id: 'venue-1' };
      return where.value === 'Phish' ? { id: 'artist-phish' } : null;
    });
  });

  const shows = [
    { artists: ['Phish', 'Goose'], date: Date.UTC(2026, 11, 30), venue: 'Madison Square Garden' },
    { artists: ['Goose', 'Geese'], date: Date.UTC(2026, 11, 31), venue: 'Madison Square Garden' },
  ];

  it("looks up Apple Music's data for the artists it added, once they are saved", async () => {
    db.transaction.mockImplementation(async (save) => {
      const result = await save(tx);
      expect(fillAppleMusicLater).not.toHaveBeenCalled();
      return result;
    });

    await expect(resolvers.Mutation.bulkCreateShows({}, { input: shows })).resolves.toEqual({
      artistsCreated: 2,
      showsCreated: 2,
      venuesCreated: 0,
    });
    const added = tx.create.mock.calls
      .filter(([table]) => table === artistsTable)
      .map(([, artist]) => artist);
    expect(added.map(({ name }) => name)).toEqual(['Goose', 'Geese']);
    expect(fillAppleMusicLater).toHaveBeenCalledExactlyOnceWith(added.map(({ id }) => id));
  });

  it('looks nothing up when the shows could not be saved', async () => {
    db.transaction.mockRejectedValue(new Error('Transaction failed'));

    await expect(resolvers.Mutation.bulkCreateShows({}, { input: shows })).rejects.toThrow(
      'Transaction failed'
    );
    expect(fillAppleMusicLater).not.toHaveBeenCalled();
  });
});

describe('updateShow', () => {
  beforeEach(() => {
    resetMocks();
    db.update.mockImplementation(async (_table, id, values) => ({ id, ...values }));
  });

  it('keeps the title, notes and URL when only Attended changes', async () => {
    await resolvers.Mutation.updateShow({}, { id: 'show-1', input: { attended: true } });

    expect(db.update).toHaveBeenLastCalledWith(
      showsTable,
      'show-1',
      { attended: true },
      expect.anything()
    );
  });

  it('clears the fields the edit form sends as null', async () => {
    await resolvers.Mutation.updateShow(
      {},
      { id: 'show-1', input: { attended: false, notes: null, title: null, url: null } }
    );

    expect(db.update).toHaveBeenLastCalledWith(
      showsTable,
      'show-1',
      { attended: false, notes: null, title: null, url: null },
      expect.anything()
    );
  });
});

describe('shows', () => {
  const show = (id: string, venueId: string) => ({ id, venueId }) as Show;
  const venue = (id: string) => ({ id, name: id }) as Venue;
  const artist = (id: string) => ({ id, name: id }) as Artist;

  beforeEach(() => {
    resetMocks();
    showsQuery.count.mockResolvedValue(3);
    showsQuery.all.mockResolvedValue([
      show('show-1', 'venue-1'),
      show('show-2', 'venue-2'),
      show('show-3', 'venue-1'),
    ]);
    db.exec.mockResolvedValue({
      rows: [
        { showId: 'show-1', artistId: 'artist-1' },
        { showId: 'show-2', artistId: 'artist-2' },
        { showId: 'show-1', artistId: 'artist-3' },
      ],
    });
    db.findMany.mockImplementation(async (table) =>
      table === venuesTable
        ? [venue('venue-1'), venue('venue-2')]
        : [artist('artist-1'), artist('artist-2'), artist('artist-3')]
    );
  });

  const shows = async () => {
    const connection = await resolvers.Query.shows({}, { attended: true, first: 1000 });
    return connection.edges.map(({ node }) => node);
  };

  it('gives each show its venue and artists', async () => {
    const [first, second, third] = await shows();

    await expect(resolvers.Show.venue(first)).resolves.toEqual(venue('venue-1'));
    await expect(resolvers.Show.venue(second)).resolves.toEqual(venue('venue-2'));
    await expect(resolvers.Show.venue(third)).resolves.toEqual(venue('venue-1'));
    expect(resolvers.Show.artists(first)).toEqual([artist('artist-1'), artist('artist-3')]);
    expect(resolvers.Show.artists(second)).toEqual([artist('artist-2')]);
    expect(resolvers.Show.artists(third)).toEqual([]);
    expect(db.find).not.toHaveBeenCalled();
  });

  // Show.venue is non-null, so a venue that can't be found is an error, not null
  it('looks up the venue of a show loaded without it', async () => {
    db.find.mockResolvedValue(venue('venue-2'));

    await expect(resolvers.Show.venue(show('show-2', 'venue-2'))).resolves.toEqual(
      venue('venue-2')
    );
    expect(db.find).toHaveBeenCalledWith(venuesTable, 'venue-2');

    db.find.mockResolvedValue(null);
    await expect(resolvers.Show.venue(show('show-2', 'venue-gone'))).rejects.toThrow(
      'Show show-2 has no venue'
    );
  });

  // An IN list of hundreds of IDs on ShowArtist.showId took Postgres longer to plan than to run
  it("finds the artists through the shows' IDs, and each venue once", async () => {
    await shows();

    expect(showsQuery.with).not.toHaveBeenCalled();
    const [[lineups]] = db.exec.mock.calls;
    expect(lineups.text.replace(/\s+/g, ' ').trim()).toBe(
      'select "showId", "artistId" from "ShowArtist" where "showId" in (select id from "Show" where id in (?, ?, ?))'
    );
    expect(lineups.values).toEqual(['show-1', 'show-2', 'show-3']);
    expect(db.findMany).toHaveBeenCalledWith(venuesTable, {
      where: inList('id', ['venue-1', 'venue-2']),
    });
    expect(db.findMany).toHaveBeenCalledWith(artistsTable, {
      where: inList('id', ['artist-1', 'artist-2', 'artist-3']),
    });
  });

  it('looks nothing up for an empty page', async () => {
    showsQuery.count.mockResolvedValue(0);
    showsQuery.all.mockResolvedValue([]);

    await expect(shows()).resolves.toEqual([]);
    expect(db.exec).not.toHaveBeenCalled();
    expect(db.findMany).not.toHaveBeenCalled();
  });
});

describe('ShowConnection.years', () => {
  beforeEach(() => {
    resetMocks();
    showsQuery.count.mockResolvedValue(0);
    showsQuery.all.mockResolvedValue([]);
  });

  const years = async (args: Parameters<typeof resolvers.Query.shows>[1]) => {
    const connection = await resolvers.Query.shows({}, { first: 50, ...args });
    showsQuery.all.mockResolvedValueOnce([
      { date: new Date('2019-05-01T20:00:00Z') },
      { date: new Date('2024-03-01T20:00:00Z') },
      { date: new Date('2019-09-01T20:00:00Z') },
    ]);
    const list = await resolvers.ShowConnection.years(connection);
    return { list, where: showsQuery.where.mock.lastCall?.[0] };
  };

  // The app's history asks for the years it can filter by, which once listed every show's
  it('lists the years of the shows the list was filtered to, newest first', async () => {
    const { list, where } = await years({ attended: true });

    expect(list).toEqual([2024, 2019]);
    expect(where).toEqual(and(eq('attended', true)));
  });

  it("leaves out the list's dates, so every year stays in the menu", async () => {
    const { where } = await years({ attended: true, year: 2019 });

    expect(showsQuery.where.mock.calls[0][0]).toEqual(
      and(
        and(eq('attended', true)),
        and(
          gte('date', new Date('2019-01-01T00:00:00Z')),
          lt('date', new Date('2020-01-01T00:00:00Z'))
        )
      )
    );
    expect(where).toEqual(and(eq('attended', true)));
  });

  it("keeps to the artist's shows", async () => {
    db.findOne.mockResolvedValue({ id: 'artist-1' });
    db.findMany.mockResolvedValue([{ showId: 'show-9', artistId: 'artist-1' }]);

    const { where } = await years({ attended: true, artist: { slug: 'wilco' } });

    expect(db.findMany).toHaveBeenCalledWith(showArtistsTable, { where: { artistId: 'artist-1' } });
    expect(where).toEqual(and(eq('attended', true), inList('id', ['show-9'])));
  });

  it('has no years for an artist that does not exist', async () => {
    db.findOne.mockResolvedValue(null);

    const connection = await resolvers.Query.shows({}, { artist: { slug: 'nobody' } });

    await expect(resolvers.ShowConnection.years(connection)).resolves.toEqual([]);
    expect(db.query).not.toHaveBeenCalled();
  });
});

describe('showStats', () => {
  const artist = (id: string, name: string) => ({ id, name }) as Artist;
  const venue = (id: string, name: string) => ({ id, name }) as Venue;
  // The schema's enum, which tests can't import: the server only imports its types
  const showStats = (entity: `${ShowEntityType}`) =>
    resolvers.Query.showStats({}, { entity: entity as ShowEntityType });

  beforeEach(() => {
    resetMocks();
  });

  it('counts the shows seen of each artist, most first', async () => {
    db.exec.mockResolvedValue({
      rows: [
        { id: 'artist-1', count: 2 },
        { id: 'artist-2', count: 5 },
      ],
    });
    db.findMany.mockResolvedValue([artist('artist-1', 'Wilco'), artist('artist-2', 'Spoon')]);

    const stats = await showStats('ARTIST');

    expect(stats).toEqual([
      { count: 5, entity: { id: 'artist-2', name: 'Spoon', type: 'artist' } },
      { count: 2, entity: { id: 'artist-1', name: 'Wilco', type: 'artist' } },
    ]);
    expect(stats.map(({ entity }) => resolvers.ShowEntity.__resolveType(entity))).toEqual([
      'Artist',
      'Artist',
    ]);
  });

  // It was answered as just { type: 'venue' }, and Venue.name can't be null, so the whole
  // query failed
  it('leaves out a venue deleted after its shows were counted', async () => {
    db.exec.mockResolvedValue({
      rows: [
        { id: 'venue-1', count: 3 },
        { id: 'venue-gone', count: 4 },
      ],
    });
    db.findMany.mockResolvedValue([venue('venue-1', 'Brooklyn Steel')]);

    await expect(showStats('VENUE')).resolves.toEqual([
      { count: 3, entity: { id: 'venue-1', name: 'Brooklyn Steel', type: 'venue' } },
    ]);
  });
});
