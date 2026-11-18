import type { OperationVariables } from '@apollo/client';

import { PER_PAGE } from '#/constants';
import { offsetToCursor } from '#/utils/connection';

// Builds a list query's variables from the admin list pages' ?page= and ?search= params.

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
