import type { ApolloError, OperationVariables, QueryOptions, ServerError } from '@apollo/client';
import type { AppLoadContext } from 'react-router';

import { isAuthenticated } from '~/auth';
import { PER_PAGE } from '~/constants';

import { offsetToCursor } from './connection';

type QueryData = Pick<QueryOptions, 'query' | 'variables'> & {
  request: Request;
  context: AppLoadContext;
};

export default async function query<T = unknown>({
  query,
  variables,
  context,
  request,
}: QueryData) {
  const { apolloClient } = context;
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
    ({ data } = await apolloClient.query<T>({
      query,
      variables,
      context: {
        headers,
      },
    }));
  } catch (e) {
    const error = e as ApolloError;
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error(err.message);
      });
    }
    if (error.networkError) {
      console.error((error.networkError as ServerError)?.result);
    } else {
      console.error(e);
    }
  }
  return data;
}

export const addPageOffset = (request: Request, listVariables?: OperationVariables) => {
  const params = new URL(request.url).searchParams;
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

export const addSearchParam = (request: Request, listVariables?: OperationVariables) => {
  const url = new URL(request.url);
  const variables = listVariables || {};
  const value = url.searchParams.get('search');
  if (value) {
    variables.search = value;
  }
  return variables;
};
