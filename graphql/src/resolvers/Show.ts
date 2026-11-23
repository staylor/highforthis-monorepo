import {
  and,
  eq,
  gte,
  ilike,
  inList,
  lt,
  or,
  sql,
  type Predicate,
  type SqlStatement,
  type TableColumnName,
  type TableRow,
} from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import { containing, matching } from '#/database/search';
import type { Loaded } from '#/database/tables';
import {
  artists,
  lineupArtist,
  newId,
  showArtists,
  showLineup,
  shows,
  showVenue,
  venues,
} from '#/database/tables';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { fillAppleMusicLater } from './utils/appleMusicData';
import { type Connection, parseConnection, emptyConnection } from './utils/collection';
import { parseInput, removeRows, resolveJoin, timestampResolver } from './utils/helpers';
import { bulkCreateShowsSchema, createShowSchema, updateShowSchema } from './validations';

type Show = TableRow<typeof shows>;
type ShowFilter = Predicate<TableColumnName<typeof shows>>;
type Artist = TableRow<typeof artists>;
type Venue = TableRow<typeof venues>;

const showIncludes = { artists: showLineup, venue: showVenue };

/** A show, with its artists and venue when its query loaded them */
export type ShowSource = Show & {
  artists?: Loaded<typeof showLineup>;
  venue?: Loaded<typeof showVenue>;
};

/** What `shows` answers with: a page of shows, and the filter `years` lists the years of. */
export interface ShowConnectionSource extends Connection<ShowSource> {
  // What the shows were filtered by, apart from their dates, or null when none can match
  filter?: ShowFilter | null;
}

/** An artist or a venue in the show stats, and which of the two it is */
export type ShowEntitySource = (Artist & { type: 'artist' }) | (Venue & { type: 'venue' });

/**
 * Adds each show's venue and artists, as loading `showIncludes` would. That finds the artists with
 * an IN list of every show's ID on ShowArtist.showId, and Postgres plans one by checking each ID
 * against the column's most common values: for the ~550 shows on the history page, planning took
 * 3.5 ms of a 5 ms query. Going through Show's IDs, which have no common values, plans in about
 * 0.4 ms. The rows come in lineup order, which grouping them by show keeps.
 */
async function includeVenuesAndArtists(page: ShowSource[]) {
  if (page.length === 0) return;
  const showIds = page.map((show) => show.id);
  const [venueRows, { rows = [] }] = await Promise.all([
    db.findMany(venues, { where: inList('id', [...new Set(page.map((show) => show.venueId))]) }),
    db.exec(sql`
      select "showId", "artistId" from "ShowArtist"
      where "showId" in (select id from "Show" where id in ${showIds})
      order by "position"
    `),
  ]);
  const lineups = rows as { showId: string; artistId: string }[];
  const artistRows = lineups.length
    ? await db.findMany(artists, {
        where: inList('id', [...new Set(lineups.map((row) => row.artistId))]),
      })
    : [];

  const venuesById = new Map(venueRows.map((venue) => [venue.id, venue]));
  const artistsById = new Map(artistRows.map((artist) => [artist.id, artist]));
  const lineupsByShow = Map.groupBy(
    lineups.map((row) => ({ ...row, artist: artistsById.get(row.artistId) ?? null })),
    (row) => row.showId
  );
  for (const show of page) {
    Object.assign(show, {
      venue: venuesById.get(show.venueId) ?? null,
      artists: lineupsByShow.get(show.id) ?? [],
    });
  }
}

/** The shows an artist is in */
async function showsOf(artistId: string) {
  const lineups = await db.findMany(showArtists, { where: { artistId } });
  return inList(
    'id',
    lineups.map((row) => row.showId)
  );
}

/** How many attended shows each artist or venue has, as the IDs and counts a query selects */
async function countAttended(statement: SqlStatement) {
  const { rows = [] } = await db.exec(statement);
  return rows as { id: string; count: number }[];
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
        db.findMany(showArtists, {
          where: { showId: show.id },
          orderBy: ['position', 'asc'],
          with: { artist: lineupArtist },
        })
      );
    },
    async venue(show) {
      if (show.venue) {
        return show.venue;
      }
      // Every show has a venue
      const venue = await db.find(venues, show.venueId);
      if (!venue) {
        throw new Error(`Show ${show.id} has no venue`);
      }
      return venue;
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
    async years({ filter }) {
      if (filter === null) return [];
      const query = db.query(shows);
      const results = await (filter ? query.where(filter) : query).select('date').all();
      const yearSet = new Set(results.map((r) => new Date(r.date).getFullYear()));
      return Array.from(yearSet).sort((a, b) => b - a);
    },
  },
  Query: {
    async shows(_, args) {
      const { artist, venue, latest, attended, year, search, order, ...connectionArgs } = args;
      // Everything but the dates, which `years` leaves out
      const conditions: ShowFilter[] = [];
      let dates: ShowFilter | undefined;

      if (attended) {
        conditions.push(eq('attended', true));
      } else if (latest) {
        dates = gte('date', new Date());
      }

      if (year) {
        const startDate = new Date(`${year}-01-01T00:00:00Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00Z`);
        dates = and(gte('date', startDate), lt('date', endDate));
      }

      if (artist?.id) {
        conditions.push(await showsOf(artist.id));
      } else if (artist?.slug) {
        const node = await db.findOne(artists, { where: { slug: artist.slug } });
        if (node) {
          conditions.push(await showsOf(node.id));
        } else {
          return { ...emptyConnection(), filter: null };
        }
      }

      if (venue?.id) {
        conditions.push(eq('venueId', venue.id));
      } else if (venue?.slug) {
        const node = await db.findOne(venues, { where: { slug: venue.slug } });
        if (node) {
          conditions.push(eq('venueId', node.id));
        } else {
          return { ...emptyConnection(), filter: null };
        }
      }

      if (search) {
        // A show's title, its venue's name, or one of its artists' names
        const pattern = containing(search);
        const [venueMatches, artistMatches] = await Promise.all([
          db.query(venues).where(ilike('name', pattern)).select('id').all(),
          db
            .query(showArtists)
            .join(artists, eq(artists.id, showArtists.artistId))
            .where(ilike(artists.name, pattern))
            .select({ showId: showArtists.showId })
            .all(),
        ]);
        conditions.push(
          or(
            ilike('title', pattern),
            inList(
              'venueId',
              venueMatches.map((match) => match.id)
            ),
            inList(
              'id',
              artistMatches.map((match) => match.showId)
            )
          )
        );
      }

      const filter = and(...conditions);
      const query = db.query(shows).where(dates ? and(filter, dates) : filter);
      const direction = order === 'ASC' || (!order && latest) ? 'asc' : 'desc';
      const connection = await parseConnection<ShowSource>(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query.orderBy('date', direction).offset(skip).limit(take).all(),
        },
        connectionArgs
      );
      await includeVenuesAndArtists(connection.edges.map(({ node }) => node));
      return { ...connection, filter };
    },

    async show(_, { id, lastAdded }) {
      if (lastAdded) {
        return db.query(shows).with(showIncludes).orderBy('createdAt', 'desc').first();
      }
      if (id) {
        return db.find(shows, id, { with: showIncludes });
      }
      return null;
    },

    async showStats(_, { entity }) {
      if (entity.toLowerCase() === 'artist') {
        const counts = await countAttended(sql`
          select "artistId" as id, count(*)::int as count from "ShowArtist"
          where "showId" in (select id from "Show" where attended)
          group by "artistId"
        `);
        return getEntityStats(
          counts,
          (ids) => db.findMany(artists, { where: inList('id', ids) }),
          'artist'
        );
      }

      const counts = await countAttended(sql`
        select "venueId" as id, count(*)::int as count from "Show"
        where attended
        group by "venueId"
      `);
      return getEntityStats(
        counts,
        (ids) => db.findMany(venues, { where: inList('id', ids) }),
        'venue'
      );
    },
  },
  Mutation: {
    async bulkCreateShows(_, { input }) {
      const entries = parseInput(bulkCreateShowsSchema, input);
      const newArtists: string[] = [];

      const result = await db.transaction(async (tx) => {
        const artistIds = new Map<string, string>();
        const venueIds = new Map<string, string>();
        let artistsCreated = 0;
        let venuesCreated = 0;

        const findOrCreateArtist = async (name: string) => {
          const key = name.toLocaleLowerCase();
          const cached = artistIds.get(key);
          if (cached) return cached;

          let id = (await tx.findOne(artists, { where: ilike('name', matching(name)) }))?.id;
          if (!id) {
            id = newId();
            await tx.create(artists, {
              id,
              name,
              slug: await getUniqueSlug(slugsIn(tx, artists), name),
            });
            artistsCreated += 1;
            newArtists.push(id);
          }
          artistIds.set(key, id);
          return id;
        };

        const findOrCreateVenue = async (name: string) => {
          const key = name.toLocaleLowerCase();
          const cached = venueIds.get(key);
          if (cached) return cached;

          let id = (await tx.findOne(venues, { where: ilike('name', matching(name)) }))?.id;
          if (!id) {
            id = newId();
            await tx.create(venues, {
              id,
              name,
              slug: await getUniqueSlug(slugsIn(tx, venues), name),
            });
            venuesCreated += 1;
          }
          venueIds.set(key, id);
          return id;
        };

        for (const show of entries) {
          const venueId = await findOrCreateVenue(show.venue);
          const ids: string[] = [];
          for (const artistName of show.artists) {
            ids.push(await findOrCreateArtist(artistName));
          }
          const uniqueArtistIds = [...new Set(ids)];

          const showId = newId();
          await tx.create(shows, {
            id: showId,
            attended: show.attended ?? false,
            date: new Date(show.date),
            venueId,
          });
          await tx.createMany(
            showArtists,
            uniqueArtistIds.map((artistId, position) => ({ showId, artistId, position }))
          );
        }

        return {
          artistsCreated,
          showsCreated: entries.length,
          venuesCreated,
        };
      });
      fillAppleMusicLater(newArtists);
      return result;
    },

    async createShow(_, { input }) {
      const { artists: artistIds, venue, date, ...data } = parseInput(createShowSchema, input);
      const id = newId();
      await db.transaction(async (tx) => {
        await tx.create(shows, { ...data, id, date: new Date(date), venueId: venue });
        if (artistIds.length) {
          await tx.createMany(
            showArtists,
            artistIds.map((artistId, position) => ({ showId: id, artistId, position }))
          );
        }
      });
      return db.find(shows, id, { with: showIncludes });
    },

    async updateShow(_, { id, input }) {
      const validated = parseInput(updateShowSchema, input);
      const { artists: artistIds, venue, date, ...data } = validated;
      const values: Partial<Show> = { ...data };

      if (date) values.date = new Date(date);
      if (venue) values.venueId = venue;

      if (typeof artistIds !== 'undefined') {
        await db.deleteMany(showArtists, { where: { showId: id } });
        if (artistIds?.length) {
          await db.createMany(
            showArtists,
            artistIds.map((artistId, position) => ({ showId: id, artistId, position }))
          );
        }
      }

      return db.update(shows, id, values, { with: showIncludes });
    },

    async removeShow(_, { ids }) {
      return removeRows(shows, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
