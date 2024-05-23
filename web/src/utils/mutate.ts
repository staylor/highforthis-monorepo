import type { ApolloError, MutationOptions, ServerError } from '@apollo/client';
import type { GraphQLErrors } from '@apollo/client/errors';
import qs from 'qs';

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

type MutationData = Pick<MutationOptions, 'mutation' | 'variables'> & AppData;

const mutate = async ({ mutation, variables, context }: MutationData) => {
  const { apolloClient } = context;
  let data = {};
  try {
    ({ data } = await apolloClient.mutate({ mutation, variables }));
  } catch (e) {
    const error = e as ApolloError;
    console.error((error.networkError as ServerError)?.result);
    (error.graphQLErrors as GraphQLErrors).forEach((err) => {
      console.error(err.message);
    });
  }
  return data;
};

export default mutate;
