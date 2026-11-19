const isAdminPath = (href: string) => href === '/admin' || href.startsWith('/admin/');

/**
 * For a link's `data-rmx-document`: links out of the admin, such as to a post on the public site,
 * load in full. Remix's client navigation would merge the public page into the admin's document,
 * which has other styles and scripts.
 */
export const documentLoad = (href: string) => !isAdminPath(href) || undefined;
