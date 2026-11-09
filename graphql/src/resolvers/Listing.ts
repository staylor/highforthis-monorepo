import { GraphQLError } from 'graphql';
import type { MutationImportListingsArgs, QueryVenueListingsArgs } from 'types/graphql';

import prisma from '#/database';
import { getListings, matchListing, normalizeName } from '#/listings';
import { getUniqueSlug } from '#/models/utils';

import { importListingsSchema } from './validations';

// Listings start today; the margin covers shows in other time zones
const RECENT_MS = 2 * 24 * 60 * 60 * 1000;

function recentShows(venueId: string) {
  return prisma.show.findMany({
    where: { venueId, date: { gte: new Date(Date.now() - RECENT_MS) } },
    include: { artists: { include: { artist: true } } },
  });
}

async function venueListingsUrl(venueId: string) {
  const venue = await prisma.venue.findUnique({
    where: { id: venueId },
    select: { listingsUrl: true },
  });
  if (!venue) {
    throw new GraphQLError('Venue not found.');
  }
  if (!venue.listingsUrl) {
    throw new GraphQLError("This venue doesn't have a listings page.");
  }
  return venue.listingsUrl;
}

const resolvers = {
  Query: {
    async venueListings(_: unknown, { venueId }: QueryVenueListingsArgs) {
      let result;
      try {
        result = await getListings(await venueListingsUrl(venueId));
      } catch (error) {
        return { source: null, error: (error as Error).message, listings: [] };
      }

      const [shows, artists] = await Promise.all([
        recentShows(venueId),
        prisma.artist.findMany({ select: { name: true } }),
      ]);
      const known = new Set(artists.map(({ name }) => normalizeName(name)));

      return {
        source: result.source,
        error: null,
        listings: result.listings.map((listing) => ({
          ...listing,
          ...matchListing(listing, shows),
          newArtists: [...listing.headliners, ...listing.support].filter(
            (name) => !known.has(normalizeName(name))
          ),
        })),
      };
    },
  },
  Mutation: {
    async importListings(_: unknown, { venueId, input }: MutationImportListingsArgs) {
      const selections = new Map(
        importListingsSchema.parse(input).map((selection) => [selection.sourceId, selection])
      );
      const { listings } = await getListings(await venueListingsUrl(venueId));
      const byId = new Map(listings.map((listing) => [listing.sourceId, listing]));
      const shows = await recentShows(venueId);

      return prisma.$transaction(
        async (transaction) => {
          const artistIds = new Map(
            (await transaction.artist.findMany({ select: { id: true, name: true } })).map(
              ({ id, name }) => [normalizeName(name), id]
            )
          );
          let artistsCreated = 0;
          let showsCreated = 0;

          for (const { sourceId, artists } of selections.values()) {
            const listing = byId.get(sourceId);
            if (!listing?.startsAt || listing.cancelled) {
              throw new GraphQLError(
                `Listing ${sourceId} is gone, cancelled, or doesn't have a date yet.`
              );
            }
            if (matchListing(listing, shows).show) {
              continue;
            }

            const ids = new Set<string>();
            for (const name of artists) {
              const key = normalizeName(name);
              let id = artistIds.get(key);
              if (!id) {
                ({ id } = await transaction.artist.create({
                  data: { name, slug: await getUniqueSlug(transaction.artist, name) },
                }));
                artistIds.set(key, id);
                artistsCreated += 1;
              }
              ids.add(id);
            }

            await transaction.show.create({
              data: {
                attended: false,
                date: listing.startsAt,
                url: listing.url,
                venueId,
                source: listing.source,
                sourceId,
                artists: { create: [...ids].map((artistId) => ({ artistId })) },
              },
            });
            showsCreated += 1;
          }

          return { artistsCreated, showsCreated };
        },
        { timeout: 30_000 }
      );
    },
  },
};

export default resolvers;
