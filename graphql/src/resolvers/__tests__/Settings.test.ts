import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mediaUploads } from '#/database/tables';

import resolvers, { type PodcastSettingsSource } from '../Settings';
import { mediaSettingsSchema } from '../validations';

const db = vi.hoisted(() => ({ find: vi.fn() }));

vi.mock('#/database/db', () => ({ default: db }));

describe('PodcastSettings.image', () => {
  const image = { id: 'image-1', type: 'image' };

  beforeEach(() => {
    vi.resetAllMocks();
    db.find.mockResolvedValue(image);
  });

  it('answers the image that Query.podcastSettings included', async () => {
    const settings = {
      id: 'podcast',
      imageId: 'image-1',
      image,
    } as unknown as PodcastSettingsSource;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBe(image);
    expect(db.find).not.toHaveBeenCalled();
  });

  it('looks the image up when it was not included', async () => {
    const settings = { id: 'podcast', imageId: 'image-1' } as PodcastSettingsSource;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBe(image);
    expect(db.find).toHaveBeenCalledWith(mediaUploads, 'image-1');
  });

  it('answers no image when none is set', async () => {
    const settings = { id: 'podcast', imageId: null } as PodcastSettingsSource;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBeNull();
  });
});

describe('media crop dimensions', () => {
  it.each([-1, 0, 1.5, 100_000_001])('rejects a dimension of %s', (size) => {
    expect(mediaSettingsSchema.safeParse({ crops: [{ name: 'thumb', width: size }] }).success).toBe(
      false
    );
    expect(
      mediaSettingsSchema.safeParse({ crops: [{ name: 'thumb', height: size }] }).success
    ).toBe(false);
  });
});
