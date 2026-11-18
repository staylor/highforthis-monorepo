import type { OperationVariables } from '@apollo/client';

import { PER_PAGE } from '@highforthis/shared/constants';
import { offsetToCursor } from '@highforthis/shared/utils/connection';

// Builds a list query's variables from the admin list pages' ?page= and ?search= params.

export const addPageOffset = (url: URL, listVariables?: OperationVariables) => {
  const params = url.searchParams;
  const variables = listVariables || {};
  if (!variables.first) {
    variables.first = PER_PAGE;
  }
  if (params.has('page')) {
    const pageOffset = Number(params.get('page')) - 1;
    if (pageOffset > 0) {
      variables.after = offsetToCursor(pageOffset * variables.first - 1);
    }
  }
  return variables;
};

export const addSearchParam = (url: URL, listVariables?: OperationVariables) => {
  const variables = listVariables || {};
  const value = url.searchParams.get('search');
  if (value) {
    variables.search = value;
  }
  return variables;
};
