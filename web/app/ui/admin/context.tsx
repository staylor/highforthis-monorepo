import type { Handle, RemixNode } from 'remix/component';

import type { TFunction } from '../../lib/i18n.ts';

export interface AdminValue {
  /** Translates the admin's strings. */
  t: TFunction;
  /** The request URL: its path picks the active nav section, and its query holds messages. */
  url: URL;
  /** The public site's address, for the nav's "View site" link. */
  siteUrl: string;
}

/** What admin components read while the server renders a page, like web's AppProvider. */
export function AdminProvider(
  handle: Handle<{ value: AdminValue; children?: RemixNode }, AdminValue>
) {
  handle.context.set(handle.props.value);
  return () => handle.props.children;
}

export function getAdmin(handle: Handle<any>): AdminValue {
  return handle.context.get(AdminProvider);
}
