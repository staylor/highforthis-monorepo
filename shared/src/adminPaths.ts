/**
 * Admin paths that web renders itself instead of forwarding them to the admin app. The admin
 * app's links to them load the page in full, since its client router can't render them.
 */
const adminPathsServedByWeb: readonly string[] = ['/admin/user'];

export function isServedByWeb(pathname: string, paths = adminPathsServedByWeb): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
