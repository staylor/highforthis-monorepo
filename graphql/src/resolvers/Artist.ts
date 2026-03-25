import type { Prisma, Artist, AppleMusicData, AppleMusicGenre, AppleMusicArtwork } from '@prisma/client';
import type {
  MutationCreateArtistArgs,
  MutationRemoveArtistArgs,
  MutationUpdateArtistArgs,
  QueryArtistArgs,
  QueryArtistsArgs,
} from 'types/graphql';
import type { z } from 'zod';

import prisma from '#/database';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { removeEntities, resolveJoin } from './utils/helpers';
import { createArtistSchema, updateArtistSchema } from './validations';

type AppleMusicWithIncludes = AppleMusicData & {
  genreNames: AppleMusicGenre[];
  artwork: AppleMusicArtwork | null;
};

type AppleMusicInput = NonNullable<z.infer<typeof updateArtistSchema>['appleMusic']>;

const artistIncludes = {
  appleMusic: { include: { genreNames: true, artwork: true } },
  featuredMedia: { include: { media: true } },
};

async function upsertAppleMusic(artistId: string, appleMusic: AppleMusicInput) {
  if (!appleMusic) return;

  const existing = await prisma.appleMusicData.findUnique({ where: { artistId } });
  if (existing) {
    await prisma.appleMusicData.update({
      where: { artistId },
      data: {
        appleId: appleMusic.id,
        url: appleMusic.url,
        genreNames: {
          deleteMany: {},
          create: (appleMusic.genreNames || []).map((name) => ({ name })),
        },
        artwork: appleMusic.artwork
          ? {
              upsert: {
                create: appleMusic.artwork,
                update: appleMusic.artwork,
              },
            }
          : undefined,
      },
    });
  } else {
    await prisma.appleMusicData.create({
      data: {
        artistId,
        appleId: appleMusic.id,
        url: appleMusic.url,
        genreNames: {
          create: (appleMusic.genreNames || []).map((name) => ({ name })),
        },
        artwork: appleMusic.artwork ? { create: appleMusic.artwork } : undefined,
      },
    });
  }
}

const resolvers = {
  Artist: {
    appleMusic(artist: Artist) {
      if ('appleMusic' in artist) return artist.appleMusic;
      return prisma.appleMusicData.findUnique({
        where: { artistId: artist.id },
        include: { genreNames: true, artwork: true },
      });
    },
    featuredMedia(artist: Artist) {
      return resolveJoin(artist, 'featuredMedia', 'media', () =>
        prisma.artistFeaturedMedia.findMany({
          where: { artistId: artist.id },
          include: { media: true },
        })
      );
    },
  },
  AppleMusicData: {
    id(data: AppleMusicWithIncludes) {
      return data.appleId;
    },
    genreNames(data: AppleMusicWithIncludes) {
      return (data.genreNames || []).map((g) => g.name);
    },
  },
  Query: {
    async artists(_: unknown, args: QueryArtistsArgs) {
      const { search, filtered, ...connectionArgs } = args;
      const where: Prisma.ArtistWhereInput = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (filtered) {
        where.excludeFromSearch = false;
      }
      return parseConnection(prisma.artist, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
        include: artistIncludes,
      });
    },

    async artist(_: unknown, { id, slug }: QueryArtistArgs) {
      if (id) {
        return prisma.artist.findUnique({ where: { id }, include: artistIncludes });
      }
      if (slug) {
        return prisma.artist.findUnique({ where: { slug }, include: artistIncludes });
      }
    },
  },
  Mutation: {
    async createArtist(_: unknown, { input }: MutationCreateArtistArgs) {
      const { featuredMedia, ...data } = createArtistSchema.parse(input);
      const slug = await getUniqueSlug(prisma.artist, data.name);
      return prisma.artist.create({
        data: {
          ...data,
          slug,
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId) => ({ mediaId })) }
            : undefined,
        },
        include: artistIncludes,
      });
    },

    async updateArtist(_: unknown, { id, input }: MutationUpdateArtistArgs) {
      const { featuredMedia, appleMusic, ...data } = updateArtistSchema.parse(input);
      if (typeof featuredMedia !== 'undefined') {
        await prisma.artistFeaturedMedia.deleteMany({ where: { artistId: id } });
        if (featuredMedia?.length) {
          await prisma.artistFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId) => ({ artistId: id, mediaId })),
          });
        }
      }
      if (appleMusic) {
        await upsertAppleMusic(id, appleMusic);
      }
      return prisma.artist.update({ where: { id }, data, include: artistIncludes });
    },

    async removeArtist(_: unknown, { ids }: MutationRemoveArtistArgs) {
      return removeEntities(prisma.artist, ids);
    },
  },
};

export default resolvers;
