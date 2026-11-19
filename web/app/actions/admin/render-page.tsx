import type { RemixNode } from 'remix/component';

import { getAdminT } from '../../lib/i18n.ts';
import type { AppContext } from '../../router.ts';
import { loadRootData, titleTemplate } from '../render-page.tsx';

import { AdminDocument } from './document.tsx';

interface AdminPageOptions {
  /** The page's title, shown before "Admin" and the site's name. */
  title?: string;
  status?: number;
}

/** Renders an admin page in the admin's document and layout. */
export async function renderAdminPage(
  context: AppContext,
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
    <AdminDocument admin={admin} title={title}>
      {page}
    </AdminDocument>,
    { status: options.status }
  );
}
