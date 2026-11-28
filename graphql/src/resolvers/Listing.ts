import { and, gte, inList, or, type Database } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import { calendarDate } from '@highforthis/shared/time';

import db from '#/database/db';
import { artists, newId, showArtists, showLineup, shows, venues } from '#/database/tables';
import { getListings, matchListing, normalizeName } from '#/listings';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { fillAppleMusicLater } from './utils/appleMusicData';
import { badInput, parseInput } from './utils/helpers';
import { importListingsSchema } from './validations';

// Listings start today; the margin covers shows in other time zones

function matchingShows(database: Database, venueId: string, sourceIds: string[]) {
  return database.findMany(shows, {
    where: and(
      { venueId },
      or(
        gte('localDate', calendarDate(Date.now()).subtract({ days: 2 }).toString()),
        inList('sourceId', sourceIds)
      )
    ),
    with: { artists: showLineup },
  });
}

async function venueListingsUrl(venueId: string) {
  const venue = await db.find(venues, venueId);
  if (!venue) {
    throw badInput('Venue not found.');
  }
  if (!venue.listingsUrl) {
    throw badInput("This venue doesn't have a listings page.");
  }
  return venue.listingsUrl;
}

const resolvers = {
  Query: {
    async venueListings(_, { venueId }) {
      let result;
      try {
        result = await getListings(await venueListingsUrl(venueId));
      } catch (error) {
        return { source: null, error: (error as Error).message, listings: [] };
      }

      const [candidates, names] = await Promise.all([
        matchingShows(
          db,
          venueId,
          result.listings.map(({ sourceId }) => sourceId)
        ),
        db.query(artists).select('name').all(),
      ]);
      const known = new Set(names.map(({ name }) => normalizeName(name)));

      return {
        source: result.source,
        error: null,
        listings: result.listings.map((listing) => ({
          ...listing,
          ...matchListing(listing, candidates),
          newArtists: [...listing.headliners, ...listing.support].filter(
            (name) => !known.has(normalizeName(name))
          ),
        })),
      };
    },
  },
  Mutation: {
    async importListings(_, { venueId, input }) {
      const selections = new Map(
        parseInput(importListingsSchema, input).map((selection) => [selection.sourceId, selection])
      );
      const { listings } = await getListings(await venueListingsUrl(venueId));
      const byId = new Map(listings.map((listing) => [listing.sourceId, listing]));
      const newArtists: string[] = [];

      const result = await db.transaction(
        async (tx) => {
          const candidates = await matchingShows(tx, venueId, [...selections.keys()]);
          const artistIds = new Map(
            (await tx.query(artists).select('id', 'name').all()).map(({ id, name }) => [
              normalizeName(name),
              id,
            ])
          );
          let artistsCreated = 0;
          let showsCreated = 0;

          for (const { sourceId, artists: names } of selections.values()) {
            const listing = byId.get(sourceId);
            if (!listing?.localDate || listing.cancelled) {
              throw badInput(`Listing ${sourceId} is gone, cancelled, or doesn't have a date yet.`);
            }
            if (matchListing(listing, candidates).show) {
              continue;
            }

            const ids = new Set<string>();
            for (const name of names) {
              const key = normalizeName(name);
              let id = artistIds.get(key);
              if (!id) {
                id = newId();
                await tx.create(artists, {
                  id,
                  name,
                  slug: await getUniqueSlug(slugsIn(tx, artists), name),
                });
                artistIds.set(key, id);
                artistsCreated += 1;
                newArtists.push(id);
              }
              ids.add(id);
            }

            const showId = newId();
            await tx.create(shows, {
              id: showId,
              attended: false,
              localDate: listing.localDate,
              localTime: listing.localTime,
              timeZone: listing.timeZone,
              startsAt: listing.startsAt,
              url: listing.url,
              venueId,
              source: listing.source,
              sourceId,
            });
            await tx.createMany(
              showArtists,
              [...ids].map((artistId, position) => ({ showId, artistId, position }))
            );
            showsCreated += 1;
          }

          return { artistsCreated, showsCreated };
        },
        { isolationLevel: 'serializable' }
      );
      fillAppleMusicLater(newArtists);
      return result;
    },
  },
} satisfies Resolvers;

export default resolvers;
