import { useRouteLoaderData } from 'react-router';

import type { AppQuery } from '~/types/graphql';

export function rootData(matches: { id: string; data?: any }[]) {
  const root = matches.find((match) => match.id === 'root');
  return root?.data?.data || {};
}

export function useRootData() {
  const { data } = useRouteLoaderData('root');
  return (data || {}) as AppQuery;
}
