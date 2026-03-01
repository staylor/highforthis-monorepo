import type { MutationOptions } from '@apollo/client';
import { ServerError } from '@apollo/client/errors';
import qs from 'qs';
import type { AppLoadContext } from 'react-router';

import parseObject from './parseObject';

export interface ParseFormDataArgs {
  skipKeys?: string[];
}

export const parseFormData = async (request: Request, args?: ParseFormDataArgs) => {
  // FormData returns multi-dimensional keys as: foo[0][bar][baz]
  // - we would have to write our own parser, so:
  // text() returns the POST data as an x-www-form-urlencoded string
  const formData = await request.text();
  // qs parses the string into an object
  // parseObject corces the values into their proper types (numbers, booleans, etc)
  // GraphQL will throw an error if `Int`s are passed as strings.
  return parseObject(qs.parse(formData), args?.skipKeys);
};

type MutationData = Pick<MutationOptions, 'mutation' | 'variables'> & { context: AppLoadContext };

const mutate = async ({ mutation, variables, context }: MutationData) => {
  const { apolloClient } = context;
  let data: Record<string, any> = {};
  try {
    const result = await apolloClient.mutate({ mutation, variables });
    data = (result.data ?? {}) as Record<string, any>;
  } catch (e) {
    const error = e as Error;
    if (ServerError.is(error)) {
      console.error(error.bodyText);
    }
    console.error(error.message);
  }
  return data;
};

export default mutate;
