import type {
  MutationRemoveMediaUploadArgs,
  MutationUpdateMediaUploadArgs,
  QueryMediaArgs,
  QueryUploadsArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';

import { parseConnection } from './utils/collection';

const mediaIncludes = {
  crops: true,
  audioArtists: true,
  audioAlbumArtists: true,
  audioGenres: true,
  audioImages: true,
};

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
    crops(media: any, _: unknown, { prisma }: AppContext) {
      if ('crops' in media) return media.crops;
      return prisma.imageUploadCrop.findMany({ where: { mediaId: media.id } });
    },
  },
  AudioUpload: {
    artist(media: any, _: unknown, { prisma }: AppContext) {
      if ('audioArtists' in media) return media.audioArtists.map((r: any) => r.name);
      return prisma.audioArtist
        .findMany({ where: { mediaId: media.id } })
        .then((records: any[]) => records.map((r) => r.name));
    },
    albumArtist(media: any, _: unknown, { prisma }: AppContext) {
      if ('audioAlbumArtists' in media) return media.audioAlbumArtists.map((r: any) => r.name);
      return prisma.audioAlbumArtist
        .findMany({ where: { mediaId: media.id } })
        .then((records: any[]) => records.map((r) => r.name));
    },
    genre(media: any, _: unknown, { prisma }: AppContext) {
      if ('audioGenres' in media) return media.audioGenres.map((r: any) => r.name);
      return prisma.audioGenre
        .findMany({ where: { mediaId: media.id } })
        .then((records: any[]) => records.map((r) => r.name));
    },
    images(media: any, _: unknown, { prisma }: AppContext) {
      if ('audioImages' in media) return media.audioImages;
      return prisma.audioImage.findMany({ where: { mediaId: media.id } });
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
        include: mediaIncludes,
      });
    },
    media(_: unknown, { id }: QueryMediaArgs, { prisma }: AppContext) {
      if (!id) return null;
      return prisma.mediaUpload.findUnique({ where: { id }, include: mediaIncludes });
    },
  },
  Mutation: {
    async updateMediaUpload(
      _: unknown,
      { id, input }: MutationUpdateMediaUploadArgs,
      { prisma }: AppContext
    ) {
      return prisma.mediaUpload.update({ where: { id }, data: input, include: mediaIncludes });
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
