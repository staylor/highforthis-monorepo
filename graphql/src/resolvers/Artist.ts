import type {
  MutationCreateArtistArgs,
  MutationRemoveArtistArgs,
  MutationUpdateArtistArgs,
  QueryArtistArgs,
  QueryArtistsArgs,
} from 'types/graphql';

import prisma from '#/database';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';

const artistIncludes = {
  appleMusic: { include: { genreNames: true, artwork: true } },
  featuredMedia: { include: { media: true } },
};

async function upsertAppleMusic(artistId: string, appleMusic: any) {
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
          create: (appleMusic.genreNames || []).map((name: string) => ({ name })),
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
          create: (appleMusic.genreNames || []).map((name: string) => ({ name })),
        },
        artwork: appleMusic.artwork ? { create: appleMusic.artwork } : undefined,
      },
    });
  }
}

const resolvers = {
  Artist: {
    appleMusic(artist: any) {
      if ('appleMusic' in artist) return artist.appleMusic;
      return prisma.appleMusicData.findUnique({
        where: { artistId: artist.id },
        include: { genreNames: true, artwork: true },
      });
    },
    featuredMedia(artist: any) {
      if ('featuredMedia' in artist) {
        return artist.featuredMedia.map((r: any) => r.media);
      }
      return prisma.artistFeaturedMedia
        .findMany({ where: { artistId: artist.id }, include: { media: true } })
        .then((records: any[]) => records.map((r) => r.media));
    },
  },
  AppleMusicData: {
    id(data: any) {
      return data.appleId;
    },
    genreNames(data: any) {
      return (data.genreNames || []).map((g: any) => g.name);
    },
  },
  Query: {
    async artists(_: unknown, args: QueryArtistsArgs) {
      const { search, filtered, ...connectionArgs } = args;
      const where: any = {};
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
        include: artistIncludes,
      });
    },

    async updateArtist(_: unknown, { id, input }: MutationUpdateArtistArgs) {
      const { featuredMedia, appleMusic, ...data } = input as any;
      if (typeof featuredMedia !== 'undefined') {
        await prisma.artistFeaturedMedia.deleteMany({ where: { artistId: id } });
        if (featuredMedia?.length) {
          await prisma.artistFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId: string) => ({ artistId: id, mediaId })),
          });
        }
      }
      if (appleMusic) {
        await upsertAppleMusic(id, appleMusic);
      }
      return prisma.artist.update({ where: { id }, data, include: artistIncludes });
    },

    async removeArtist(_: unknown, { ids }: MutationRemoveArtistArgs) {
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
