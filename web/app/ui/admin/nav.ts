import type { IconName } from './public/icon.tsx';

// Paths are relative to /admin, except the site link, which opens the public site.

export interface NavPage {
  path: string;
  label: string;
}

export interface NavSection extends NavPage {
  icon: IconName;
  /** Opens the public site in a new tab. */
  site?: boolean;
  /** Loads the page in full rather than navigating in place, as signing out does. */
  fullLoad?: boolean;
  pages?: NavPage[];
}

const listAndAdd = (path: string, all: string, add = 'nav.addNew'): NavPage[] => [
  { path, label: all },
  { path: `${path}/add`, label: add },
];

export const adminNav: NavSection[][] = [
  [
    { path: '/', label: 'dashboard.label', icon: 'dashboard' },
    { path: '', label: 'admin.viewSite', icon: 'external', site: true },
    { path: '/logout', label: 'login.logout', icon: 'logout', fullLoad: true },
  ],
  [
    {
      path: '/post',
      label: 'posts.heading',
      icon: 'post',
      pages: listAndAdd('/post', 'posts.all'),
    },
    {
      path: '/media',
      label: 'media.heading',
      icon: 'media',
      pages: [
        { path: '/media', label: 'media.all' },
        { path: '/media/upload', label: 'media.upload' },
        { path: '/media/album-covers', label: 'media.albumCovers.heading' },
      ],
    },
  ],
  [
    { path: '/video', label: 'videos.heading', icon: 'video' },
    {
      path: '/show',
      label: 'shows.heading',
      icon: 'calendar',
      pages: [
        ...listAndAdd('/show', 'shows.all'),
        { path: '/show/bulk', label: 'shows.bulk.nav' },
        { path: '/show/listings', label: 'shows.listings.nav' },
      ],
    },
    {
      path: '/podcast',
      label: 'podcasts.heading',
      icon: 'podcast',
      pages: listAndAdd('/podcast', 'podcasts.all'),
    },
  ],
  [
    {
      path: '/artist',
      label: 'artists.heading',
      icon: 'artist',
      pages: listAndAdd('/artist', 'artists.all'),
    },
    {
      path: '/venue',
      label: 'venues.heading',
      icon: 'venue',
      pages: listAndAdd('/venue', 'venues.all'),
    },
  ],
  [
    {
      path: '/user',
      label: 'users.heading',
      icon: 'users',
      pages: listAndAdd('/user', 'users.all', 'users.add'),
    },
    { path: '/passkeys', label: 'passkeys.heading', icon: 'key' },
    {
      path: '/settings',
      label: 'settings.label',
      icon: 'settings',
      pages: [
        { path: '/settings/site', label: 'settings.site.label' },
        { path: '/settings/media', label: 'settings.media.label' },
        { path: '/settings/podcast', label: 'settings.podcast.label' },
      ],
    },
  ],
];

export const adminHref = (path: string) => (path === '/' ? '/admin' : `/admin${path}`);

export function isSectionActive(section: NavSection, pathname: string): boolean {
  if (section.site) {
    return false;
  }
  const href = adminHref(section.path);
  return pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`));
}
