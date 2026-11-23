import type { Handle, RemixNode } from 'remix/component';

import type { RootData } from '#/actions/render-page.tsx';
import type { TFunction } from '#/lib/i18n.ts';

export interface AppValue {
  t: TFunction;
  root: RootData;
  pathname: string;
}

/**
 * What every component can read during server rendering: the translations, the site's settings
 * and the page's path. Client entries hydrate on their own and can't read it, so they receive
 * what they need as props.
 */
export function AppProvider(handle: Handle<{ value: AppValue; children?: RemixNode }, AppValue>) {
  handle.context.set(handle.props.value);
  return () => handle.props.children;
}

export function getApp(handle: Handle<any>): AppValue {
  return handle.context.get(AppProvider);
}
