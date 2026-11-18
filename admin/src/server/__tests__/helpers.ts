import type { OperationVariables } from '@apollo/client';
import { getOperationAST, type DocumentNode } from 'graphql';
import { vi, type Mock } from 'vitest';

import type { GraphQLClient } from '../graphql';

type Operation = (document: DocumentNode, variables?: OperationVariables) => Promise<unknown>;

// A GraphQL client whose queries and mutations resolve to the given data, recording each call
export function stubGraphQL({
  query = {},
  mutate = {},
}: { query?: unknown; mutate?: unknown } = {}) {
  const client = {
    query: vi.fn<Operation>(async () => query),
    mutate: vi.fn<Operation>(async () => mutate),
  };
  return client as typeof client & GraphQLClient;
}

// The operations a stubbed method was called with, by name, with their variables
export const calls = (method: Mock<Operation>) =>
  method.mock.calls.map(([document, variables]) => ({
    operation: getOperationAST(document)?.name?.value,
    variables,
  }));

// A submitted form; an array value is a field repeated, like checked boxes sharing a name
export function form(fields: Record<string, string | string[]>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      formData.append(name, item);
    }
  }
  return formData;
}
