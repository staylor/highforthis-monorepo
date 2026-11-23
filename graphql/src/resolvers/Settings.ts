import type { TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import type { Loaded } from '#/database/tables';
import {
  mediaCropSettings,
  mediaSettings,
  mediaUploads,
  newId,
  podcastSettings,
  podcastSettingsImage,
  siteSettings,
} from '#/database/tables';

import { parseInput } from './utils/helpers';
import { siteSettingsSchema, mediaSettingsSchema, podcastSettingsSchema } from './validations';

type PodcastSettings = TableRow<typeof podcastSettings>;

/** The media settings, whose crops their resolver loads */
export type MediaSettingsSource = TableRow<typeof mediaSettings>;

/**
 * The podcast's settings, with their image when the query loaded it, or only the ID of settings
 * that were never saved
 */
export type PodcastSettingsSource = Pick<PodcastSettings, 'id'> &
  Partial<PodcastSettings & { image: Loaded<typeof podcastSettingsImage> }>;

const resolvers = {
  MediaSettings: {
    async crops(settings) {
      return db.findMany(mediaCropSettings, { where: { mediaSettingsId: settings.id } });
    },
  },
  PodcastSettings: {
    async image(settings) {
      // Query.podcastSettings loads it
      if (settings.image !== undefined) return settings.image;
      if (!settings.imageId) return null;
      return db.find(mediaUploads, settings.imageId);
    },
  },
  Query: {
    async siteSettings() {
      const settings = await db.find(siteSettings, 'site');
      return settings || { id: 'site' };
    },
    async mediaSettings() {
      const settings = await db.find(mediaSettings, 'media');
      return settings || { id: 'media' };
    },
    async podcastSettings() {
      const settings = await db.find(podcastSettings, 'podcast', {
        with: { image: podcastSettingsImage },
      });
      return settings || { id: 'podcast' };
    },
  },
  // Each saves its settings whether or not they were saved before. An upsert with nothing to
  // update changes nothing and answers no row, so the row is read after.
  Mutation: {
    async updateSiteSettings(_, { id, input }) {
      const data = parseInput(siteSettingsSchema, input);
      await db
        .query(siteSettings)
        .upsert({ ...data, id }, { conflictTarget: ['id'], update: data });
      return (await db.find(siteSettings, id))!;
    },
    async updateMediaSettings(_, { id, input }) {
      const { crops } = parseInput(mediaSettingsSchema, input);
      await db.query(mediaSettings).upsert({ id }, { conflictTarget: ['id'], update: {} });
      if (typeof crops !== 'undefined') {
        await db.deleteMany(mediaCropSettings, { where: { mediaSettingsId: id } });
        if (crops?.length) {
          await db.createMany(
            mediaCropSettings,
            crops.map((crop) => ({ ...crop, id: newId(), mediaSettingsId: id }))
          );
        }
      }
      return (await db.find(mediaSettings, id))!;
    },
    async updatePodcastSettings(_, { id, input }) {
      const { image, ...data } = parseInput(podcastSettingsSchema, input);
      const values = { ...data, imageId: image };
      await db
        .query(podcastSettings)
        .upsert({ ...values, id }, { conflictTarget: ['id'], update: values });
      return (await db.find(podcastSettings, id))!;
    },
  },
} satisfies Resolvers;

export default resolvers;
