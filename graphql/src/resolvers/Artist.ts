import { ilike, inList, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { batchBy } from '#/database/batch';
import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import {
  appleMusicData,
  appleMusicDetails,
  artistAppleMusic,
  artistFeaturedMedia,
  artistFeaturedMediaUpload,
  artistMedia,
  artists,
  newId,
} from '#/database/tables';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { fillAppleMusic, saveAppleMusic } from './utils/appleMusicData';
import { parseConnection } from './utils/collection';
import { parseInput, removeRows, resolveJoin, unique } from './utils/helpers';
import { createArtistSchema, updateArtistSchema } from './validations';

type Artist = TableRow<typeof artists>;

const artistIncludes = { appleMusic: artistAppleMusic, featuredMedia: artistMedia };

/** An artist, with the relations in `artistIncludes` when its query loaded them */
export type ArtistSource = Artist & {
  appleMusic?: Loaded<typeof artistAppleMusic>;
  featuredMedia?: Loaded<typeof artistMedia>;
};

/** An artist's Apple Music data, with its genres and artwork */
export type AppleMusicDataSource = NonNullable<Loaded<typeof artistAppleMusic>>;

const findArtist = (id: string) => db.find(artists, id, { with: artistIncludes });

// The artists loaded without their Apple Music data, such as a show's, look it up together: one
// query for a tick's artists, as Prisma batched their findUnique calls
const loadAppleMusic = batchBy('artistId', (artistIds: string[]) =>
  db.findMany(appleMusicData, { where: inList('artistId', artistIds), with: appleMusicDetails })
);

/**
 * A saved artist, with Apple Music's data looked up when the artist had none. Saving an artist
 * again is how to look once more for one Apple Music didn't have.
 */
async function withAppleMusic<TArtist extends ArtistSource>(artist: TArtist) {
  if (artist.appleMusic || !(await fillAppleMusic([artist.id]))) {
    return artist;
  }
  return (await findArtist(artist.id)) ?? artist;
}

const resolvers = {
  Artist: {
    appleMusic(artist) {
      if (artist.appleMusic !== undefined) return artist.appleMusic;
      return loadAppleMusic(artist.id);
    },
    featuredMedia(artist) {
      return resolveJoin(artist.featuredMedia, 'media', () =>
        db.findMany(artistFeaturedMedia, {
          where: { artistId: artist.id },
          orderBy: ['position', 'asc'],
          with: { media: artistFeaturedMediaUpload },
        })
      );
    },
  },
  AppleMusicData: {
    id(data) {
      return data.appleId;
    },
    genreNames(data) {
      return (data.genreNames || []).map((g) => g.name);
    },
  },
  Query: {
    async artists(_, args) {
      const { search, filtered, ...connectionArgs } = args;
      let query = db.query(artists);
      if (search) {
        const pattern = containing(search);
        query = query.where(or(ilike('name', pattern), ilike('slug', pattern)));
      }
      if (filtered) {
        query = query.where({ excludeFromSearch: false });
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query
              .with(artistIncludes)
              .orderBy('name', 'asc')
              .orderBy('id', 'asc')
              .offset(skip)
              .limit(take)
              .all(),
        },
        connectionArgs
      );
    },

    async artist(_, { id, slug }) {
      if (id) {
        return findArtist(id);
      }
      if (slug) {
        return db.findOne(artists, { where: { slug }, with: artistIncludes });
      }
      return null;
    },
  },
  Mutation: {
    async createArtist(_, { input }) {
      const { featuredMedia, ...data } = parseInput(createArtistSchema, input);
      const media = unique(featuredMedia ?? []);
      const slug = await getUniqueSlug(slugsIn(db, artists), data.name);
      const id = newId();
      await db.transaction(async (tx) => {
        await tx.create(artists, { ...data, id, slug });
        if (media.length) {
          await tx.createMany(
            artistFeaturedMedia,
            media.map((mediaId, position) => ({ artistId: id, mediaId, position }))
          );
        }
      });
      const artist = await findArtist(id);
      return artist && withAppleMusic(artist);
    },

    async updateArtist(_, { id, input }) {
      const { featuredMedia, appleMusic, ...data } = parseInput(updateArtistSchema, input);
      // All of it is saved, or none of it, so a list that can't be saved isn't left emptied
      const artist = await db.transaction(async (tx) => {
        if (featuredMedia !== undefined) {
          const media = unique(featuredMedia ?? []);
          await tx.deleteMany(artistFeaturedMedia, { where: { artistId: id } });
          if (media.length) {
            await tx.createMany(
              artistFeaturedMedia,
              media.map((mediaId, position) => ({ artistId: id, mediaId, position }))
            );
          }
        }
        if (appleMusic) {
          await saveAppleMusic(id, appleMusic, tx);
        }
        return tx.update(artists, id, data, { with: artistIncludes });
      });
      return withAppleMusic(artist);
    },

    async removeArtist(_, { ids }) {
      return removeRows(artists, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
