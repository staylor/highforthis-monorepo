import type { RemixNode } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';

import { loadRootData, titleTemplate } from '#/actions/render-page.tsx';
import type { RedirectResult } from '#/lib/admin/forms.ts';
import type { GraphQLClient } from '#/lib/graphql.ts';
import { getAdminT } from '#/lib/i18n.ts';
import type { AppContext } from '#/router.ts';
import { Heading } from '#/ui/admin/page.tsx';

import { AdminDocument } from './document.tsx';

interface AdminPageOptions {
  title?: string;
  status?: number;
  /** Leaves out the nav, for signing in. */
  bare?: boolean;
}

// What rendering needs from a request's context. Admin controllers' contexts also carry
// `context.admin`, which keeps them from being an `AppContext`.
export type AdminPageContext = Pick<AppContext, 'gql' | 'nonce' | 'request' | 'render' | 'url'>;

/** The same, for a page that loads its data as the signed-in admin. */
export type AdminContext = AdminPageContext & { admin: { gql: GraphQLClient } };

export async function renderAdminPage(
  context: AdminPageContext,
  page: RemixNode,
  options: AdminPageOptions = {}
) {
  const { siteSettings } = await loadRootData(context);
  const admin = {
    t: getAdminT(),
    url: context.url,
    siteUrl: siteSettings?.siteUrl || '/',
  };
  const title = titleTemplate(options.title ? `${options.title} » Admin` : 'Admin', siteSettings);
  return context.render(
    <AdminDocument admin={admin} title={title} bare={options.bare} nonce={context.nonce}>
      {page}
    </AdminDocument>,
    { status: options.status }
  );
}

/** The page for an artist, a post or the like that isn't there to edit. */
export function renderAdminNotFound(context: AdminPageContext) {
  return renderAdminPage(context, <Heading>{getAdminT()('table.noItems')}</Heading>, {
    status: 404,
  });
}

/** Goes where a save or a delete said to, as a GET. */
export const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

/** Back to the list a form was posted from, as it was: its page, search and filters. */
export const backToList = (url: URL) => createRedirectResponse(`${url.pathname}${url.search}`, 303);
