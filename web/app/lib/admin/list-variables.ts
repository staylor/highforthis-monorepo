import type { GraphQLClient, Variables } from '#/lib/graphql.ts';

// Builds a list query's variables from the admin list pages' ?page= and ?search= params.

export const PER_PAGE = 20;

/** What a list page's data function needs: the client, and the page's query parameters. */
export interface ListArgs {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}

interface ListVariables extends Variables {
  first?: number;
  after?: string;
  search?: string;
}

/** The cursor GraphQL's connections use for an offset: base64 of 'arrayconnection:<offset>'. */
const offsetToCursor = (offset: number) => btoa(`arrayconnection:${offset}`);

/**
 * A list page's variables, added to `variables`, such as the list's order: a page of PER_PAGE
 * rows, unless `variables` says how many, after the pages before ?page=, matching ?search=.
 */
export function listVariables(searchParams: URLSearchParams, variables: ListVariables = {}) {
  variables.first ||= PER_PAGE;
  const pageOffset = Number(searchParams.get('page')) - 1;
  if (pageOffset > 0) {
    variables.after = offsetToCursor(pageOffset * variables.first - 1);
  }
  const search = searchParams.get('search');
  if (search) {
    variables.search = search;
  }
  return variables;
}
