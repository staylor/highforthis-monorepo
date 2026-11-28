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
    expect(update.mock.calls[0][2]).toEqual({
      publishedAt: new Date(publishedAt),
      publishedISO: new Date(publishedAt).toISOString(),
    });
  });
  it('updates both representations from an offset-bearing ISO date and rejects conflicting evidence', async () => {
    const publishedISO = '2026-11-01T01:30:00-05:00';
    await updateVideo({ publishedISO });
    expect(update.mock.calls[0][2]).toEqual({ publishedISO, publishedAt: new Date(publishedISO) });
    await expect(updateVideo({ publishedAt: 0, publishedISO })).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(updateVideo({ publishedISO: '2026-11-01T01:30:00' })).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(
      updateVideo({ publishedISO: '2026-11-01T06:30:00.000001Z' })
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect(update).toHaveBeenCalledTimes(1);
  });
});
