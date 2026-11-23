import { beforeEach, describe, expect, it, vi } from 'vitest';

import resolvers from '../Video';

const { update } = vi.hoisted(() => ({ update: vi.fn() }));

vi.mock('#/database/db', () => ({ default: { update } }));

const updateVideo = (input: Record<string, unknown>) =>
  resolvers.Mutation.updateVideo({}, { id: 'video-1', input });

describe('updateVideo', () => {
  beforeEach(() => {
    update.mockReset();
  });

  it("keeps the publish date when the input leaves it out, as the admin's form does", async () => {
    await updateVideo({ title: 'Live at the Ryman', slug: 'live-at-the-ryman' });
    const [, id, values] = update.mock.calls[0];
    expect(id).toBe('video-1');
    expect(values).toEqual({ title: 'Live at the Ryman', slug: 'live-at-the-ryman' });
  });

  it('saves a publish date that the input has', async () => {
    const publishedAt = Date.UTC(2024, 4, 10);
    await updateVideo({ publishedAt });
    expect(update.mock.calls[0][2]).toEqual({ publishedAt: new Date(publishedAt) });
  });
});
