import { getTableColumns, getTableName, getTablePrimaryKey, type AnyTable } from 'remix/data-table';
import type { PostStatus } from 'types/graphql';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import db from '#/database/db';
import {
  appleMusicArtworks,
  appleMusicData,
  appleMusicGenres,
  artistFeaturedMedia,
  artists,
  imageUploadCrops,
  mediaUploads,
  postArtists,
  postFeaturedMedia,
  posts,
  showArtists,
  shows,
  venueFeaturedMedia,
  venues,
} from '#/database/tables';
import type { Listing } from '#/listings/types';

import artistResolvers, { type ArtistSource } from '../Artist';
import listingResolvers from '../Listing';
import postResolvers, { type PostSource } from '../Post';
import showResolvers, { type ShowSource } from '../Show';
import venueResolvers, { type VenueSource } from '../Venue';
import { fillAppleMusicLater } from '../utils/appleMusicData';

const { fillAppleMusic, getListings } = vi.hoisted(() => ({
  fillAppleMusic: vi.fn(async () => 0),
  getListings: vi.fn(),
}));

// The resolvers save and read through an in-memory SQLite database, which runs their queries
vi.mock('#/database/db', async () => {
  const { createSqliteDatabase } = await import('remix/data-table/sqlite');
  return { default: createSqliteDatabase({ filename: ':memory:' }) };
});
vi.mock('../utils/appleMusicData', () => ({
  fillAppleMusic,
  fillAppleMusicLater: vi.fn(),
  saveAppleMusic: vi.fn(),
}));
vi.mock('#/listings', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/listings')>()),
  getListings,
}));

/**
 * Makes a table as tables.ts describes it. A join table keeps its rows in its key's order, so rows
 * read without an order come back by key, as Postgres reads them through a primary key's index:
 * one show's artists by artist ID.
 */
async function createTable(table: AnyTable, { join = false } = {}) {
  const quote = (columns: readonly string[]) => columns.map((column) => `"${column}"`).join(', ');
  const columns = Object.keys(getTableColumns(table));
  const key = [getTablePrimaryKey(table)].flat();
  await db.exec(
    `create table "${getTableName(table)}" (${quote(columns)}, primary key (${quote(key)}))${join ? ' without rowid' : ''}`
  );
}

const artistNames: Record<string, string> = {
  'artist-1': 'Drive-By Truckers',
  'artist-2': 'Jason Isbell',
  'artist-3': 'Amanda Shires',
};
const names = (ids: string[]) => ids.map((id) => artistNames[id]);

// Lists saved, then saved again in another order. Neither is the order of their IDs.
const lineup = ['artist-2', 'artist-3', 'artist-1'];
const newLineup = ['artist-3', 'artist-1', 'artist-2'];
const media = ['media-2', 'media-3', 'media-1'];
const newMedia = ['media-3', 'media-1', 'media-2'];

const ids = (records: { id: string }[]) => records.map((record) => record.id);

/**
 * A list as each way of reading it answers: from a record loaded alone, from a page of records,
 * and from a record loaded without the list
 */
async function read<TSource extends { id: string }>(
  id: string,
  {
    find,
    page,
    list,
  }: {
    find: (id: string) => Promise<TSource | null>;
    page: () => Promise<{ edges: { node: TSource }[] }>;
    list: (source: TSource) => { id: string }[] | Promise<{ id: string }[]>;
  }
) {
  const found = await find(id);
  const listed = (await page()).edges.find(({ node }) => node.id === id)?.node;
  const sources = [found, listed, { id } as TSource];
  return Promise.all(
    sources.map(async (source) => {
      expect(source).toBeDefined();
      return ids(await list(source!));
    })
  );
}

describe('a list', () => {
  beforeAll(async () => {
    for (const table of [
      venues,
      mediaUploads,
      imageUploadCrops,
      artists,
      appleMusicData,
      appleMusicGenres,
      appleMusicArtworks,
      shows,
      posts,
    ]) {
      await createTable(table);
    }
    for (const table of [
      venueFeaturedMedia,
      artistFeaturedMedia,
      showArtists,
      postFeaturedMedia,
      postArtists,
    ]) {
      await createTable(table, { join: true });
    }

    for (const [id, name] of Object.entries(artistNames)) {
      await db.create(artists, { id, name, slug: id });
    }
    for (const id of ['media-1', 'media-2', 'media-3']) {
      await db.create(mediaUploads, {
        id,
        originalName: `${id}.jpg`,
        destination: 'uploads',
        fileName: `${id}.jpg`,
        mimeType: 'image/jpeg',
        type: 'image',
        fileSize: 1,
      });
    }
    await db.create(venues, { id: 'venue-1', name: 'Forest Hills Stadium', slug: 'forest-hills' });
  });

  describe("a show's lineup", () => {
    const artistsOf = (id: string) =>
      read<ShowSource>(id, {
        find: (id) => showResolvers.Query.show({}, { id }),
        page: () => showResolvers.Query.shows({}, { first: 50 }),
        list: (show) => showResolvers.Show.artists(show),
      });

    it('is read in the order it was saved', async () => {
      const show = await showResolvers.Mutation.createShow(
        {},
        { input: { artists: lineup, schedule: { localDate: '2027-07-30' }, venue: 'venue-1' } }
      );

      await expect(artistsOf(show!.id)).resolves.toEqual([lineup, lineup, lineup]);

      await showResolvers.Mutation.updateShow({}, { id: show!.id, input: { artists: newLineup } });

      await expect(artistsOf(show!.id)).resolves.toEqual([newLineup, newLineup, newLineup]);
    });

    it("stays as it was when the show can't be saved", async () => {
      const show = await showResolvers.Mutation.createShow(
        {},
        { input: { artists: lineup, schedule: { localDate: '2027-07-31' }, venue: 'venue-1' } }
      );
      // Turns down a show saved with this title, after its new lineup has been saved
      await db.exec(
        `create trigger refuse_show before update on "Show" when new."title" = 'Refused' begin select raise(abort, 'refused'); end`
      );

      await expect(
        showResolvers.Mutation.updateShow(
          {},
          { id: show!.id, input: { artists: newLineup, title: 'Refused' } }
        )
      ).rejects.toThrow('Database execution failed');

      await expect(artistsOf(show!.id)).resolves.toEqual([lineup, lineup, lineup]);
    });

    it('keeps the order of a show added with others', async () => {
      await showResolvers.Mutation.bulkCreateShows(
        {},
        {
          input: [
            {
              artists: names(lineup),
              schedule: { localDate: '2027-08-01' },
              venue: 'Ryman Auditorium',
            },
          ],
        }
      );
      const venue = await db.findOne(venues, { where: { name: 'Ryman Auditorium' } });
      const show = await db.findOne(shows, { where: { venueId: venue!.id } });

      await expect(artistsOf(show!.id)).resolves.toEqual([lineup, lineup, lineup]);
    });

    it("keeps the order of a show added from a venue's listings", async () => {
      await db.create(venues, {
        id: 'venue-2',
        name: 'Brooklyn Steel',
        slug: 'brooklyn-steel',
        listingsUrl: 'https://example.com/listings',
      });
      const listing: Listing = {
        source: 'aeg',
        sourceId: 'event-1',
        localDate: '2027-08-02',
        localTime: '20:00',
        startsAt: new Date('2027-08-03T00:00:00Z'),
        timeZone: 'America/New_York',
        headliners: names(lineup).slice(0, 1),
        support: names(lineup).slice(1),
        status: null,
        cancelled: false,
        url: null,
      };
      getListings.mockResolvedValue({ source: 'aeg', listings: [listing] });

      await listingResolvers.Mutation.importListings(
        {},
        { venueId: 'venue-2', input: [{ sourceId: 'event-1', artists: names(lineup) }] }
      );
      const show = await db.findOne(shows, { where: { sourceId: 'event-1' } });

      await expect(artistsOf(show!.id)).resolves.toEqual([lineup, lineup, lineup]);
    });
  });

  it('recognizes a postponed listing even after its original date has passed', async () => {
    const venueId = 'postponed-venue';
    await db.create(venues, {
      id: venueId,
      name: 'Club',
      slug: 'club',
      listingsUrl: 'https://example.com',
    });
    await db.create(shows, {
      id: 'postponed',
      venueId,
      source: 'aeg',
      sourceId: 'moved',
      localDate: '2020-01-01',
    });
    getListings.mockResolvedValue({
      source: 'aeg',
      listings: [
        {
          source: 'aeg',
          sourceId: 'moved',
          localDate: '2030-01-10',
          startsAt: new Date('2030-01-11T01:00:00Z'),
          headliners: ['Artist'],
          support: [],
        },
      ],
    });
    const preview = await listingResolvers.Query.venueListings({}, { venueId });
    expect(preview.listings[0]).toMatchObject({ show: { id: 'postponed' }, dateChanged: true });
    await expect(
      listingResolvers.Mutation.importListings(
        {},
        {
          venueId,
          input: [{ sourceId: 'moved', artists: ['Artist'] }],
        }
      )
    ).resolves.toMatchObject({ showsCreated: 0 });
  });

  describe("a venue's featured media", () => {
    const mediaOf = (id: string) =>
      read<VenueSource>(id, {
        find: (id) => venueResolvers.Query.venue({}, { id }),
        page: () => venueResolvers.Query.venues({}, { first: 50 }),
        list: (venue) => venueResolvers.Venue.featuredMedia(venue),
      });

    it('is read in the order it was saved', async () => {
      const venue = await venueResolvers.Mutation.createVenue(
        {},
        {
          input: {
            name: 'Radio City Music Hall',
            coordinates: { latitude: 40.76, longitude: -73.98 },
            featuredMedia: media,
          },
        }
      );

      await expect(mediaOf(venue!.id)).resolves.toEqual([media, media, media]);

      await venueResolvers.Mutation.updateVenue(
        {},
        { id: venue!.id, input: { featuredMedia: newMedia } }
      );

      await expect(mediaOf(venue!.id)).resolves.toEqual([newMedia, newMedia, newMedia]);
    });
  });

  describe("an artist's featured media", () => {
    const mediaOf = (id: string) =>
      read<ArtistSource>(id, {
        find: (id) => artistResolvers.Query.artist({}, { id }),
        page: () => artistResolvers.Query.artists({}, { first: 50 }),
        list: (artist) => artistResolvers.Artist.featuredMedia(artist),
      });

    it('is read in the order it was saved', async () => {
      const artist = await artistResolvers.Mutation.createArtist(
        {},
        { input: { name: 'The 400 Unit', featuredMedia: media } }
      );

      await expect(mediaOf(artist!.id)).resolves.toEqual([media, media, media]);

      await artistResolvers.Mutation.updateArtist(
        {},
        { id: artist!.id, input: { featuredMedia: newMedia } }
      );

      await expect(mediaOf(artist!.id)).resolves.toEqual([newMedia, newMedia, newMedia]);
    });
  });

  describe("a post's featured media and artists", () => {
    const reading = {
      find: (id: string) => postResolvers.Query.post({}, { id }, {}),
      page: () => postResolvers.Query.posts({}, { first: 50 }, {}),
    };
    const mediaOf = (id: string) =>
      read<PostSource>(id, { ...reading, list: (post) => postResolvers.Post.featuredMedia(post) });
    const artistsOf = (id: string) =>
      read<PostSource>(id, { ...reading, list: (post) => postResolvers.Post.artists(post) });

    it('accepts the Unix epoch on create and update', async () => {
      const { createPost, updatePost } = postResolvers.Mutation;
      const created = await createPost({}, { input: { title: 'At the epoch', date: 0 } });
      expect(new Date(created!.date).getTime()).toBe(0);
      await updatePost({}, { id: created!.id, input: { date: 1 } });
      const updated = await updatePost({}, { id: created!.id, input: { date: 0 } });
      expect(new Date(updated!.date).getTime()).toBe(0);
    });

    it('rolls back new artists and skips enrichment when a post save fails', async () => {
      const { createPost, updatePost } = postResolvers.Mutation;
      const post = await createPost({}, { input: { title: 'Original' } });
      await db.exec(`create trigger refuse_post_tag before insert on "PostArtist"
        when new."artistId" not in ('artist-1','artist-2','artist-3')
        begin select raise(abort, 'refused tag'); end`);
      vi.mocked(fillAppleMusicLater).mockClear();
      try {
        const input = { title: 'Refused post', artists: ['Unsaved artist'] };
        await expect(createPost({}, { input })).rejects.toThrow('Database execution failed');
        await expect(updatePost({}, { id: post!.id, input })).rejects.toThrow(
          'Database execution failed'
        );
        await expect(
          db.findOne(artists, { where: { name: 'Unsaved artist' } })
        ).resolves.toBeNull();
        await expect(db.findOne(posts, { where: { title: 'Refused post' } })).resolves.toBeNull();
        expect(fillAppleMusicLater).not.toHaveBeenCalled();
      } finally {
        await db.exec('drop trigger refuse_post_tag');
      }
    });

    it('are read in the order they were saved', async () => {
      const post = await postResolvers.Mutation.createPost(
        {},
        {
          input: {
            title: 'Jason Isbell at Forest Hills',
            status: 'PUBLISH' as PostStatus,
            featuredMedia: media,
            artists: names(lineup),
          },
        }
      );

      await expect(mediaOf(post!.id)).resolves.toEqual([media, media, media]);
      await expect(artistsOf(post!.id)).resolves.toEqual([lineup, lineup, lineup]);

      await postResolvers.Mutation.updatePost(
        {},
        { id: post!.id, input: { featuredMedia: newMedia, artists: names(newLineup) } }
      );

      await expect(mediaOf(post!.id)).resolves.toEqual([newMedia, newMedia, newMedia]);
      await expect(artistsOf(post!.id)).resolves.toEqual([newLineup, newLineup, newLineup]);
    });
  });
});
