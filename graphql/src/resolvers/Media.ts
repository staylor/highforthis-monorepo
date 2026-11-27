import { ilike, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import { containing } from '#/database/search';
import type { Loaded } from '#/database/tables';
import {
  audioAlbumArtists,
  audioArtists,
  audioGenres,
  audioImages,
  imageUploadCrops,
  mediaDetails,
  mediaUploads,
} from '#/database/tables';

import { parseConnection } from './utils/collection';
import { parseInput, removeRows, resolveJoin, resolveType } from './utils/helpers';
import { updateMediaUploadSchema } from './validations';

type MediaDetails = typeof mediaDetails;

/** An upload, with the relations in `mediaDetails` when its query loaded them */
export type MediaUploadSource = TableRow<typeof mediaUploads> & {
  [TName in keyof MediaDetails]?: Loaded<MediaDetails[TName]>;
};

const resolvers = {
  MediaUpload: {
    __resolveType: resolveType(
      {
        image: 'ImageUpload',
        audio: 'AudioUpload',
        video: 'VideoUpload',
      },
      'FileUpload'
    ),
  },
  ImageUpload: {
    crops(media) {
      if (media.crops) return media.crops;
      return db.findMany(imageUploadCrops, { where: { mediaId: media.id } });
    },
  },
  AudioUpload: {
    artist(media) {
      return resolveJoin(media.audioArtists, 'name', () =>
        db.findMany(audioArtists, { where: { mediaId: media.id } })
      );
    },
    albumArtist(media) {
      return resolveJoin(media.audioAlbumArtists, 'name', () =>
        db.findMany(audioAlbumArtists, { where: { mediaId: media.id } })
      );
    },
    genre(media) {
      return resolveJoin(media.audioGenres, 'name', () =>
        db.findMany(audioGenres, { where: { mediaId: media.id } })
      );
    },
    images(media) {
      if (media.audioImages) return media.audioImages;
      return db.findMany(audioImages, { where: { mediaId: media.id } });
    },
  },
  MediaUploadConnection: {
    async types() {
      const results = await db
        .query(mediaUploads)
        .select('type')
        .distinct()
        .orderBy('type', 'asc')
        .all();
      return results.map((r) => r.type);
    },
    async mimeTypes() {
      const results = await db
        .query(mediaUploads)
        .select('mimeType')
        .distinct()
        .orderBy('mimeType', 'asc')
        .all();
      return results.map((r) => r.mimeType);
    },
  },
  Query: {
    async uploads(_, args) {
      const { type, mimeType, search, ...connectionArgs } = args;
      let query = db.query(mediaUploads);
      if (type) query = query.where({ type });
      if (mimeType) query = query.where({ mimeType });
      if (search) {
        const pattern = containing(search);
        query = query.where(or(ilike('title', pattern), ilike('originalName', pattern)));
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query
              .with(mediaDetails)
              .orderBy('createdAt', 'desc')
              .orderBy('id', 'desc')
              .offset(skip)
              .limit(take)
              .all(),
        },
        connectionArgs
      );
    },
    media(_, { id }) {
      if (!id) return null;
      return db.find(mediaUploads, id, { with: mediaDetails });
    },
  },
  Mutation: {
    async updateMediaUpload(_, { id, input }) {
      const data = parseInput(updateMediaUploadSchema, input);
      return db.update(mediaUploads, id, data, { with: mediaDetails });
    },

    async removeMediaUpload(_, { ids }) {
      return removeRows(mediaUploads, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
