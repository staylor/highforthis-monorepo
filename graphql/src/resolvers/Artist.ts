import type { Prisma, Artist } from '@prisma/client';
import type { Resolvers } from 'types/graphql';
import type { z } from 'zod';

import prisma from '#/database';
import type { WithIncludes } from '#/models';
import { getUniqueSlug } from '#/models/utils';

import { fillAppleMusic } from './utils/appleMusicData';
import { parseConnection } from './utils/collection';
import { parseInput, removeEntities, resolveJoin } from './utils/helpers';
import { createArtistSchema, updateArtistSchema } from './validations';

type AppleMusicInput = NonNullable<z.infer<typeof updateArtistSchema>['appleMusic']>;

const appleMusicIncludes = {
  genreNames: true,
  artwork: true,
} satisfies Prisma.AppleMusicDataInclude;

const artistIncludes = {
  appleMusic: { include: appleMusicIncludes },
  featuredMedia: { include: { media: true } },
} satisfies Prisma.ArtistInclude;

/** An artist, with the relations in `artistIncludes` when its query included them */
export type ArtistSource = WithIncludes<
  Artist,
  Prisma.ArtistGetPayload<{ include: typeof artistIncludes }>
>;

/** An artist's Apple Music data, with its genres and artwork */
export type AppleMusicDataSource = Prisma.AppleMusicDataGetPayload<{
  include: typeof appleMusicIncludes;
}>;

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

/**
 * A saved artist, with Apple Music's data looked up when the artist had none. Saving an artist
 * again is how to look once more for one Apple Music didn't have.
 */
async function withAppleMusic(artist: Prisma.ArtistGetPayload<{ include: typeof artistIncludes }>) {
  if (artist.appleMusic || !(await fillAppleMusic([artist.id]))) {
    return artist;
  }
  return prisma.artist.findUniqueOrThrow({ where: { id: artist.id }, include: artistIncludes });
}

const resolvers = {
  Artist: {
    appleMusic(artist) {
      if (artist.appleMusic !== undefined) return artist.appleMusic;
      return prisma.appleMusicData.findUnique({
        where: { artistId: artist.id },
        include: appleMusicIncludes,
      });
    },
    featuredMedia(artist) {
      return resolveJoin(artist.featuredMedia, 'media', () =>
        prisma.artistFeaturedMedia.findMany({
          where: { artistId: artist.id },
          include: { media: true },
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

    async artist(_, { id, slug }) {
      if (id) {
        return prisma.artist.findUnique({ where: { id }, include: artistIncludes });
      }
      if (slug) {
        return prisma.artist.findUnique({ where: { slug }, include: artistIncludes });
      }
      return null;
    },
  },
  Mutation: {
    async createArtist(_, { input }) {
      const { featuredMedia, ...data } = parseInput(createArtistSchema, input);
      const slug = await getUniqueSlug(prisma.artist, data.name);
      const artist = await prisma.artist.create({
        data: {
          ...data,
          slug,
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId) => ({ mediaId })) }
            : undefined,
        },
        include: artistIncludes,
      });
      return withAppleMusic(artist);
    },

    async updateArtist(_, { id, input }) {
      const { featuredMedia, appleMusic, ...data } = parseInput(updateArtistSchema, input);
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
      const artist = await prisma.artist.update({ where: { id }, data, include: artistIncludes });
      return withAppleMusic(artist);
    },

    async removeArtist(_, { ids }) {
      return removeEntities(prisma.artist, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
