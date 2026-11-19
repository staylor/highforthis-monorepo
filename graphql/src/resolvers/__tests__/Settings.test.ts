import type { PodcastSettings } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Settings';

const db = vi.hoisted(() => ({ mediaUpload: { findUnique: vi.fn() } }));

vi.mock('#/database', () => ({ default: db }));

describe('PodcastSettings.image', () => {
  const image = { id: 'image-1', type: 'image' };

  beforeEach(() => {
    vi.resetAllMocks();
    db.mediaUpload.findUnique.mockResolvedValue(image);
  });

  it('answers the image that Query.podcastSettings included', async () => {
    const settings = { id: 'podcast', imageId: 'image-1', image } as unknown as PodcastSettings;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBe(image);
    expect(db.mediaUpload.findUnique).not.toHaveBeenCalled();
  });

  it('looks the image up when it was not included', async () => {
    const settings = { id: 'podcast', imageId: 'image-1' } as PodcastSettings;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBe(image);
    expect(db.mediaUpload.findUnique).toHaveBeenCalledWith({ where: { id: 'image-1' } });
  });

  it('answers no image when none is set', async () => {
    const settings = { id: 'podcast', imageId: null } as PodcastSettings;

    await expect(resolvers.PodcastSettings.image(settings)).resolves.toBeNull();
  });
});
