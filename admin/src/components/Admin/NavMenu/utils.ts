import type { AdminRoute, AdminTopLevelRoute } from '#/types';

/** Absolute path for a nav entry — external links are passed through untouched. */
export const adminPath = (route: AdminRoute) => {
  if (!route.path.startsWith('/')) {
    return route.path;
  }
  return route.path === '/' ? '/admin' : `/admin${route.path}`;
};

/** A top level entry is active when it — or one of its children — is the current route. */
export const isRouteActive = (item: AdminTopLevelRoute, pathname: string) => {
  if (item.external) {
    return false;
  }
  const path = adminPath(item);
  return path === pathname || (path !== '/admin' && pathname.startsWith(`${path}/`));
};
