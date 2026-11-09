import { describe, expect, it, vi } from 'vitest';

import resolvers from '../Show';

const { update } = vi.hoisted(() => ({
  update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 'show-1', ...data })),
}));

vi.mock('#/database', () => ({ default: { show: { update } } }));

describe('updateShow', () => {
  it('keeps the title, notes and URL when only Attended changes', async () => {
    await resolvers.Mutation.updateShow({}, { id: 'show-1', input: { attended: true } });

    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: 'show-1' }, data: { attended: true } })
    );
  });

  it('clears the fields the edit form sends as null', async () => {
    await resolvers.Mutation.updateShow(
      {},
      { id: 'show-1', input: { attended: false, notes: null, title: null, url: null } }
    );

    expect(update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { attended: false, notes: null, title: null, url: null } })
    );
  });
});
