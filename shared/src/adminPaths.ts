/**
 * Admin paths that web renders itself instead of forwarding them to the admin app. The admin
 * app's links to them load the page in full, since its client router can't render them.
 */
const adminPathsServedByWeb: readonly string[] = [
  '/admin/user',
  '/admin/artist',
  '/admin/venue',
  '/admin/podcast',
  '/admin/video',
  '/admin/settings',
  '/admin/show',
  // The featured media picker's data, for the sections above
  '/admin/media-picker',
];

/**
 * Pages under the paths above that the admin app still renders, while the rest of their section
 * has moved. Each goes when it moves too.
 */
const adminPathsNotYetMoved: readonly string[] = ['/admin/show/listings'];

const isUnder = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

/**
 * Whether web renders this admin path: one of the paths above, or a page under one, unless it's
 * one of the pages that haven't moved yet.
 */
export function isServedByWeb(
  pathname: string,
  paths = adminPathsServedByWeb,
  notYetMoved = adminPathsNotYetMoved
): boolean {
  return (
    paths.some((path) => isUnder(pathname, path)) &&
    !notYetMoved.some((path) => isUnder(pathname, path))
  );
}
