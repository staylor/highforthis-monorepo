import { ApolloServer } from '@apollo/server';
import { DataTableDatabaseError, DataTableValidationError } from 'remix/data-table';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { errorOptions, QUERY_LIMITS, queryLimits } from '#/hardening';
import type { AppContext } from '#/models';

const typeDefs = `#graphql
  type Show { id: String, artists: [Artist] }
  type Artist { name: String, show: Show }
  type ShowConnection { edges: [Show] }
  type Query {
    shows(first: Int, last: Int): ShowConnection
    show: Show
    failedQuery: String
    unknownColumn: String
    refused: String
  }
`;

const logger = { error: vi.fn() };
let server: ApolloServer<AppContext>;

async function run(query: string, variables?: Record<string, unknown>) {
  const response = await server.executeOperation({ query, variables });
  if (response.body.kind !== 'single') {
    throw new Error('Expected a single result');
  }
  return { status: response.http.status, ...response.body.singleResult };
}

describe('hardening', () => {
  beforeAll(async () => {
    server = new ApolloServer<AppContext>({
      ...errorOptions(logger as never),
      typeDefs,
      resolvers: {
        Query: {
          shows: () => ({ edges: [{ id: '1', artists: [] }] }),
          show: () => ({ id: '1', artists: [] }),
          failedQuery: () => {
            throw new DataTableDatabaseError('Database execution failed', {
              cause: new Error('relation "Show" does not exist at /app/x.ts'),
            });
          },
          unknownColumn: () => {
            throw new DataTableValidationError('Unknown column "secret" for table "User"', []);
          },
          refused: () => {
            throw new Error('Admin access required');
          },
        },
      },
    });
    server.addPlugin(queryLimits());
    await server.start();
  });

  afterAll(() => server.stop());

  describe('queryLimits', () => {
    it('runs an operation within the limits', async () => {
      const result = await run(
        'query ($n: Int) { shows(first: $n) { edges { id } } show { id } }',
        {
          n: QUERY_LIMITS.pageSize,
        }
      );

      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({ shows: { edges: [{ id: '1' }] }, show: { id: '1' } });
    });

    it('turns away a page larger than the limit, written in the query or as a variable', async () => {
      for (const [query, variables] of [
        [`{ shows(first: ${QUERY_LIMITS.pageSize + 1}) { edges { id } } }`, undefined],
        ['query ($n: Int) { shows(last: $n) { edges { id } } }', { n: 100000 }],
        ['{ shows(first: -5) { edges { id } } }', undefined],
      ] as const) {
        const result = await run(query, variables);

        expect(result.status).toBe(400);
        expect(result.errors?.[0].extensions?.code).toBe('QUERY_TOO_LARGE');
        expect(result.data).toBeUndefined();
      }
    });

    it('turns away an operation that repeats a field under many aliases', async () => {
      const aliases = Array.from(
        { length: QUERY_LIMITS.rootFields + 1 },
        (_, i) => `a${i}: shows(first: 1) { edges { id } }`
      );

      const result = await run(`{ ${aliases.join(' ')} }`);

      expect(result.status).toBe(400);
      expect(result.errors?.[0].message).toMatch(/root fields/);
    });

    it('counts every spread of a fragment, so nested spreads can’t multiply the work', async () => {
      // Each level spreads the one below twice: 2^12 copies of `id`
      const levels = Array.from(
        { length: 12 },
        (_, i) => `fragment F${i} on Show { ...F${i + 1} ...F${i + 1} }`
      );
      const query = `{ show { ...F0 } } ${levels.join(' ')} fragment F12 on Show { id }`;

      const result = await run(query);

      expect(result.status).toBe(400);
      expect(result.errors?.[0].message).toMatch(/fields/);
    });

    it('turns away an operation nested too deep', async () => {
      let selection = 'name';
      for (let i = 0; i < QUERY_LIMITS.depth; i++) {
        selection = `show { artists { ${selection} } }`;
      }

      const result = await run(`{ ${selection} }`);

      expect(result.status).toBe(400);
      expect(result.errors?.[0].message).toMatch(/deep/);
    });
  });

  describe('errorOptions', () => {
    it.each(['failedQuery', 'unknownColumn'])(
      'answers a database error (%s) with a plain message, and logs it',
      async (field) => {
        const result = await run(`{ ${field} }`);

        expect(result.errors?.[0]).toEqual(
          expect.objectContaining({
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          })
        );
        expect(JSON.stringify(result)).not.toMatch(/Show|User|secret|Database execution|\/app\//);
        expect(logger.error).toHaveBeenCalledWith(
          expect.objectContaining({ path: [field] }),
          expect.any(String)
        );
      }
    );

    it('keeps messages that are meant for the caller, without a stack trace', async () => {
      const result = await run('{ refused }');

      expect(result.errors?.[0].message).toBe('Admin access required');
      expect(result.errors?.[0].extensions?.stacktrace).toBeUndefined();
    });
  });
});
