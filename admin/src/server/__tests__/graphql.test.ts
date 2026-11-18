// @vitest-environment node
import type { ApolloClient } from '@apollo/client';
import { gql } from 'graphql-tag';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGraphQLClient } from '../graphql';

const thingQuery = gql`
  query Thing {
    thing {
      id
    }
  }
`;

const saveMutation = gql`
  mutation SaveThing {
    saveThing {
      id
    }
  }
`;

function stubApollo({ data = { thing: { id: '1' } } }: { data?: unknown } = {}) {
  const apollo = {
    query: vi.fn(async (_options: unknown) => ({ data })),
    mutate: vi.fn(async (_options: unknown) => ({ data })),
  };
  return apollo;
}

const client = (apollo: ReturnType<typeof stubApollo>, authenticateQueries = true) => {
  const token = vi.fn(async () => 'secret' as string | undefined);
  return {
    token,
    gql: createGraphQLClient({
      apolloClient: apollo as unknown as ApolloClient,
      token,
      authenticateQueries,
    }),
  };
};

describe('createGraphQLClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the session's token with admin queries", async () => {
    const apollo = stubApollo();
    const { gql } = client(apollo);

    await expect(gql.query(thingQuery, { id: '1' })).resolves.toEqual({ thing: { id: '1' } });
    expect(apollo.query).toHaveBeenCalledWith({
      query: thingQuery,
      variables: { id: '1' },
      context: { headers: { Authorization: 'Bearer secret' } },
    });
  });

  it('sends queries without a token outside the admin pages', async () => {
    const apollo = stubApollo();
    const { gql, token } = client(apollo, false);

    await gql.query(thingQuery);
    expect(token).not.toHaveBeenCalled();
    expect(apollo.query).toHaveBeenCalledWith(
      expect.objectContaining({ context: { headers: {} } })
    );
  });

  it('always sends the token with mutations', async () => {
    const apollo = stubApollo();
    const { gql } = client(apollo, false);

    await gql.mutate(saveMutation, { title: 'New' });
    expect(apollo.mutate).toHaveBeenCalledWith({
      mutation: saveMutation,
      variables: { title: 'New' },
      context: { headers: { Authorization: 'Bearer secret' } },
    });
  });

  it('sends no Authorization header when signed out', async () => {
    const apollo = stubApollo();
    const { gql, token } = client(apollo);
    token.mockResolvedValue(undefined);

    await gql.mutate(saveMutation);
    expect(apollo.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ context: { headers: {} } })
    );
  });

  it('logs a failed operation and returns empty data', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const apollo = stubApollo();
    apollo.query.mockRejectedValue(new Error('Query failed'));
    apollo.mutate.mockRejectedValue(new Error('Mutation failed'));
    const { gql } = client(apollo);

    await expect(gql.query(thingQuery)).resolves.toEqual({});
    await expect(gql.mutate(saveMutation)).resolves.toEqual({});
    expect(error).toHaveBeenCalledWith('Query failed');
    expect(error).toHaveBeenCalledWith('Mutation failed');
  });

  it('returns empty data for a mutation without data', async () => {
    const { gql } = client(stubApollo({ data: null }));
    await expect(gql.mutate(saveMutation)).resolves.toEqual({});
  });
});
