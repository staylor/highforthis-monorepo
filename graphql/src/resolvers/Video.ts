import type {
  MutationCreateVideoArgs,
  MutationRemoveVideoArgs,
  MutationUpdateVideoArgs,
  QueryVideoArgs,
  QueryVideosArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';
import { getUniqueSlug } from '~/models/utils';

import { parseConnection } from './utils/collection';

const resolvers = {
  Video: {
    publishedAt(video: any) {
      return new Date(video.publishedAt).getTime();
    },
    createdAt(video: any) {
      return new Date(video.createdAt).getTime();
    },
    updatedAt(video: any) {
      return new Date(video.updatedAt).getTime();
    },
    thumbnails(video: any) {
      return video.thumbnails || [];
    },
  },
  VideoConnection: {
    async years(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const results = await prisma.video.findMany({
        distinct: ['year'],
        select: { year: true },
        where: { year: { not: 0 } },
        orderBy: { year: 'desc' },
      });
      return results.map((r: any) => r.year);
    },
  },
  Query: {
    async videos(_: unknown, args: QueryVideosArgs, { prisma }: AppContext) {
      const { year, search, ...connectionArgs } = args;
      const where: any = {};
      if (year) where.year = year;
      if (search) {
        where.title = { contains: search, mode: 'insensitive' };
      }
      return parseConnection(prisma.video, connectionArgs, {
        where,
        orderBy: [{ year: 'desc' }, { position: 'desc' }],
      });
    },

    video(_: unknown, { id, slug }: QueryVideoArgs, { prisma }: AppContext) {
      if (id) {
        return prisma.video.findUnique({ where: { id } });
      }
      if (slug) {
        return prisma.video.findUnique({ where: { slug } });
      }
    },
  },
  Mutation: {
    async createVideo(_: unknown, { input }: MutationCreateVideoArgs, { prisma }: AppContext) {
      const data = { ...input } as any;
      data.slug = await getUniqueSlug(prisma.video, data.title);
      data.publishedAt = new Date(data.publishedAt);
      return prisma.video.create({ data });
    },

    async updateVideo(
      _: unknown,
      { id, input }: MutationUpdateVideoArgs,
      { prisma }: AppContext
    ) {
      const data = { ...input } as any;
      if (data.publishedAt) {
        data.publishedAt = new Date(data.publishedAt);
      }
      return prisma.video.update({ where: { id }, data });
    },

    async removeVideo(_: unknown, { ids }: MutationRemoveVideoArgs, { prisma }: AppContext) {
      try {
        await prisma.video.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
