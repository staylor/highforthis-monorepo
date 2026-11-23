import { gql } from 'graphql-tag';
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import {
  attempt,
  createGraphQLClient,
  graphqlFetch,
  graphqlHost,
  GraphQLRequestError,
} from './graphql.ts';
import { logger } from './logger.ts';

const showsQuery = gql`
  query Shows($first: Int, $search: String) {
    shows(first: $first, search: $search) {
      count
    }
  }
`;

interface Sent {
  url: string;
  authorization: string | null;
  signal: AbortSignal | null | undefined;
  body: { operationName: string; query: string; variables: Record<string, unknown> };
}

/** Answers every request with `answer`, and records what was sent. */
function stubFetch(t: TestContext, answer: () => Response) {
  const sent: Sent[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({
      url: String(input),
      authorization: new Headers(init?.headers).get('authorization'),
      signal: init?.signal,
      body: JSON.parse(String(init?.body)),
    });
    return answer();
  });
  return sent;
}

describe('createGraphQLClient', () => {
  it('posts the operation by name, with only the variables it defines', async (t) => {
    const sent = stubFetch(t, () => Response.json({ data: { shows: { count: 3 } } }));

    const data = await createGraphQLClient().query(showsQuery, { first: 5, cacheKey: 'x' });

    assert.deepEqual(data, { shows: { count: 3 } });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].url, `${graphqlHost}/graphql`);
    assert.equal(sent[0].authorization, null);
    assert.equal(sent[0].body.operationName, 'Shows');
    assert.match(sent[0].body.query, /^query Shows\(\$first: Int, \$search: String\)/);
    assert.deepEqual(sent[0].body.variables, { first: 5 });
  });

  it("sends the admin's token", async (t) => {
    const sent = stubFetch(t, () => Response.json({ data: { shows: null } }));

    await createGraphQLClient('token-1').mutate(showsQuery);

    assert.equal(sent[0].authorization, 'Bearer token-1');
  });

  it('gives GraphQL only so long to answer', async (t) => {
    const sent = stubFetch(t, () => Response.json({ data: { shows: null } }));

    await createGraphQLClient().query(showsQuery);

    assert.ok(sent[0].signal instanceof AbortSignal);
    assert.equal(sent[0].signal.aborted, false);
  });

  it('logs GraphQL errors and rejects with them', async (t) => {
    stubFetch(t, () =>
      Response.json(
        { errors: [{ message: 'Admin access required' }], data: null },
        { status: 400, headers: { 'content-type': 'application/graphql-response+json' } }
      )
    );
    const logged = t.mock.method(logger, 'error', () => {});

    await assert.rejects(createGraphQLClient().query(showsQuery), (error: unknown) => {
      assert.ok(error instanceof GraphQLRequestError);
      assert.equal(error.message, 'Shows failed: Admin access required');
      assert.equal(error.invalid, undefined);
      return true;
    });
    const [fields, message] = logged.mock.calls[0].arguments as [{ err: Error }, string];
    assert.equal(message, 'GraphQL operation failed');
    assert.equal(fields.err.message, 'Shows failed: Admin access required');
  });

  it("says what GraphQL found wrong with its input, which isn't logged as an error", async (t) => {
    stubFetch(t, () =>
      Response.json(
        {
          errors: [
            { message: 'Invalid input (title: Too small)', extensions: { code: 'BAD_USER_INPUT' } },
          ],
          data: null,
        },
        { status: 400 }
      )
    );
    const errors = t.mock.method(logger, 'error', () => {});
    const warnings = t.mock.method(logger, 'warn', () => {});

    await assert.rejects(createGraphQLClient().mutate(showsQuery), (error: unknown) => {
      assert.ok(error instanceof GraphQLRequestError);
      assert.equal(error.invalid, 'Invalid input (title: Too small)');
      return true;
    });
    assert.equal(errors.mock.callCount(), 0);
    assert.equal(warnings.mock.callCount(), 1);
  });

  it('rejects with an answer that is not a GraphQL result', async (t) => {
    stubFetch(t, () => new Response('Bad Gateway', { status: 502 }));
    t.mock.method(logger, 'error', () => {});

    await assert.rejects(createGraphQLClient().mutate(showsQuery), {
      name: 'GraphQLRequestError',
      message: 'Shows failed with 502: Bad Gateway',
    });
  });

  it('rejects when GraphQL is unreachable', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });
    const logged = t.mock.method(logger, 'error', () => {});

    await assert.rejects(createGraphQLClient().query(showsQuery), {
      name: 'GraphQLRequestError',
      message: 'Shows failed: fetch failed',
    });
    assert.equal(logged.mock.callCount(), 1);
  });
});

describe('attempt', () => {
  it("resolves to an operation's data", async () => {
    assert.deepEqual(await attempt(Promise.resolve({ saved: true })), { data: { saved: true } });
  });

  it('resolves to why an operation failed', async () => {
    const error = new GraphQLRequestError('Save failed');
    assert.deepEqual(await attempt(Promise.reject(error)), { error });
  });

  it("rejects with an error that isn't GraphQL's", async () => {
    await assert.rejects(attempt(Promise.reject(new TypeError('a bug'))), TypeError);
  });
});

describe('graphqlFetch', () => {
  it("asks GraphQL's server, and only waits so long", async (t) => {
    const fetched = t.mock.method(globalThis, 'fetch', async () => new Response(null));

    await graphqlFetch('/auth/session', { headers: { Authorization: 'Bearer token-1' } });

    const [url, init] = fetched.mock.calls[0].arguments as [string, RequestInit];
    assert.equal(url, `${graphqlHost}/auth/session`);
    assert.equal(new Headers(init.headers).get('authorization'), 'Bearer token-1');
    assert.ok(init.signal instanceof AbortSignal);
  });
});
