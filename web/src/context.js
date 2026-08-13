import { createContext } from 'react-router';

/** @type {import('react-router').RouterContext<import('@apollo/client').ApolloClient>} */
export const apolloClientContext = createContext();

/** @type {import('react-router').RouterContext<import('i18next').i18n>} */
export const i18nContext = createContext();

/** @type {import('react-router').RouterContext<string>} */
export const graphqlHostContext = createContext();
