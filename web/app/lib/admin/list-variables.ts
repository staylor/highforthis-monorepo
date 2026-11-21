import type { Variables } from '#/lib/graphql.ts';

// Builds a list query's variables from the admin list pages' ?page= and ?search= params.

export const PER_PAGE = 20;

interface ListVariables extends Variables {
  first?: number;
  after?: string;
  search?: string;
}

/** The cursor GraphQL's connections use for an offset: base64 of 'arrayconnection:<offset>'. */
const offsetToCursor = (offset: number) => btoa(`arrayconnection:${offset}`);

export const addPageOffset = (searchParams: URLSearchParams, variables: ListVariables = {}) => {
  if (!variables.first) {
    variables.first = PER_PAGE;
  }
  if (searchParams.has('page')) {
    const pageOffset = Number(searchParams.get('page')) - 1;
    if (pageOffset > 0) {
      variables.after = offsetToCursor(pageOffset * variables.first - 1);
    }
  }
  return variables;
};

export const addSearchParam = (searchParams: URLSearchParams, variables: ListVariables = {}) => {
  const value = searchParams.get('search');
  if (value) {
    variables.search = value;
  }
  return variables;
};
