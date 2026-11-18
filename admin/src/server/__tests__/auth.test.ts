// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

import { signIn } from '../auth';
import {
  deletePasskey,
  listPasskeys,
  passkeyRegistrationOptions,
  verifyPasskeyRegistration,
} from '../passkeys';

import { form } from './helpers';

const graphqlHost = 'http://graphql.test';

function stubFetch(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockImplementation(async () =>
      status === 204 ? new Response(null, { status }) : Response.json(body, { status })
    );
}

const requestOf = (fetch: ReturnType<typeof stubFetch>, index = 0) => {
  const [url, init] = fetch.mock.calls[index];
  return {
    url,
    method: init?.method,
    headers: init?.headers,
    body: init?.body ? JSON.parse(init.body as string) : undefined,
  };
};

describe('signIn', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('signs in with an email and password', async () => {
    const fetch = stubFetch({ token: 'abc' });
    const user = await signIn({
      graphqlHost,
      formData: form({ intent: 'password', email: 'pat@example.com', password: 'hunter2' }),
    });
    expect(user).toEqual({ token: 'abc' });
    expect(requestOf(fetch)).toMatchObject({
      url: 'http://graphql.test/auth',
      method: 'POST',
      body: { email: 'pat@example.com', password: 'hunter2' },
    });
  });

  it("signs in with a passkey's response", async () => {
    const fetch = stubFetch({ token: 'abc' });
    const user = await signIn({
      graphqlHost,
      formData: form({ intent: 'passkey', challengeId: 'c1', response: '{"id":"cred"}' }),
    });
    expect(user).toEqual({ token: 'abc' });
    expect(requestOf(fetch)).toMatchObject({
      url: 'http://graphql.test/auth/passkeys/authenticate/verify',
      body: { challengeId: 'c1', response: { id: 'cred' } },
    });
  });

  it('turns away an incomplete passkey form without asking the server', async () => {
    const fetch = stubFetch({});
    await expect(
      signIn({ graphqlHost, formData: form({ intent: 'passkey', challengeId: 'c1' }) })
    ).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("throws the server's error", async () => {
    stubFetch({ error: 'Invalid email or password' }, 401);
    await expect(
      signIn({ graphqlHost, formData: form({ email: 'pat@example.com', password: 'nope' }) })
    ).rejects.toThrow('Invalid email or password');
  });
});

describe('passkeys', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const auth = { graphqlHost, token: 'abc' };

  it('lists the passkeys', async () => {
    const fetch = stubFetch({ passkeys: [] });
    await expect(listPasskeys(auth)).resolves.toEqual({ passkeys: [] });
    expect(requestOf(fetch)).toEqual({
      url: 'http://graphql.test/auth/passkeys',
      method: undefined,
      headers: { Authorization: 'Bearer abc' },
      body: undefined,
    });
  });

  it('rejects a request without a session', async () => {
    const fetch = stubFetch({});
    const rejection = await listPasskeys({ graphqlHost, token: undefined }).catch((e) => e);
    expect(rejection).toBeInstanceOf(Response);
    expect(rejection.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('removes a passkey', async () => {
    const fetch = stubFetch(null, 204);
    await expect(
      deletePasskey({ ...auth, formData: form({ credentialId: 'a/b' }) })
    ).resolves.toEqual({ deleted: true });
    expect(requestOf(fetch)).toMatchObject({
      url: 'http://graphql.test/auth/passkeys/a%2Fb',
      method: 'DELETE',
    });
  });

  it('needs a passkey to remove', async () => {
    await expect(deletePasskey({ ...auth, formData: form({}) })).rejects.toThrow(
      'Passkey ID is required'
    );
  });

  it('registers a passkey', async () => {
    const fetch = stubFetch({ challengeId: 'c1', options: {} });
    await expect(passkeyRegistrationOptions(auth)).resolves.toEqual({
      challengeId: 'c1',
      options: {},
    });
    fetch.mockResolvedValueOnce(Response.json({ verified: true }));
    const body = { challengeId: 'c1', name: 'Laptop', response: { id: 'cred' } as never };
    await verifyPasskeyRegistration({ ...auth, body });

    expect(requestOf(fetch, 0)).toMatchObject({
      url: 'http://graphql.test/auth/passkeys/register/options',
      method: 'POST',
    });
    expect(requestOf(fetch, 1)).toEqual({
      url: 'http://graphql.test/auth/passkeys/register/verify',
      method: 'POST',
      headers: { Authorization: 'Bearer abc', 'Content-Type': 'application/json' },
      body,
    });
  });

  it("throws the server's error", async () => {
    stubFetch({ error: 'Challenge expired' }, 400);
    await expect(passkeyRegistrationOptions(auth)).rejects.toThrow('Challenge expired');
  });
});
