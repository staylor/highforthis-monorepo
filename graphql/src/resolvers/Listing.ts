import { and, gte } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import { artists, newId, showArtists, showLineup, shows, venues } from '#/database/tables';
import { getListings, matchListing, normalizeName } from '#/listings';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { fillAppleMusicLater } from './utils/appleMusicData';
import { badInput, parseInput } from './utils/helpers';
import { importListingsSchema } from './validations';

// Listings start today; the margin covers shows in other time zones
const RECENT_MS = 2 * 24 * 60 * 60 * 1000;

function recentShows(venueId: string) {
  return db.findMany(shows, {
    where: and({ venueId }, gte('date', new Date(Date.now() - RECENT_MS))),
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

      const [recent, names] = await Promise.all([
        recentShows(venueId),
        db.query(artists).select('name').all(),
      ]);
      const known = new Set(names.map(({ name }) => normalizeName(name)));

      return {
        source: result.source,
        error: null,
        listings: result.listings.map((listing) => ({
          ...listing,
          ...matchListing(listing, recent),
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
      const recent = await recentShows(venueId);
      const newArtists: string[] = [];

      const result = await db.transaction(async (tx) => {
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
          if (!listing?.startsAt || listing.cancelled) {
            throw badInput(`Listing ${sourceId} is gone, cancelled, or doesn't have a date yet.`);
          }
          if (matchListing(listing, recent).show) {
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
            date: listing.startsAt,
            url: listing.url,
            venueId,
            source: listing.source,
            sourceId,
          });
          await tx.createMany(
            showArtists,
            [...ids].map((artistId) => ({ showId, artistId }))
          );
          showsCreated += 1;
        }

        return { artistsCreated, showsCreated };
      });
      fillAppleMusicLater(newArtists);
      return result;
    },
  },
} satisfies Resolvers;

export default resolvers;
