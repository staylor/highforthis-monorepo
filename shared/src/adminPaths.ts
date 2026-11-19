/**
 * Admin paths that web renders itself instead of forwarding them to the admin app. The admin
 * app's links to them load the page in full, since its client router can't render them.
 */
const adminPathsServedByWeb: readonly string[] = [
  '/admin/user',
  '/admin/artist',
  '/admin/venue',
  '/admin/podcast',
  // The featured media picker's data, for the sections above
  '/admin/media-picker',
];

export function isServedByWeb(pathname: string, paths = adminPathsServedByWeb): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
