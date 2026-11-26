import { afterEach, beforeEach, type TestContext } from 'remix/test';

import { testSecret, testSession } from '#/lib/adminSession.fixtures.ts';
import { router } from '#/router.ts';

// What the admin's controller tests share: GraphQL's stand-in, and requests from a signed-in admin

const origin = 'http://localhost';

export const storage = 'https://storage.googleapis.com/wonderboymusic';

type Operation = { operationName: string; variables: Record<string, any> };

/**
 * Stands in for GraphQL: accepts the session, answers each operation by name, and records the
 * operations it was sent. An answer that's a Response is sent as it is.
 */
export function stubGraphQL(t: TestContext, answers: Record<string, unknown> = {}) {
  const operations: Operation[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    const { operationName, variables } = JSON.parse(String(init?.body));
    operations.push({ operationName, variables });
    const answer = answers[operationName];
    return answer instanceof Response ? answer.clone() : Response.json({ data: answer ?? {} });
  });
  return operations;
}

/** GraphQL's answer to input it turns down. */
export const invalid = (message: string) =>
  Response.json(
    { errors: [{ message, extensions: { code: 'BAD_USER_INPUT' } }], data: null },
    { status: 400 }
  );

/** Has the app accept `testSession` during each of the suite's tests. */
export function acceptTestSession() {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });
}

/** A page, as the signed-in admin, or with another cookie, or none. */
export const get = (path: string, cookie = testSession) =>
  router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));

/** A form posted by the signed-in admin, from this site, or from the origin `from`. */
export const post = (path: string, body: string, from = origin) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: testSession, origin: from },
    })
  );
