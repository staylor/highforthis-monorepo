import type { Artist, Show, ShowArtist, Venue } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Show';

const db = vi.hoisted(() => ({
  show: { count: vi.fn(), findMany: vi.fn(), update: vi.fn() },
  showArtist: { findMany: vi.fn() },
  venue: { findMany: vi.fn(), findUnique: vi.fn() },
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
    return connection.edges.map(({ node }) => node as Show & { artists: ShowArtist[] });
  };

  it('gives each show its venue and artists', async () => {
    const [first, second, third] = await shows();

    expect(resolvers.Show.venue(first)).toEqual(venue('venue-1'));
    expect(resolvers.Show.venue(second)).toEqual(venue('venue-2'));
    expect(resolvers.Show.venue(third)).toEqual(venue('venue-1'));
    expect(resolvers.Show.artists(first)).toEqual([artist('artist-1'), artist('artist-3')]);
    expect(resolvers.Show.artists(second)).toEqual([artist('artist-2')]);
    expect(resolvers.Show.artists(third)).toEqual([]);
    expect(db.venue.findUnique).not.toHaveBeenCalled();
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
