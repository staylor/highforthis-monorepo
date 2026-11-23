import { ilike, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import { mediaUploads, newId, podcastMedia, podcasts } from '#/database/tables';

import { parseConnection } from './utils/collection';
import { parseInput, removeRows, timestampResolver } from './utils/helpers';
import { createPodcastSchema, updatePodcastSchema } from './validations';

type PodcastMedia = typeof podcastMedia;

/** A podcast, with its audio and image when its query loaded them */
export type PodcastSource = TableRow<typeof podcasts> & {
  [TName in keyof PodcastMedia]?: Loaded<PodcastMedia[TName]>;
};

const resolvers = {
  Podcast: {
    audio(podcast) {
      if (podcast.audio !== undefined) return podcast.audio;
      if (!podcast.audioId) return null;
      return db.find(mediaUploads, podcast.audioId);
    },
    image(podcast) {
      if (podcast.image !== undefined) return podcast.image;
      if (!podcast.imageId) return null;
      return db.find(mediaUploads, podcast.imageId);
    },
    // When the episode was added. Editing one doesn't publish it again.
    date: timestampResolver('createdAt'),
  },
  Query: {
    async podcasts(_, args) {
      const { search, order, ...connectionArgs } = args;
      let query = db.query(podcasts);
      if (search) {
        const pattern = containing(search);
        query = query.where(or(ilike('title', pattern), ilike('description', pattern)));
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query
              .with(podcastMedia)
              .orderBy('createdAt', order === 'ASC' ? 'asc' : 'desc')
              .offset(skip)
              .limit(take)
              .all(),
        },
        connectionArgs
      );
    },

    async podcast(_, { id }) {
      if (!id) return null;
      return db.find(podcasts, id, { with: podcastMedia });
    },
  },
  Mutation: {
    async createPodcast(_, { input }) {
      const { audio, image, ...data } = parseInput(createPodcastSchema, input);
      const id = newId();
      await db.create(podcasts, {
        ...data,
        id,
        audioId: audio ?? undefined,
        imageId: image ?? undefined,
      });
      return db.find(podcasts, id, { with: podcastMedia });
    },

    async updatePodcast(_, { id, input }) {
      const { audio, image, ...data } = parseInput(updatePodcastSchema, input);
      return db.update(
        podcasts,
        id,
        { ...data, audioId: audio ?? undefined, imageId: image ?? undefined },
        { with: podcastMedia }
      );
    },

    async removePodcast(_, { ids }) {
      return removeRows(podcasts, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
