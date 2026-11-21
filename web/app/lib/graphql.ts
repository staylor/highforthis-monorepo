import { getOperationAST, print, type DocumentNode } from 'graphql';

// Accept either a base URL or a legacy /graphql URL.
const configuredGqlHost = process.env.GQL_HOST || 'http://localhost:8081';
export const graphqlHost = configuredGqlHost.replace(/\/graphql\/?$/, '').replace(/\/$/, '');

export type Variables = Record<string, unknown>;

/**
 * How pages and the admin's data functions run GraphQL operations. A failed operation is logged
 * and comes back as empty data: pages render without it, and `submitForm` and `deleteSelected`
 * tell from it that a save or delete failed.
 */
export interface GraphQLClient {
  query<T>(query: DocumentNode, variables?: Variables): Promise<T>;
  mutate<T>(mutation: DocumentNode, variables?: Variables): Promise<T>;
}

interface PreparedOperation {
  query: string;
  operationName: string | undefined;
  variableNames: string[];
}

// Each document is printed once, the first time it runs
const prepared = new WeakMap<DocumentNode, PreparedOperation>();

function prepare(document: DocumentNode): PreparedOperation {
  let operation = prepared.get(document);
  if (!operation) {
    const definition = getOperationAST(document);
    operation = {
      query: print(document),
      operationName: definition?.name?.value,
      variableNames:
        definition?.variableDefinitions?.map(({ variable }) => variable.name.value) ?? [],
    };
    prepared.set(document, operation);
  }
  return operation;
}

class GraphQLRequestError extends Error {
  name = 'GraphQLRequestError';
}

/**
 * Posts an operation to GraphQL and resolves to its data, or rejects when GraphQL answers with
 * errors or without a result. Only the variables the operation defines are sent.
 */
async function execute<T>(
  document: DocumentNode,
  variables: Variables = {},
  token?: string
): Promise<T> {
  const { query, operationName, variableNames } = prepare(document);
  const headers: Record<string, string> = {
    accept: 'application/graphql-response+json, application/json;q=0.9',
    'content-type': 'application/json',
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }
  // Looked up per request rather than captured at startup, so tests can stub fetch
  const response = await globalThis.fetch(`${graphqlHost}/graphql`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      operationName,
      query,
      variables: Object.fromEntries(variableNames.map((name) => [name, variables[name]])),
    }),
  });

  const text = await response.text();
  let result: { data?: T | null; errors?: { message: string }[] } | undefined;
  try {
    result = JSON.parse(text);
  } catch {
    // Not a GraphQL result, such as a proxy's error page
  }
  if (result?.errors?.length) {
    const messages = result.errors.map((error) => error.message).join('\n');
    throw new GraphQLRequestError(`${operationName ?? 'Operation'} failed: ${messages}`);
  }
  if (!response.ok || !result?.data) {
    throw new GraphQLRequestError(
      `${operationName ?? 'Operation'} failed with ${response.status}: ${text.slice(0, 500)}`
    );
  }
  return result.data;
}

/** A GraphQL client for a request, sending the admin's token with every operation when given. */
export function createGraphQLClient(token?: string): GraphQLClient {
  const run = async <T>(document: DocumentNode, variables?: Variables) => {
    try {
      return await execute<T>(document, variables, token);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      return {} as T;
    }
  };
  return { query: run, mutate: run };
}
