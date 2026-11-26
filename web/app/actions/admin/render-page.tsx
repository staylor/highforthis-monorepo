import type { RemixNode } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';

import { loadRootData, titleTemplate } from '#/actions/render-page.tsx';
import {
  isRedirect,
  type FlagArgs,
  type FormArgs,
  type RedirectResult,
  type SaveFailure,
} from '#/lib/admin/forms.ts';
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

/** The same, for an edit page, whose route has the ID of what it edits. */
export type AdminEditContext = AdminContext & { params: { id: string } };

export async function renderAdminPage(
  context: AdminPageContext,
  page: RemixNode,
  options: AdminPageOptions = {}
) {
  const { siteSettings } = await loadRootData(context);
  const t = getAdminT();
  const admin = { t, url: context.url, siteUrl: siteSettings?.siteUrl || '/' };
  const title = titleTemplate(
    options.title ? t('admin.titleOf', { title: options.title }) : t('admin.title'),
    siteSettings
  );
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
const backToList = (url: URL) => createRedirectResponse(`${url.pathname}${url.search}`, 303);

/**
 * An add or edit page's actions: the form, and its post, which goes where the save says or shows
 * the form again with what was entered. The save gets the form with the route's params, such as
 * an edit page's `id`.
 */
export function formActions<Context extends AdminContext & { params: object }>(
  page: (context: Context, failure?: SaveFailure) => Promise<Response>,
  save: (args: FormArgs & Context['params']) => Promise<RedirectResult | SaveFailure>
) {
  return {
    index: (context: Context) => page(context),
    async action(context: Context) {
      const formData = await context.request.formData();
      const result = await save({
        ...context.params,
        gql: context.admin.gql,
        formData,
        url: context.url,
      });
      return isRedirect(result) ? backTo(result) : page(context, result);
    },
  };
}

/**
 * A list page's post. The row and bulk delete forms post intent=delete, and a row's boxes post the
 * field they save as the intent, with fetch, which only needs to hear whether it saved. Apply with
 * no action chosen posts an empty intent and just comes back to the list.
 */
export function listAction(
  remove: (args: FormArgs) => Promise<RedirectResult>,
  toggles?: { flags: readonly string[]; save: (args: FlagArgs) => Promise<boolean> }
) {
  return async (context: AdminContext) => {
    const formData = await context.request.formData();
    const intent = formData.get('intent');
    const { gql } = context.admin;
    if (intent === 'delete') {
      return backTo(await remove({ gql, formData, url: context.url }));
    }
    const flag = toggles?.flags.find((name) => name === intent);
    if (toggles && flag) {
      const saved = await toggles.save({ gql, formData, flag });
      return new Response(null, { status: saved ? 204 : 500 });
    }
    return backToList(context.url);
  };
}
