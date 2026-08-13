import { createContext } from 'react-router';

const APOLLO_CLIENT_CONTEXT_KEY = Symbol.for('highforthis.web.apollo-client-context');
const I18N_CONTEXT_KEY = Symbol.for('highforthis.web.i18n-context');
const GRAPHQL_HOST_CONTEXT_KEY = Symbol.for('highforthis.web.graphql-host-context');

/** @type {typeof globalThis & Record<symbol, unknown>} */
const registry = globalThis;

/** @type {import('react-router').RouterContext<import('@apollo/client').ApolloClient>} */
export const apolloClientContext = registry[APOLLO_CLIENT_CONTEXT_KEY] ?? createContext();
registry[APOLLO_CLIENT_CONTEXT_KEY] = apolloClientContext;

/** @type {import('react-router').RouterContext<import('i18next').i18n>} */
export const i18nContext = registry[I18N_CONTEXT_KEY] ?? createContext();
registry[I18N_CONTEXT_KEY] = i18nContext;

/** @type {import('react-router').RouterContext<string>} */
export const graphqlHostContext = registry[GRAPHQL_HOST_CONTEXT_KEY] ?? createContext();
registry[GRAPHQL_HOST_CONTEXT_KEY] = graphqlHostContext;
