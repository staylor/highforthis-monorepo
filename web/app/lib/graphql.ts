import { getOperationAST, print, type DocumentNode } from 'graphql';

import { logger } from './logger.ts';

// Accept either a base URL or a legacy /graphql URL.
const configuredGqlHost = process.env.GQL_HOST || 'http://localhost:8081';
export const graphqlHost = configuredGqlHost.replace(/\/graphql\/?$/, '').replace(/\/$/, '');

export type Variables = Record<string, unknown>;

/**
 * How pages and the admin's data functions run GraphQL operations. An operation that fails is
 * logged and rejects with a GraphQLRequestError. A page's own query failing is the page failing,
 * so its action lets the error go on to the error page. A save or a delete catches it, with
 * `attempt()`, to tell the admin, and so does a page for what it can render without, such as the
 * site's settings.
 */
export interface GraphQLClient {
  query<T>(query: DocumentNode, variables?: Variables): Promise<T>;
  mutate<T>(mutation: DocumentNode, variables?: Variables): Promise<T>;
}

/** Why an operation failed. */
export class GraphQLRequestError extends Error {
  name = 'GraphQLRequestError';
  /**
   * What GraphQL said was wrong with what it was sent, when that's all that went wrong: a form's
   * input it turned down, or a page of results that doesn't exist.
   */
  invalid?: string;
}

// How long GraphQL gets to answer. A hung query would otherwise hold its page's request open for
// good. A mutation gets longer, since one can be slow for good reason, as adding album covers is,
// and giving up on it early would invite doing it twice.
const QUERY_TIMEOUT = 30_000;
const MUTATION_TIMEOUT = 120_000;
const REQUEST_TIMEOUT = 10_000;

/**
 * A request to one of GraphQL's other endpoints, such as the ones that sign an admin in. `fetch`
 * is looked up per request rather than captured at startup, so tests can stub it.
 */
export function graphqlFetch(path: string, init?: RequestInit): Promise<Response> {
  return globalThis.fetch(`${graphqlHost}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });
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

interface Result<T> {
  data?: T | null;
  errors?: { message: string; extensions?: { code?: string } }[];
}

// The code GraphQL gives an error that is the request's mistake rather than its own
const INVALID = 'BAD_USER_INPUT';

/**
 * Posts an operation to GraphQL and resolves to its data, or rejects when GraphQL answers with
 * errors, without a result, or not at all. Only the variables the operation defines are sent.
 */
async function execute<T>(
  document: DocumentNode,
  variables: Variables,
  { token, timeout }: { token?: string; timeout: number }
): Promise<T> {
  const { query, operationName, variableNames } = prepare(document);
  const name = operationName ?? 'Operation';
  const headers: Record<string, string> = {
    accept: 'application/graphql-response+json, application/json;q=0.9',
    'content-type': 'application/json',
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  let response: Response;
  let text: string;
  try {
    // Looked up per request rather than captured at startup, so tests can stub fetch
    response = await globalThis.fetch(`${graphqlHost}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        operationName,
        query,
        variables: Object.fromEntries(variableNames.map((key) => [key, variables[key]])),
      }),
      signal: AbortSignal.timeout(timeout),
    });
    text = await response.text();
  } catch (cause) {
    // GraphQL is unreachable, or took too long
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new GraphQLRequestError(`${name} failed: ${reason}`, { cause });
  }

  let result: Result<T> | undefined;
  try {
    result = JSON.parse(text);
  } catch {
    // Not a GraphQL result, such as a proxy's error page
  }
  if (result?.errors?.length) {
    const messages = result.errors.map(({ message }) => message).join('\n');
    const error = new GraphQLRequestError(`${name} failed: ${messages}`);
    if (result.errors.every(({ extensions }) => extensions?.code === INVALID)) {
      error.invalid = messages;
    }
    throw error;
  }
  if (!response.ok || !result?.data) {
    throw new GraphQLRequestError(`${name} failed with ${response.status}: ${text.slice(0, 500)}`);
  }
  return result.data;
}

/** A GraphQL client for a request, sending the admin's token with every operation when given. */
export function createGraphQLClient(token?: string): GraphQLClient {
  const run =
    (timeout: number) =>
    async <T>(document: DocumentNode, variables: Variables = {}) => {
      try {
        return await execute<T>(document, variables, { token, timeout });
      } catch (error) {
        // Input GraphQL turned down is the request's mistake, not something that broke
        const invalid = error instanceof GraphQLRequestError && error.invalid !== undefined;
        logger[invalid ? 'warn' : 'error']({ err: error }, 'GraphQL operation failed');
        throw error;
      }
    };
  return { query: run(QUERY_TIMEOUT), mutate: run(MUTATION_TIMEOUT) };
}

/** An operation's data, or the reason it failed. */
type Attempt<T> = { data: T; error?: undefined } | { data?: undefined; error: GraphQLRequestError };

/**
 * Waits for an operation and resolves to its data or to why it failed, for a caller that carries
 * on either way: `const { data, error } = await attempt(gql.mutate(…))`.
 */
export async function attempt<T>(operation: Promise<T>): Promise<Attempt<T>> {
  try {
    return { data: await operation };
  } catch (error) {
    if (error instanceof GraphQLRequestError) {
      return { error };
    }
    throw error;
  }
}
