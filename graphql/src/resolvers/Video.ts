import { ilike, ne, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import { newId, videos, videoThumbnailRows, videoThumbnails } from '#/database/tables';
import { getUniqueSlug, slugsIn } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { badInput, parseInput, removeRows, timestampResolver } from './utils/helpers';
import { createVideoSchema, updateVideoSchema } from './validations';

const videoIncludes = { thumbnails: videoThumbnailRows };

/** A video, with its thumbnails when its query loaded them */
export type VideoSource = TableRow<typeof videos> & {
  thumbnails?: Loaded<typeof videoThumbnailRows>;
};

function publication(publishedAt?: number, publishedISO?: string | null) {
  if (publishedISO) {
    const millis = Date.parse(publishedISO);
    if (publishedAt !== undefined && publishedAt !== millis) {
      throw badInput('publishedAt and publishedISO must identify the same instant');
    }
    return { publishedAt: new Date(millis), publishedISO };
  }
  if (publishedAt === undefined) return {};
  const instant = new Date(publishedAt);
  return { publishedAt: instant, publishedISO: instant.toISOString() };
}

const resolvers = {
  Video: {
    publishedAt: timestampResolver('publishedAt'),
    createdAt: timestampResolver('createdAt'),
    updatedAt: timestampResolver('updatedAt'),
    thumbnails(video) {
      if (video.thumbnails) return video.thumbnails;
      return db.findMany(videoThumbnails, { where: { videoId: video.id } });
    },
  },
  VideoConnection: {
    async years() {
      const results = await db
        .query(videos)
        .where(ne('year', 0))
        .select('year')
        .distinct()
        .orderBy('year', 'desc')
        .all();
      return results.map((r) => r.year);
    },
  },
  Query: {
    async videos(_, args) {
      const { year, search, ...connectionArgs } = args;
      let query = db.query(videos);
      if (year) query = query.where({ year });
      if (search) {
        const pattern = containing(search);
        query = query.where(or(ilike('title', pattern), ilike('slug', pattern)));
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query
              .with(videoIncludes)
              .orderBy('year', 'desc')
              .orderBy('position', 'desc')
              .orderBy('id', 'desc')
              .offset(skip)
              .limit(take)
              .all(),
        },
        connectionArgs
      );
    },

    video(_, { id, slug }) {
      if (id) {
        return db.find(videos, id, { with: videoIncludes });
      }
      if (slug) {
        return db.findOne(videos, { where: { slug }, with: videoIncludes });
      }
      return null;
    },
  },
  Mutation: {
    async createVideo(_, { input }) {
      const { publishedAt, publishedISO, ...rest } = parseInput(createVideoSchema, input);
      const slug = await getUniqueSlug(slugsIn(db, videos), rest.title);
      const id = newId();
      await db.create(videos, { ...rest, id, slug, ...publication(publishedAt, publishedISO) });
      return db.find(videos, id, { with: videoIncludes });
    },

    async updateVideo(_, { id, input }) {
      const { publishedAt, publishedISO, ...rest } = parseInput(updateVideoSchema, input);
      return db.update(
        videos,
        id,
        {
          ...rest,
          ...publication(publishedAt, publishedISO),
        },
        { with: videoIncludes }
      );
    },

    async removeVideo(_, { ids }) {
      return removeRows(videos, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
