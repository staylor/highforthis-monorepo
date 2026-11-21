import type { Artist, Show, Venue } from '@prisma/client';
import type { ShowEntityType } from 'types/graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Show';

const db = vi.hoisted(() => ({
  artist: { findMany: vi.fn(), findUnique: vi.fn() },
  show: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn(), update: vi.fn() },
  showArtist: { findMany: vi.fn(), groupBy: vi.fn() },
  venue: { findMany: vi.fn(), findUniqueOrThrow: vi.fn() },
}));

vi.mock('#/database', () => ({ default: db }));

describe('updateShow', () => {
  beforeEach(() => {
    db.show.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: 'show-1',
      ...data,
    }));
  });

  it('keeps the title, notes and URL when only Attended changes', async () => {
    await resolvers.Mutation.updateShow({}, { id: 'show-1', input: { attended: true } });

    expect(db.show.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: 'show-1' }, data: { attended: true } })
    );
  });

  it('clears the fields the edit form sends as null', async () => {
    await resolvers.Mutation.updateShow(
      {},
      { id: 'show-1', input: { attended: false, notes: null, title: null, url: null } }
    );

    expect(db.show.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { attended: false, notes: null, title: null, url: null } })
    );
  });
});

describe('shows', () => {
  const show = (id: string, venueId: string) => ({ id, venueId }) as Show;
  const venue = (id: string) => ({ id, name: id }) as Venue;
  const artist = (id: string) => ({ id, name: id }) as Artist;
  const link = (showId: string, artistId: string) => ({
    showId,
    artistId,
    artist: artist(artistId),
  });

  beforeEach(() => {
    vi.resetAllMocks();
    db.show.count.mockResolvedValue(3);
    db.show.findMany.mockResolvedValue([
      show('show-1', 'venue-1'),
      show('show-2', 'venue-2'),
      show('show-3', 'venue-1'),
    ]);
    db.venue.findMany.mockResolvedValue([venue('venue-1'), venue('venue-2')]);
    db.showArtist.findMany.mockResolvedValue([
      link('show-1', 'artist-1'),
      link('show-2', 'artist-2'),
      link('show-1', 'artist-3'),
    ]);
  });

  const shows = async () => {
    const connection = await resolvers.Query.shows({}, { attended: true, first: 1000 });
    return connection.edges.map(({ node }) => node);
  };

  it('gives each show its venue and artists', async () => {
    const [first, second, third] = await shows();

    expect(resolvers.Show.venue(first)).toEqual(venue('venue-1'));
    expect(resolvers.Show.venue(second)).toEqual(venue('venue-2'));
    expect(resolvers.Show.venue(third)).toEqual(venue('venue-1'));
    expect(resolvers.Show.artists(first)).toEqual([artist('artist-1'), artist('artist-3')]);
    expect(resolvers.Show.artists(second)).toEqual([artist('artist-2')]);
    expect(resolvers.Show.artists(third)).toEqual([]);
    expect(db.venue.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  // Show.venue is non-null, so a venue that can't be found is an error, not null
  it('looks up the venue of a show loaded without it', async () => {
    db.venue.findUniqueOrThrow.mockResolvedValue(venue('venue-2'));

    await expect(resolvers.Show.venue(show('show-2', 'venue-2'))).resolves.toEqual(
      venue('venue-2')
    );
    expect(db.venue.findUniqueOrThrow).toHaveBeenCalledWith({ where: { id: 'venue-2' } });
  });

  // An IN list of hundreds of IDs on ShowArtist.showId took Postgres longer to plan than to run
  it("finds the artists through the shows' IDs, and each venue once", async () => {
    await shows();

    expect(db.show.findMany.mock.calls[0][0]).not.toHaveProperty('include');
    expect(db.showArtist.findMany).toHaveBeenCalledWith({
      where: { show: { id: { in: ['show-1', 'show-2', 'show-3'] } } },
      include: { artist: true },
    });
    expect(db.venue.findMany).toHaveBeenCalledWith({
      where: { id: { in: ['venue-1', 'venue-2'] } },
    });
  });

  it('looks nothing up for an empty page', async () => {
    db.show.count.mockResolvedValue(0);
    db.show.findMany.mockResolvedValue([]);

    await expect(shows()).resolves.toEqual([]);
    expect(db.showArtist.findMany).not.toHaveBeenCalled();
    expect(db.venue.findMany).not.toHaveBeenCalled();
  });
});

describe('ShowConnection.years', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.show.count.mockResolvedValue(0);
    db.show.findMany.mockResolvedValue([]);
  });

  const years = async (args: Parameters<typeof resolvers.Query.shows>[1]) => {
    const connection = await resolvers.Query.shows({}, { first: 50, ...args });
    db.show.findMany.mockResolvedValueOnce([
      { date: new Date('2019-05-01T20:00:00Z') },
      { date: new Date('2024-03-01T20:00:00Z') },
      { date: new Date('2019-09-01T20:00:00Z') },
    ]);
    const list = await resolvers.ShowConnection.years(connection);
    return { list, where: db.show.findMany.mock.lastCall?.[0].where };
  };

  // The app's history asks for the years it can filter by, which once listed every show's
  it('lists the years of the shows the list was filtered to, newest first', async () => {
    const { list, where } = await years({ attended: true });

    expect(list).toEqual([2024, 2019]);
    expect(where).toEqual({ attended: true });
  });

  it("leaves out the list's dates, so every year stays in the menu", async () => {
    const { where } = await years({ attended: true, year: 2019 });

    expect(db.show.findMany.mock.calls[0][0].where).toEqual({
      attended: true,
      date: { gte: new Date('2019-01-01T00:00:00Z'), lt: new Date('2020-01-01T00:00:00Z') },
    });
    expect(where).toEqual({ attended: true });
  });

  it("keeps to the artist's shows", async () => {
    db.artist.findUnique.mockResolvedValue({ id: 'artist-1' });

    const { where } = await years({ attended: true, artist: { slug: 'wilco' } });

    expect(where).toEqual({ attended: true, artists: { some: { artistId: 'artist-1' } } });
  });

  it('has no years for an artist that does not exist', async () => {
    db.artist.findUnique.mockResolvedValue(null);

    const connection = await resolvers.Query.shows({}, { artist: { slug: 'nobody' } });

    await expect(resolvers.ShowConnection.years(connection)).resolves.toEqual([]);
    expect(db.show.findMany).not.toHaveBeenCalled();
  });
});

describe('showStats', () => {
  const artist = (id: string, name: string) => ({ id, name }) as Artist;
  const venue = (id: string, name: string) => ({ id, name }) as Venue;
  // The schema's enum, which tests can't import: the server only imports its types
  const showStats = (entity: `${ShowEntityType}`) =>
    resolvers.Query.showStats({}, { entity: entity as ShowEntityType });

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('counts the shows seen of each artist, most first', async () => {
    db.showArtist.groupBy.mockResolvedValue([
      { artistId: 'artist-1', _count: { artistId: 2 } },
      { artistId: 'artist-2', _count: { artistId: 5 } },
    ]);
    db.artist.findMany.mockResolvedValue([
      artist('artist-1', 'Wilco'),
      artist('artist-2', 'Spoon'),
    ]);

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
    db.show.groupBy.mockResolvedValue([
      { venueId: 'venue-1', _count: { venueId: 3 } },
      { venueId: 'venue-gone', _count: { venueId: 4 } },
    ]);
    db.venue.findMany.mockResolvedValue([venue('venue-1', 'Brooklyn Steel')]);

    await expect(showStats('VENUE')).resolves.toEqual([
      { count: 3, entity: { id: 'venue-1', name: 'Brooklyn Steel', type: 'venue' } },
    ]);
  });
});
