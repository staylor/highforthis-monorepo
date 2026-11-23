import type { Podcast } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

import resolvers from '../Podcast';

vi.mock('#/database', () => ({ default: {} }));

describe('Podcast.date', () => {
  // The feed publishes each episode with this date
  it('is when the episode was added, whenever it was last edited', () => {
    const podcast = {
      createdAt: new Date('2019-05-01T07:01:00Z'),
      updatedAt: new Date('2026-11-22T12:00:00Z'),
    } as Podcast;

    expect(resolvers.Podcast.date(podcast)).toBe(Date.parse('2019-05-01T07:01:00Z'));
  });
});
