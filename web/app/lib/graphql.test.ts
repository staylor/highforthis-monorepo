import { gql } from 'graphql-tag';
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { createGraphQLClient, graphqlHost } from './graphql.ts';

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
  body: { operationName: string; query: string; variables: Record<string, unknown> };
}

/** Answers every request with `answer`, and records what was sent. */
function stubFetch(t: TestContext, answer: () => Response) {
  const sent: Sent[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({
      url: String(input),
      authorization: new Headers(init?.headers).get('authorization'),
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

  it('logs GraphQL errors and answers with empty data', async (t) => {
    stubFetch(t, () =>
      Response.json(
        { errors: [{ message: 'Admin access required' }], data: null },
        { status: 400, headers: { 'content-type': 'application/graphql-response+json' } }
      )
    );
    const logged = t.mock.method(console, 'error', () => {});

    assert.deepEqual(await createGraphQLClient().query(showsQuery), {});
    assert.deepEqual(logged.mock.calls[0].arguments, ['Shows failed: Admin access required']);
  });

  it('logs an answer that is not a GraphQL result and answers with empty data', async (t) => {
    stubFetch(t, () => new Response('Bad Gateway', { status: 502 }));
    const logged = t.mock.method(console, 'error', () => {});

    assert.deepEqual(await createGraphQLClient().mutate(showsQuery), {});
    assert.deepEqual(logged.mock.calls[0].arguments, ['Shows failed with 502: Bad Gateway']);
  });

  it('answers with empty data when GraphQL is unreachable', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });
    const logged = t.mock.method(console, 'error', () => {});

    assert.deepEqual(await createGraphQLClient().query(showsQuery), {});
    assert.deepEqual(logged.mock.calls[0].arguments, ['fetch failed']);
  });
});
