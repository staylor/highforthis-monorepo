import { ObjectId } from 'mongodb';

import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Show: {
    id(show: any) {
      return show._id;
    },
    artists(show: any, _: any, { Artist }: AugmentedContext) {
      return Artist.findByIds(show.artists);
    },
    venue(show: any, _: any, { Venue }: AugmentedContext) {
      return Venue.findOneById(show.venue);
    },
  },
  Query: {
    async shows(_: any, args: any, { Show, Artist, Venue }: AugmentedContext) {
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

    async show(_: any, { id, slug }: any, { Show }: AugmentedContext) {
      if (id) {
        return Show.findOneById(id);
      }
      return Show.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createShow(_: any, { input }: any, { Show }: AugmentedContext) {
      const id = await Show.insert(input);
      return Show.findOneById(id);
    },

    async updateShow(_: any, { id, input }: any, { Show }: AugmentedContext) {
      const values = { ...input };
      for (const key of ['title', 'notes', 'url']) {
        if (!input[key]) {
          values[key] = null;
        }
      }
      await Show.updateById(id, values);
      return Show.findOneById(id);
    },

    async removeShow(_: any, { ids }: any, { Show }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Show.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
