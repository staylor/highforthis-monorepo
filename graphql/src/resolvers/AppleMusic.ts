import { inList } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { artworkUrl, getAlbums, searchAlbums } from '#/appleMusic';
import db from '#/database/db';
import { mediaDetails, mediaUploads } from '#/database/tables';
import { uploadFromUrl } from '#/uploads';

import { parseInput } from './utils/helpers';
import { addAlbumCoversSchema } from './validations';

const resolvers = {
  AppleMusicAlbum: {
    cover({ artwork }, { size }) {
      return artworkUrl(artwork, size, size);
    },
  },
  Query: {
    async appleMusicAlbums(_, { term }) {
      try {
        return { albums: await searchAlbums(term), error: null };
      } catch (error) {
        return { albums: [], error: (error as Error).message };
      }
    },
  },
  Mutation: {
    // The albums are looked up again, so the server only downloads Apple's own artwork
    async addAlbumCovers(_, { ids }) {
      const albums = await getAlbums(parseInput(addAlbumCoversSchema, ids));
      const mediaIds: string[] = [];
      // One at a time: a full-size cover can be several megabytes
      for (const { name, artistName, artwork } of albums) {
        mediaIds.push(
          await uploadFromUrl(
            artworkUrl(artwork, artwork.width, artwork.height),
            `${artistName} - ${name}`,
            { title: `${artistName} – ${name}`, altText: `Cover of ${name} by ${artistName}` }
          )
        );
      }
      return db.findMany(mediaUploads, {
        where: inList('id', mediaIds),
        with: { crops: mediaDetails.crops },
      });
    },
  },
} satisfies Resolvers;

export default resolvers;
