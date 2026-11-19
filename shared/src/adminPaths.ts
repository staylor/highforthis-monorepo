/**
 * Admin paths that the public site's server (web) renders itself. The admin is moving to Remix
 * 3 one section at a time, inside web (see admin/REMIX3-MIGRATION.md). Web stops forwarding
 * these paths to the admin app, and the admin's links to them load the page in full, since the
 * admin's client router can't render them.
 *
 * A section moves by adding its routes to web and its path here, such as '/admin/user'.
 */
const adminPathsServedByWeb: readonly string[] = [];

/** Whether web renders this admin path: one of the paths above, or a page under one. */
export function isServedByWeb(pathname: string, paths = adminPathsServedByWeb): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
