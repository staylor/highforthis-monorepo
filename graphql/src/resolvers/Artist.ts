import type {
  MutationCreateArtistArgs,
  MutationRemoveArtistArgs,
  MutationUpdateArtistArgs,
  QueryArtistArgs,
  QueryArtistsArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';
import { getUniqueSlug } from '~/models/utils';

import { parseConnection } from './utils/collection';

const resolvers = {
  Artist: {
    async featuredMedia(artist: any, _: unknown, { prisma }: AppContext) {
      const records = await prisma.artistFeaturedMedia.findMany({
        where: { artistId: artist.id },
        include: { media: true },
      });
      return records.map((r: any) => r.media);
    },
  },
  Query: {
    async artists(_: unknown, args: QueryArtistsArgs, { prisma }: AppContext) {
      const { search, filtered, ...connectionArgs } = args;
      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      if (filtered) {
        where.excludeFromSearch = false;
      }
      return parseConnection(prisma.artist, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
      });
    },

    async artist(_: unknown, { id, slug }: QueryArtistArgs, { prisma }: AppContext) {
      if (id) {
        return prisma.artist.findUnique({ where: { id } });
      }
      if (slug) {
        return prisma.artist.findUnique({ where: { slug } });
      }
    },
  },
  Mutation: {
    async createArtist(_: unknown, { input }: MutationCreateArtistArgs, { prisma }: AppContext) {
      const { featuredMedia, ...data } = input as any;
      const slug = await getUniqueSlug(prisma.artist, data.name);
      return prisma.artist.create({
        data: {
          ...data,
          slug,
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId: string) => ({ mediaId })) }
            : undefined,
        },
      });
    },

    async updateArtist(
      _: unknown,
      { id, input }: MutationUpdateArtistArgs,
      { prisma }: AppContext
    ) {
      const { featuredMedia, ...data } = input as any;
      const updateData: any = { ...data };
      if (typeof featuredMedia !== 'undefined') {
        await prisma.artistFeaturedMedia.deleteMany({ where: { artistId: id } });
        if (featuredMedia?.length) {
          await prisma.artistFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId: string) => ({ artistId: id, mediaId })),
          });
        }
      }
      return prisma.artist.update({ where: { id }, data: updateData });
    },

    async removeArtist(_: unknown, { ids }: MutationRemoveArtistArgs, { prisma }: AppContext) {
      try {
        await prisma.artist.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
