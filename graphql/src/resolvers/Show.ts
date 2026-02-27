import type {
  MutationCreateShowArgs,
  MutationRemoveShowArgs,
  MutationUpdateShowArgs,
  QueryShowArgs,
  QueryShowStatsArgs,
  QueryShowsArgs,
  UpdateShowInput,
} from 'types/graphql';

import type { AppContext } from '~/models';

import { parseConnection, emptyConnection } from './utils/collection';

const showIncludes = {
  artists: { include: { artist: true } },
  venue: true,
};

const resolvers = {
  Show: {
    date(show: any) {
      return new Date(show.date).getTime();
    },
    artists(show: any, _: unknown, { prisma }: AppContext) {
      if ('artists' in show && Array.isArray(show.artists)) {
        return show.artists.map((r: any) => r.artist || r);
      }
      return prisma.showArtist
        .findMany({ where: { showId: show.id }, include: { artist: true } })
        .then((records: any[]) => records.map((r) => r.artist));
    },
    venue(show: any, _: unknown, { prisma }: AppContext) {
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
    async years(_0: unknown, args: QueryShowsArgs, { prisma }: AppContext) {
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
    async shows(_: unknown, args: QueryShowsArgs, { prisma }: AppContext) {
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
        where.title = { contains: search, mode: 'insensitive' };
      }

      return parseConnection(prisma.show, connectionArgs, {
        where,
        orderBy: { date: order === 'ASC' ? 'asc' : 'desc' },
        include: showIncludes,
      });
    },

    async show(_: unknown, { id, lastAdded }: QueryShowArgs, { prisma }: AppContext) {
      if (lastAdded) {
        return prisma.show.findFirst({ orderBy: { createdAt: 'desc' }, include: showIncludes });
      }
      if (id) {
        return prisma.show.findUnique({ where: { id }, include: showIncludes });
      }
      return null;
    },

    async showStats(_: unknown, { entity }: QueryShowStatsArgs, { prisma }: AppContext) {
      const entityType = entity.toLowerCase();
      if (entityType === 'artist') {
        const results = await prisma.showArtist.groupBy({
          by: ['artistId'],
          where: { show: { attended: true } },
          _count: { artistId: true },
        });
        const artistIds = results.map((r: any) => r.artistId);
        const artists = await prisma.artist.findMany({ where: { id: { in: artistIds } } });
        const artistMap = new Map(artists.map((a: any) => [a.id, a]));
        return results
          .map((r: any) => ({
            count: r._count.artistId,
            entity: { ...artistMap.get(r.artistId), type: 'artist' },
          }))
          .sort(
            (a, b) => b.count - a.count || (a.entity.name ?? '').localeCompare(b.entity.name ?? '')
          );
      } else {
        const results = await prisma.show.groupBy({
          by: ['venueId'],
          where: { attended: true },
          _count: { venueId: true },
        });
        const venueIds = results.map((r: any) => r.venueId);
        const venues = await prisma.venue.findMany({ where: { id: { in: venueIds } } });
        const venueMap = new Map(venues.map((v: any) => [v.id, v]));
        return results
          .map((r: any) => ({
            count: r._count.venueId,
            entity: { ...venueMap.get(r.venueId), type: 'venue' },
          }))
          .sort(
            (a, b) => b.count - a.count || (a.entity.name ?? '').localeCompare(b.entity.name ?? '')
          );
      }
    },
  },
  Mutation: {
    async createShow(_: unknown, { input }: MutationCreateShowArgs, { prisma }: AppContext) {
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

    async updateShow(_: unknown, { id, input }: MutationUpdateShowArgs, { prisma }: AppContext) {
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

    async removeShow(_: unknown, { ids }: MutationRemoveShowArgs, { prisma }: AppContext) {
      try {
        await prisma.show.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
