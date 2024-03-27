import type { ApolloError, MutationOptions, ServerError } from '@apollo/client';
import type { GraphQLErrors } from '@apollo/client/errors';

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
