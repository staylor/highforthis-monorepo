import { readFileSync } from 'node:fs';

import { buildSchema, parse, validate } from 'graphql';
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { apiGap, apiReady, newFields } from './api-ready.ts';
import { graphqlHost } from './graphql.ts';

const ready = () => Response.json({ data: { __typename: 'Query' } });
// What a GraphQL release without the field answers
const missing = () =>
  Response.json(
    { errors: [{ message: 'Cannot query field "firstLocalDate" on type "ShowTotals".' }] },
    { status: 400 }
  );

/** Answers GraphQL's requests in turn, the last answer from then on, and records the requests. */
function stubGraphQL(t: TestContext, ...answers: (() => Response)[]) {
  const sent: { url: string; method?: string; query: string }[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    sent.push({
      url: String(input),
      method: init?.method,
      query: JSON.parse(String(init?.body)).query,
    });
    return answers[Math.min(sent.length, answers.length) - 1]();
  });
  return sent;
}

describe('apiGap', () => {
  // A field GraphQL never has would keep web from deploying at all
  it("asks only for fields that are in GraphQL's schema", () => {
    const schema = buildSchema(
      readFileSync(new URL('../../../graphql/schema.graphql', import.meta.url), 'utf8')
    );
    assert.deepEqual(validate(schema, parse(newFields)), []);
  });

  it('finds none once GraphQL answers the fields', async (t) => {
    const sent = stubGraphQL(t, ready);
    assert.equal(await apiGap(), null);
    assert.deepEqual(sent, [{ url: `${graphqlHost}/graphql`, method: 'POST', query: newFields }]);
  });

  it("says which field a GraphQL release from before it doesn't have", async (t) => {
    stubGraphQL(t, missing);
    assert.equal(await apiGap(), 'Cannot query field "firstLocalDate" on type "ShowTotals".');
  });

  it("says so when GraphQL answers something else, or can't be reached", async (t) => {
    stubGraphQL(t, () => new Response('Bad Gateway', { status: 502 }));
    assert.equal(await apiGap(), 'GraphQL answered 502');

    // Refused at each of localhost's addresses, fetch's cause has a code and no message
    const refused = Object.assign(new AggregateError([]), { code: 'ECONNREFUSED' });
    for (const [cause, reason] of [
      [new Error('getaddrinfo ENOTFOUND graphql'), 'fetch failed: getaddrinfo ENOTFOUND graphql'],
      [refused, 'fetch failed: ECONNREFUSED'],
      [undefined, 'fetch failed'],
    ] as const) {
      t.mock.method(globalThis, 'fetch', async () => {
        throw new TypeError('fetch failed', { cause });
      });
      assert.equal(await apiGap(), reason);
    }
  });
});

describe('apiReady', () => {
  /** A clock that the waits between askings move on, without waiting */
  function clock() {
    let time = 0;
    const waits: number[] = [];
    return {
      waits,
      now: () => time,
      pause: async (milliseconds: number) => {
        waits.push(milliseconds);
        time += milliseconds;
      },
    };
  }

  it('asks again until GraphQL answers the fields', async (t) => {
    const sent = stubGraphQL(t, missing, missing, ready);
    const reasons: string[] = [];
    const { waits, ...time } = clock();

    await apiReady({ ...time, onWait: (reason) => reasons.push(reason) });

    assert.equal(sent.length, 3);
    assert.deepEqual(waits, [5000, 5000]);
    assert.deepEqual(
      reasons,
      Array(2).fill('Cannot query field "firstLocalDate" on type "ShowTotals".')
    );
  });

  it('gives up, with why, when GraphQL still has not answered them in time', async (t) => {
    const sent = stubGraphQL(t, missing);
    const { waits, ...time } = clock();

    await assert.rejects(
      apiReady({ ...time, timeout: 12_000 }),
      /GraphQL doesn't answer what this build asks for: Cannot query field "firstLocalDate"/
    );
    // At 0, 5 and 10 seconds: another wait would end after the 12 it has
    assert.equal(sent.length, 3);
    assert.deepEqual(waits, [5000, 5000]);
  });
});
