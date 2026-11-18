import type { QueryOptions } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
import type { RouterContextProvider } from 'react-router';

import { isAuthenticated } from '../auth';
import { apolloClientContext } from '../context.js';

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
