import { isDeleteIntent } from '#/utils/route.server';

const post = (fields: Record<string, string>) =>
  new Request('http://localhost/admin/show', { method: 'POST', body: new URLSearchParams(fields) });

describe('isDeleteIntent', () => {
  it('is true for a POST with intent=delete', async () => {
    expect(await isDeleteIntent(post({ intent: 'delete', ids: '1' }))).toBe(true);
  });

  it('is false for other POSTs and for other methods', async () => {
    expect(await isDeleteIntent(post({ id: '1', attended: 'on' }))).toBe(false);
    expect(await isDeleteIntent(new Request('http://localhost/admin/show'))).toBe(false);
  });

  it('leaves the body readable for the action', async () => {
    const request = post({ id: '1', attended: 'on' });
    await isDeleteIntent(request);
    expect((await request.formData()).get('id')).toBe('1');
  });
});
