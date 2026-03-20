import type {
  MutationCreateShowArgs,
  MutationRemoveShowArgs,
  MutationUpdateShowArgs,
  QueryShowArgs,
  QueryShowStatsArgs,
  QueryShowsArgs,
  UpdateShowInput,
} from 'types/graphql';

import prisma from '#/database';

import { parseConnection, emptyConnection } from './utils/collection';
import { removeEntities, resolveJoin, timestampResolver } from './utils/helpers';

const showIncludes = {
  artists: { include: { artist: true } },
  venue: true,
};

async function getEntityStats(
  counts: { id: string; count: number }[],
  lookup: (ids: string[]) => Promise<any[]>,
  type: string
) {
  const ids = counts.map((c) => c.id);
  const entities = await lookup(ids);
  const entityMap = new Map(entities.map((e: any) => [e.id, e]));
  return counts
    .map(({ id, count }) => ({
      count,
      entity: { ...entityMap.get(id), type },
    }))
    .sort((a, b) => b.count - a.count || (a.entity.name ?? '').localeCompare(b.entity.name ?? ''));
}

const resolvers = {
  Show: {
    date: timestampResolver('date'),
    artists(show: any) {
      return resolveJoin(show, 'artists', 'artist', () =>
        prisma.showArtist.findMany({
          where: { showId: show.id },
          include: { artist: true },
        })
      );
    },
    venue(show: any) {
      if ('venue' in show && show.venue && typeof show.venue === 'object') {
        return show.venue;
      }
      return prisma.venue.findUnique({ where: { id: show.venueId } });
    },
  },
  ShowEntity: {
    __resolveType(entity: any) {
      if (entity.type === 'artist') return 'Artist';
      if (entity.type === 'venue') return 'Venue';
    },
  },
  ShowConnection: {
    async years(_0: unknown, args: QueryShowsArgs) {
      const where: any = {};
      if (args.attended) {
        where.attended = true;
      }
      const results = await prisma.show.findMany({
        where,
        select: { date: true },
      });
      const yearSet = new Set(results.map((r: any) => new Date(r.date).getFullYear()));
      return Array.from(yearSet).sort((a, b) => b - a);
    },
  },
  Query: {
    async shows(_: unknown, args: QueryShowsArgs) {
      const { artist, venue, latest, attended, year, search, order, ...connectionArgs } = args;
      const where: any = {};

      if (attended) {
        where.attended = true;
      } else if (latest) {
        where.date = { gte: new Date() };
      }

      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);
        where.date = { gte: startDate, lt: endDate };
      }

      if (artist?.id) {
        where.artists = { some: { artistId: artist.id } };
      } else if (artist?.slug) {
        const node = await prisma.artist.findUnique({ where: { slug: artist.slug } });
        if (node) {
          where.artists = { some: { artistId: node.id } };
        } else {
          return emptyConnection();
        }
      }

      if (venue?.id) {
        where.venueId = venue.id;
      } else if (venue?.slug) {
        const node = await prisma.venue.findUnique({ where: { slug: venue.slug } });
        if (node) {
          where.venueId = node.id;
        } else {
          return emptyConnection();
        }
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { venue: { name: { contains: search, mode: 'insensitive' } } },
          { artists: { some: { artist: { name: { contains: search, mode: 'insensitive' } } } } },
        ];
      }

      return parseConnection(prisma.show, connectionArgs, {
        where,
        orderBy: { date: order === 'ASC' || (!order && latest) ? 'asc' : 'desc' },
        include: showIncludes,
      });
    },

    async show(_: unknown, { id, lastAdded }: QueryShowArgs) {
      if (lastAdded) {
        return prisma.show.findFirst({ orderBy: { createdAt: 'desc' }, include: showIncludes });
      }
      if (id) {
        return prisma.show.findUnique({ where: { id }, include: showIncludes });
      }
      return null;
    },

    async showStats(_: unknown, { entity }: QueryShowStatsArgs) {
      if (entity.toLowerCase() === 'artist') {
        const results = await prisma.showArtist.groupBy({
          by: ['artistId'],
          where: { show: { attended: true } },
          _count: { artistId: true },
        });
        return getEntityStats(
          results.map((r: any) => ({ id: r.artistId, count: r._count.artistId })),
          (ids) => prisma.artist.findMany({ where: { id: { in: ids } } }),
          'artist'
        );
      }

      const results = await prisma.show.groupBy({
        by: ['venueId'],
        where: { attended: true },
        _count: { venueId: true },
      });
      return getEntityStats(
        results.map((r: any) => ({ id: r.venueId, count: r._count.venueId })),
        (ids) => prisma.venue.findMany({ where: { id: { in: ids } } }),
        'venue'
      );
    },
  },
  Mutation: {
    async createShow(_: unknown, { input }: MutationCreateShowArgs) {
      const { artists, venue, date, ...data } = input as any;
      return prisma.show.create({
        data: {
          ...data,
          date: new Date(date),
          venueId: venue,
          artists: artists?.length
            ? { create: artists.map((artistId: string) => ({ artistId })) }
            : undefined,
        },
        include: showIncludes,
      });
    },

    async updateShow(_: unknown, { id, input }: MutationUpdateShowArgs) {
      const { artists, venue, date, ...data } = input as any;
      const values: any = { ...data };

      for (const key of ['title', 'notes', 'url']) {
        if (!input[key as keyof UpdateShowInput]) {
          values[key] = null;
        }
      }

      if (date) values.date = new Date(date);
      if (venue) values.venueId = venue;

      if (typeof artists !== 'undefined') {
        await prisma.showArtist.deleteMany({ where: { showId: id } });
        if (artists?.length) {
          await prisma.showArtist.createMany({
            data: artists.map((artistId: string) => ({ showId: id, artistId })),
          });
        }
      }

      return prisma.show.update({ where: { id }, data: values, include: showIncludes });
    },

    async removeShow(_: unknown, { ids }: MutationRemoveShowArgs) {
      return removeEntities(prisma.show, ids);
    },
  },
};

export default resolvers;
