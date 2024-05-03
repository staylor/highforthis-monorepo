import { ObjectId } from 'mongodb';

import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Show: {
    id(show: any) {
      return show._id;
    },
    artist(show: any, args: any, { Artist }: AugmentedContext) {
      return Artist.findOneById(show.artist);
    },
    venue(show: any, args: any, { Venue }: AugmentedContext) {
      return Venue.findOneById(show.venue);
    },
  },
  Query: {
    async shows(root: any, args: any, { Show, Artist, Venue }: AugmentedContext) {
      const { artistId, artistSlug, venueId, venueSlug, ...rest } = args;
      const connectionArgs = rest;

      if (artistId) {
        connectionArgs.artist = new ObjectId(String(artistId));
      } else if (venueId) {
        connectionArgs.venue = new ObjectId(String(venueId));
      } else if (artistSlug) {
        const artist = await Artist.findOneBySlug(artistSlug);
        if (artist) {
          connectionArgs.artist = artist._id;
        }
      } else if (venueSlug) {
        const venue = await Venue.findOneBySlug(venueSlug);
        if (venue) {
          connectionArgs.venue = venue._id;
        }
      }
      return parseConnection(Show, connectionArgs);
    },

    async show(root: any, { id, slug }: any, { Show }: AugmentedContext) {
      if (id) {
        return Show.findOneById(id);
      }
      return Show.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createShow(root: any, { input }: any, { Show }: AugmentedContext) {
      const id = await Show.insert(input);
      return Show.findOneById(id);
    },

    async updateShow(root: any, { id, input }: any, { Show }: AugmentedContext) {
      await Show.updateById(id, input);
      return Show.findOneById(id);
    },

    async removeShow(root: any, { ids }: any, { Show }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Show.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
