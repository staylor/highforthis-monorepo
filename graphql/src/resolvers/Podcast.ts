import type {
  MutationCreatePodcastArgs,
  MutationRemovePodcastArgs,
  MutationUpdatePodcastArgs,
  QueryPodcastArgs,
  QueryPodcastsArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';

import { parseConnection } from './utils/collection';

const resolvers = {
  Podcast: {
    async audio(podcast: any, _: unknown, { prisma }: AppContext) {
      if (!podcast.audioId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.audioId } });
    },
    async image(podcast: any, _: unknown, { prisma }: AppContext) {
      if (!podcast.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.imageId } });
    },
    date(podcast: any) {
      return new Date(podcast.updatedAt).getTime();
    },
  },
  Query: {
    async podcasts(_: unknown, args: QueryPodcastsArgs, { prisma }: AppContext) {
      const { search, order, ...connectionArgs } = args;
      const where: any = {};
      if (search) {
        where.title = { contains: search, mode: 'insensitive' };
      }
      return parseConnection(prisma.podcast, connectionArgs, {
        where,
        orderBy: { createdAt: order === 'ASC' ? 'asc' : 'desc' },
      });
    },

    async podcast(_: unknown, { id }: QueryPodcastArgs, { prisma }: AppContext) {
      if (!id) return null;
      return prisma.podcast.findUnique({ where: { id } });
    },
  },
  Mutation: {
    async createPodcast(_: unknown, { input }: MutationCreatePodcastArgs, { prisma }: AppContext) {
      return prisma.podcast.create({ data: input as any });
    },

    async updatePodcast(
      _: unknown,
      { id, input }: MutationUpdatePodcastArgs,
      { prisma }: AppContext
    ) {
      return prisma.podcast.update({ where: { id }, data: input as any });
    },

    async removePodcast(
      _: unknown,
      { ids }: MutationRemovePodcastArgs,
      { prisma }: AppContext
    ) {
      try {
        await prisma.podcast.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
