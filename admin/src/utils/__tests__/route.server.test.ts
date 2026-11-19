import { isDeleteIntent, isListTableIntent } from '#/utils/route.server';

const post = (fields: Record<string, string>) =>
  new Request('http://localhost/admin/show', { method: 'POST', body: new URLSearchParams(fields) });

describe('isDeleteIntent', () => {
  it('is true for a POST with intent=delete', async () => {
    await expect(isDeleteIntent(post({ intent: 'delete', ids: '1' }))).resolves.toBeTruthy();
  });

  it('is false for other POSTs and for other methods', async () => {
    await expect(isDeleteIntent(post({ id: '1', attended: 'on' }))).resolves.toBe(false);
    await expect(isDeleteIntent(new Request('http://localhost/admin/show'))).resolves.toBe(false);
  });

  it('leaves the body readable for the action', async () => {
    const request = post({ id: '1', attended: 'on' });
    await isDeleteIntent(request);
    expect((await request.formData()).get('id')).toBe('1');
  });
});

describe('isListTableIntent', () => {
  it('is true for the list table forms, even with no bulk action chosen', async () => {
    await expect(isListTableIntent(post({ intent: 'delete', ids: '1' }))).resolves.toBeTruthy();
    await expect(isListTableIntent(post({ intent: '', ids: '1' }))).resolves.toBeTruthy();
  });

  it('is false for inline toggles, which post without an intent', async () => {
    await expect(isListTableIntent(post({ id: '1', attended: 'on' }))).resolves.toBe(false);
    await expect(isDeleteIntent(post({ intent: '', ids: '1' }))).resolves.toBe(false);
  });
});
