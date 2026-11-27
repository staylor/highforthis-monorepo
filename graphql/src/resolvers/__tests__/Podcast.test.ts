import { describe, expect, it, vi } from 'vitest';

import { podcastMedia, podcasts } from '#/database/tables';

import resolvers, { type PodcastSource } from '../Podcast';

const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock('#/database/db', () => ({ default: { update } }));

describe('updatePodcast', () => {
  it('clears media sent as null and preserves media left out', async () => {
    await resolvers.Mutation.updatePodcast(
      {},
      { id: 'episode', input: { title: 'Encore', audio: null } }
    );
    expect(update).toHaveBeenLastCalledWith(
      podcasts,
      'episode',
      { title: 'Encore', audioId: null, imageId: undefined },
      { with: podcastMedia }
    );

    await resolvers.Mutation.updatePodcast(
      {},
      { id: 'episode', input: { title: 'Encore', image: null } }
    );
    expect(update).toHaveBeenLastCalledWith(
      podcasts,
      'episode',
      { title: 'Encore', imageId: null, audioId: undefined },
      { with: podcastMedia }
    );
  });
});

describe('Podcast.date', () => {
  // The feed publishes each episode with this date
  it('is when the episode was added, whenever it was last edited', () => {
    const podcast = {
      createdAt: new Date('2019-05-01T07:01:00Z'),
      updatedAt: new Date('2026-11-22T12:00:00Z'),
    } as PodcastSource;

    expect(resolvers.Podcast.date(podcast)).toBe(Date.parse('2019-05-01T07:01:00Z'));
  });
});
