import type {
  AppleMusicAlbumCoverArgs,
  MutationAddAlbumCoversArgs,
  QueryAppleMusicAlbumsArgs,
} from 'types/graphql';

import { type Album, artworkUrl, getAlbums, searchAlbums } from '#/appleMusic';
import prisma from '#/database';
import { uploadFromUrl } from '#/uploads';

import { addAlbumCoversSchema } from './validations';

const resolvers = {
  AppleMusicAlbum: {
    cover({ artwork }: Album, { size }: AppleMusicAlbumCoverArgs) {
      return artworkUrl(artwork, size, size);
    },
  },
  Query: {
    async appleMusicAlbums(_: unknown, { term }: QueryAppleMusicAlbumsArgs) {
      try {
        return { albums: await searchAlbums(term), error: null };
      } catch (error) {
        return { albums: [], error: (error as Error).message };
      }
    },
  },
  Mutation: {
    // The albums are looked up again, so the server only downloads Apple's own artwork
    async addAlbumCovers(_: unknown, { ids }: MutationAddAlbumCoversArgs) {
      const albums = await getAlbums(addAlbumCoversSchema.parse(ids));
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
      return prisma.mediaUpload.findMany({
        where: { id: { in: mediaIds } },
        include: { crops: true },
      });
    },
  },
};

export default resolvers;
