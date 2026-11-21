import type { Prisma, MediaUpload } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import prisma from '#/database';
import type { WithIncludes } from '#/models';

import { parseConnection } from './utils/collection';
import { removeEntities, resolveJoin, resolveType } from './utils/helpers';
import { updateMediaUploadSchema } from './validations';

const mediaIncludes = {
  crops: true,
  audioArtists: true,
  audioAlbumArtists: true,
  audioGenres: true,
  audioImages: true,
} satisfies Prisma.MediaUploadInclude;

/** An upload, with the relations in `mediaIncludes` when its query included them */
export type MediaUploadSource = WithIncludes<
  MediaUpload,
  Prisma.MediaUploadGetPayload<{ include: typeof mediaIncludes }>
>;

const resolvers = {
  MediaUpload: {
    __resolveType: resolveType(
      {
        image: 'ImageUpload',
        audio: 'AudioUpload',
        video: 'VideoUpload',
      },
      'FileUpload'
    ),
  },
  ImageUpload: {
    crops(media) {
      if (media.crops) return media.crops;
      return prisma.imageUploadCrop.findMany({ where: { mediaId: media.id } });
    },
  },
  AudioUpload: {
    artist(media) {
      return resolveJoin(media.audioArtists, 'name', () =>
        prisma.audioArtist.findMany({ where: { mediaId: media.id } })
      );
    },
    albumArtist(media) {
      return resolveJoin(media.audioAlbumArtists, 'name', () =>
        prisma.audioAlbumArtist.findMany({ where: { mediaId: media.id } })
      );
    },
    genre(media) {
      return resolveJoin(media.audioGenres, 'name', () =>
        prisma.audioGenre.findMany({ where: { mediaId: media.id } })
      );
    },
    images(media) {
      if (media.audioImages) return media.audioImages;
      return prisma.audioImage.findMany({ where: { mediaId: media.id } });
    },
  },
  MediaUploadConnection: {
    async types() {
      const results = await prisma.mediaUpload.findMany({
        distinct: ['type'],
        select: { type: true },
        orderBy: { type: 'asc' },
      });
      return results.map((r) => r.type);
    },
    async mimeTypes() {
      const results = await prisma.mediaUpload.findMany({
        distinct: ['mimeType'],
        select: { mimeType: true },
        orderBy: { mimeType: 'asc' },
      });
      return results.map((r) => r.mimeType);
    },
  },
  Query: {
    async uploads(_, args) {
      const { type, mimeType, search, ...connectionArgs } = args;
      const where: Prisma.MediaUploadWhereInput = {};
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
    media(_, { id }) {
      if (!id) return null;
      return prisma.mediaUpload.findUnique({ where: { id }, include: mediaIncludes });
    },
  },
  Mutation: {
    async updateMediaUpload(_, { id, input }) {
      const data = updateMediaUploadSchema.parse(input);
      return prisma.mediaUpload.update({ where: { id }, data, include: mediaIncludes });
    },

    async removeMediaUpload(_, { ids }) {
      return removeEntities(prisma.mediaUpload, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
