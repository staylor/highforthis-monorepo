import type { Prisma, Artist, Venue, Show } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import prisma from '#/database';
import type { WithIncludes } from '#/models';
import { getUniqueSlug } from '#/models/utils';

import { type Connection, parseConnection, emptyConnection } from './utils/collection';
import { removeEntities, resolveJoin, timestampResolver } from './utils/helpers';
import { bulkCreateShowsSchema, createShowSchema, updateShowSchema } from './validations';

const showIncludes = {
  artists: { include: { artist: true } },
  venue: true,
} satisfies Prisma.ShowInclude;

/** A show, with its artists and venue when its query included them */
export type ShowSource = WithIncludes<
  Show,
  Prisma.ShowGetPayload<{ include: typeof showIncludes }>
>;

/** What `shows` answers with: a page of shows, and the filter `years` lists the years of. */
export interface ShowConnectionSource extends Connection<ShowSource> {
  // What the shows were filtered by, apart from their dates, or null when none can match
  filter?: Prisma.ShowWhereInput | null;
}

/** An artist or a venue in the show stats, and which of the two it is */
export type ShowEntitySource = (Artist & { type: 'artist' }) | (Venue & { type: 'venue' });

/**
 * Adds each show's venue and artists, as `include: showIncludes` would. That include finds the
 * artists with an IN list of every show's ID on ShowArtist.showId, and Postgres plans one by
 * checking each ID against the column's most common values: for the ~550 shows on the history
 * page, planning took 3.5 ms of a 5 ms query. Going through Show's IDs, which have no common
 * values, plans in about 0.4 ms.
 */
async function includeVenuesAndArtists(shows: Show[]) {
  if (shows.length === 0) return;
  const [venues, showArtists] = await Promise.all([
    prisma.venue.findMany({
      where: { id: { in: [...new Set(shows.map((show) => show.venueId))] } },
    }),
    prisma.showArtist.findMany({
      where: { show: { id: { in: shows.map((show) => show.id) } } },
      include: { artist: true },
    }),
  ]);

  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const showArtistsByShow = Map.groupBy(showArtists, (showArtist) => showArtist.showId);
  for (const show of shows) {
    Object.assign(show, {
      venue: venuesById.get(show.venueId) ?? null,
      artists: showArtistsByShow.get(show.id) ?? [],
    });
  }
}

async function getEntityStats<
  TEntity extends Artist | Venue,
  TType extends ShowEntitySource['type'],
>(
  counts: { id: string; count: number }[],
  lookup: (ids: string[]) => Promise<TEntity[]>,
  type: TType
) {
  const ids = counts.map((c) => c.id);
  const entities = await lookup(ids);
  const entityMap = new Map(entities.map((e) => [e.id, e]));
  return counts
    .flatMap(({ id, count }) => {
      const entity = entityMap.get(id);
      // An artist or venue deleted since the count has nothing to show
      return entity ? [{ count, entity: { ...entity, type } }] : [];
    })
    .sort((a, b) => b.count - a.count || a.entity.name.localeCompare(b.entity.name));
}

const resolvers = {
  Show: {
    date: timestampResolver('date'),
    artists(show) {
      return resolveJoin(show.artists, 'artist', () =>
        prisma.showArtist.findMany({
          where: { showId: show.id },
          include: { artist: true },
        })
      );
    },
    venue(show) {
      if (show.venue) {
        return show.venue;
      }
      // Every show has a venue
      return prisma.venue.findUniqueOrThrow({ where: { id: show.venueId } });
    },
  },
  ShowEntity: {
    __resolveType(entity) {
      return entity.type === 'artist' ? 'Artist' : 'Venue';
    },
  },
  ShowConnection: {
    // A field's resolver only gets its own arguments, so the years come from the filter `shows`
    // put on the connection
    async years({ filter = {} }) {
      if (filter === null) return [];
      const results = await prisma.show.findMany({
        where: filter,
        select: { date: true },
      });
      const yearSet = new Set(results.map((r) => new Date(r.date).getFullYear()));
      return Array.from(yearSet).sort((a, b) => b - a);
    },
  },
  Query: {
    async shows(_, args) {
      const { artist, venue, latest, attended, year, search, order, ...connectionArgs } = args;
      // Everything but the dates, which `years` leaves out
      const filter: Prisma.ShowWhereInput = {};
      let date: Prisma.ShowWhereInput['date'];

      if (attended) {
        filter.attended = true;
      } else if (latest) {
        date = { gte: new Date() };
      }

      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);
        date = { gte: startDate, lt: endDate };
      }

      if (artist?.id) {
        filter.artists = { some: { artistId: artist.id } };
      } else if (artist?.slug) {
        const node = await prisma.artist.findUnique({ where: { slug: artist.slug } });
        if (node) {
          filter.artists = { some: { artistId: node.id } };
        } else {
          return { ...emptyConnection(), filter: null };
        }
      }

      if (venue?.id) {
        filter.venueId = venue.id;
      } else if (venue?.slug) {
        const node = await prisma.venue.findUnique({ where: { slug: venue.slug } });
        if (node) {
          filter.venueId = node.id;
        } else {
          return { ...emptyConnection(), filter: null };
        }
      }

      if (search) {
        filter.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { venue: { name: { contains: search, mode: 'insensitive' } } },
          { artists: { some: { artist: { name: { contains: search, mode: 'insensitive' } } } } },
        ];
      }

      const connection = await parseConnection(prisma.show, connectionArgs, {
        where: date ? { ...filter, date } : filter,
        orderBy: { date: order === 'ASC' || (!order && latest) ? 'asc' : 'desc' },
      });
      await includeVenuesAndArtists(connection.edges.map(({ node }) => node));
      return { ...connection, filter };
    },

    async show(_, { id, lastAdded }) {
      if (lastAdded) {
        return prisma.show.findFirst({ orderBy: { createdAt: 'desc' }, include: showIncludes });
      }
      if (id) {
        return prisma.show.findUnique({ where: { id }, include: showIncludes });
      }
      return null;
    },

    async showStats(_, { entity }) {
      if (entity.toLowerCase() === 'artist') {
        const results = await prisma.showArtist.groupBy({
          by: ['artistId'],
          where: { show: { attended: true } },
          _count: { artistId: true },
        });
        return getEntityStats(
          results.map((r) => ({ id: r.artistId, count: r._count.artistId })),
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
        results.map((r) => ({ id: r.venueId, count: r._count.venueId })),
        (ids) => prisma.venue.findMany({ where: { id: { in: ids } } }),
        'venue'
      );
    },
  },
  Mutation: {
    async bulkCreateShows(_, { input }) {
      const shows = bulkCreateShowsSchema.parse(input);

      return prisma.$transaction(
        async (transaction) => {
          const artists = new Map<string, string>();
          const venues = new Map<string, string>();
          let artistsCreated = 0;
          let venuesCreated = 0;

          const findOrCreateArtist = async (name: string) => {
            const key = name.toLocaleLowerCase();
            const cached = artists.get(key);
            if (cached) return cached;

            let artist = await transaction.artist.findFirst({
              where: { name: { equals: name, mode: 'insensitive' } },
            });
            if (!artist) {
              artist = await transaction.artist.create({
                data: {
                  name,
                  slug: await getUniqueSlug(transaction.artist, name),
                },
              });
              artistsCreated += 1;
            }
            artists.set(key, artist.id);
            return artist.id;
          };

          const findOrCreateVenue = async (name: string) => {
            const key = name.toLocaleLowerCase();
            const cached = venues.get(key);
            if (cached) return cached;

            let venue = await transaction.venue.findFirst({
              where: { name: { equals: name, mode: 'insensitive' } },
            });
            if (!venue) {
              venue = await transaction.venue.create({
                data: {
                  name,
                  slug: await getUniqueSlug(transaction.venue, name),
                },
              });
              venuesCreated += 1;
            }
            venues.set(key, venue.id);
            return venue.id;
          };

          for (const show of shows) {
            const venueId = await findOrCreateVenue(show.venue);
            const artistIds: string[] = [];
            for (const artistName of show.artists) {
              artistIds.push(await findOrCreateArtist(artistName));
            }
            const uniqueArtistIds = [...new Set(artistIds)];

            await transaction.show.create({
              data: {
                attended: show.attended ?? false,
                date: new Date(show.date),
                venueId,
                artists: {
                  create: uniqueArtistIds.map((artistId) => ({ artistId })),
                },
              },
            });
          }

          return {
            artistsCreated,
            showsCreated: shows.length,
            venuesCreated,
          };
        },
        { timeout: 30_000 }
      );
    },

    async createShow(_, { input }) {
      const { artists, venue, date, ...data } = createShowSchema.parse(input);
      return prisma.show.create({
        data: {
          ...data,
          date: new Date(date),
          venueId: venue,
          artists: artists?.length
            ? { create: artists.map((artistId) => ({ artistId })) }
            : undefined,
        },
        include: showIncludes,
      });
    },

    async updateShow(_, { id, input }) {
      const validated = updateShowSchema.parse(input);
      const { artists, venue, date, ...data } = validated;
      const values: Prisma.ShowUncheckedUpdateInput = { ...data };

      if (date) values.date = new Date(date);
      if (venue) values.venueId = venue;

      if (typeof artists !== 'undefined') {
        await prisma.showArtist.deleteMany({ where: { showId: id } });
        if (artists?.length) {
          await prisma.showArtist.createMany({
            data: artists.map((artistId) => ({ showId: id, artistId })),
          });
        }
      }

      return prisma.show.update({ where: { id }, data: values, include: showIncludes });
    },

    async removeShow(_, { ids }) {
      return removeEntities(prisma.show, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
