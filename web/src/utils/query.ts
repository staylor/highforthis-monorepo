import type { OperationVariables, QueryOptions } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
import type { RouterContextProvider } from 'react-router';

import { isAuthenticated } from '#/auth';
import { PER_PAGE } from '#/constants';
import { apolloClientContext } from '#/context.js';

import { offsetToCursor } from './connection';

type QueryData = Pick<QueryOptions, 'query' | 'variables'> & {
  request: Request;
  context: Readonly<RouterContextProvider>;
};

export default async function query<T = unknown>({
  query,
  variables,
  context,
  request,
}: QueryData) {
  const apolloClient = context.get(apolloClientContext);
  let data = {} as T;
  const headers: Record<string, string> = {};
  let authToken;
  if (request.url.includes('/admin')) {
    authToken = await isAuthenticated(request);
  }
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  try {
    ({ data } = (await apolloClient.query<T>({
      query,
      variables,
      context: {
        headers,
      },
    })) as { data: T });
  } catch (e) {
    const error = e as Error;
    if (ServerError.is(error)) {
      console.error(error.bodyText);
    }
    console.error(error.message);
  }
  return data;
}

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
