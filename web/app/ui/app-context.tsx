import type { Handle, RemixNode } from 'remix/component';

import type { TFunction } from '#/lib/i18n.ts';
import type { AppQuery } from '#/types/graphql.ts';

export interface AppValue {
  t: TFunction;
  root: AppQuery;
  pathname: string;
}

/**
 * Stands in for useRouteLoaderData('root'), useLocation() and useTranslation() during
 * server rendering. Client entries hydrate on their own and can't read it, so they
 * receive what they need as props.
 */
export function AppProvider(handle: Handle<{ value: AppValue; children?: RemixNode }, AppValue>) {
  handle.context.set(handle.props.value);
  return () => handle.props.children;
}

export function getApp(handle: Handle<any>): AppValue {
  return handle.context.get(AppProvider);
}
