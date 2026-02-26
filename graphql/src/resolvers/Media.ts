import type {
  MutationRemoveMediaUploadArgs,
  MutationUpdateMediaUploadArgs,
  QueryMediaArgs,
  QueryUploadsArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';

import { parseConnection } from './utils/collection';

const resolvers = {
  MediaUpload: {
    __resolveType(media: any) {
      if (media.type === 'image') return 'ImageUpload';
      if (media.type === 'audio') return 'AudioUpload';
      if (media.type === 'video') return 'VideoUpload';
      return 'FileUpload';
    },
  },
  ImageUpload: {
    crops(media: any) {
      return media.crops || [];
    },
  },
  AudioUpload: {
    artist(media: any) {
      return media.artist || [];
    },
    albumArtist(media: any) {
      return media.albumArtist || [];
    },
    genre(media: any) {
      return media.genre || [];
    },
    images(media: any) {
      return media.images || [];
    },
  },
  MediaUploadConnection: {
    async types(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const results = await prisma.mediaUpload.findMany({
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      });
      return results.map((r: any) => r.type);
    },
    async mimeTypes(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const results = await prisma.mediaUpload.findMany({
        distinct: ['mimeType'],
        select: { mimeType: true },
        orderBy: { mimeType: 'asc' },
      });
      return results.map((r: any) => r.mimeType);
    },
  },
  Query: {
    async uploads(_: unknown, args: QueryUploadsArgs, { prisma }: AppContext) {
      const { type, mimeType, search, ...connectionArgs } = args;
      const where: any = {};
      if (type) where.type = type;
      if (mimeType) where.mimeType = mimeType;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { originalName: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.mediaUpload, connectionArgs, {
        where,
        orderBy: { createdAt: 'desc' },
      });
    },
    media(_: unknown, { id }: QueryMediaArgs, { prisma }: AppContext) {
      if (!id) return null;
      return prisma.mediaUpload.findUnique({ where: { id } });
    },
  },
  Mutation: {
    async updateMediaUpload(
      _: unknown,
      { id, input }: MutationUpdateMediaUploadArgs,
      { prisma }: AppContext
    ) {
      return prisma.mediaUpload.update({ where: { id }, data: input });
    },

    async removeMediaUpload(
      _: unknown,
      { ids }: MutationRemoveMediaUploadArgs,
      { prisma }: AppContext
    ) {
      try {
        await prisma.mediaUpload.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
