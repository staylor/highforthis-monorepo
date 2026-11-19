import type { OperationVariables } from '@apollo/client';

// Builds a list query's variables from the admin list pages' ?page= and ?search= params.

export const PER_PAGE = 20;

/** The cursor GraphQL's connections use for an offset: base64 of 'arrayconnection:<offset>'. */
const offsetToCursor = (offset: number) => btoa(`arrayconnection:${offset}`);

export const addPageOffset = (
  searchParams: URLSearchParams,
  listVariables?: OperationVariables
) => {
  const variables = listVariables || {};
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

export const addSearchParam = (
  searchParams: URLSearchParams,
  listVariables?: OperationVariables
) => {
  const variables = listVariables || {};
  const value = searchParams.get('search');
  if (value) {
    variables.search = value;
  }
  return variables;
};
