import type { Document } from 'mongodb';
import type {
  MutationCreateVenueArgs,
  MutationRemoveVenueArgs,
  MutationUpdateVenueArgs,
  QueryVenueArgs,
  QueryVenuesArgs,
} from 'types/graphql';

import type Media from '@/models/Media';
import type Venue from '@/models/Venue';

import { parseConnection } from './utils/collection';

const resolvers = {
  Venue: {
    id(venue: Document) {
      return venue._id;
    },
    address(venue: Document) {
      return `${venue.streetAddress}\n${venue.city}, ${venue.state} ${venue.postalCode}`;
    },
    featuredMedia(venue: Document, _: unknown, { Media }: { Media: Media }) {
      return Media.findByIds(venue.featuredMedia || []);
    },
  },
  Query: {
    async venues(_: unknown, args: QueryVenuesArgs, { Venue }: { Venue: Venue }) {
      return parseConnection(Venue, args);
    },

    async venue(_: unknown, { id, slug }: QueryVenueArgs, { Venue }: { Venue: Venue }) {
      if (id) {
        return Venue.findOneById(id);
      }
      if (slug) {
        return Venue.findOneBySlug(slug);
      }
    },
  },
  Mutation: {
    async createVenue(_: unknown, { input }: MutationCreateVenueArgs, { Venue }: { Venue: Venue }) {
      const data = { ...input };
      const id = await Venue.insert(data);
      return Venue.findOneById(id);
    },

    async updateVenue(
      _: unknown,
      { id, input }: MutationUpdateVenueArgs,
      { Venue }: { Venue: Venue }
    ) {
      const data = { ...input };
      await Venue.updateById(id, data);
      return Venue.findOneById(id);
    },

    async removeVenue(_: unknown, { ids }: MutationRemoveVenueArgs, { Venue }: { Venue: Venue }) {
      return Promise.all(ids.map((id: string) => Venue.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
