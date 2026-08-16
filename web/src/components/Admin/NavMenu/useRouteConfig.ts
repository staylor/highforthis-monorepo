import { useTranslation } from 'react-i18next';

import type { AdminRouteGroup } from '#/types';
import { useRootData } from '#/utils/rootData';

const useRouteConfig = () => {
  const { siteSettings } = useRootData();
  const { t } = useTranslation();
  const routeConfig: AdminRouteGroup[] = [
    [
      {
        path: '/',
        label: t('settings.dashboard.label'),
        icon: 'dashboard',
      },
      {
        path: `${siteSettings.siteUrl}`,
        label: t('admin.viewSite'),
        icon: 'external',
        external: true,
      },
      {
        path: '/logout',
        label: t('login.logout'),
        icon: 'logout',
      },
    ],
    [
      {
        path: '/post',
        label: t('posts.heading'),
        icon: 'post',
        routes: [
          {
            path: '/post',
            label: t('posts.all'),
          },
          {
            path: '/post/add',
            label: t('nav.addNew'),
          },
        ],
      },
      {
        path: '/media',
        label: t('media.heading'),
        icon: 'media',
        routes: [
          {
            path: '/media',
            label: t('media.all'),
          },
          {
            path: '/media/upload',
            label: t('media.upload'),
          },
        ],
      },
    ],
    [
      {
        path: '/video',
        label: t('videos.heading'),
        icon: 'video',
      },
      {
        path: '/show',
        label: t('shows.heading'),
        icon: 'calendar',
        routes: [
          {
            path: '/show',
            label: t('shows.all'),
          },
          {
            path: '/show/add',
            label: t('nav.addNew'),
          },
          {
            path: '/show/bulk',
            label: t('shows.bulk.nav'),
          },
        ],
      },
      {
        path: '/podcast',
        label: t('podcasts.heading'),
        icon: 'podcast',
        routes: [
          {
            path: '/podcast',
            label: t('podcasts.all'),
          },
          {
            path: '/podcast/add',
            label: t('nav.addNew'),
          },
        ],
      },
    ],
    [
      {
        path: '/artist',
        label: t('artists.heading'),
        icon: 'artist',
        routes: [
          {
            path: '/artist',
            label: t('artists.all'),
          },
          {
            path: '/artist/add',
            label: t('nav.addNew'),
          },
        ],
      },
      {
        path: '/venue',
        label: t('venues.heading'),
        icon: 'venue',
        routes: [
          {
            path: '/venue',
            label: t('venues.all'),
          },
          {
            path: '/venue/add',
            label: t('nav.addNew'),
          },
        ],
      },
    ],
    [
      {
        path: '/user',
        label: t('users.heading'),
        icon: 'users',
        routes: [
          {
            path: '/user',
            label: t('users.all'),
          },
          {
            path: '/user/add',
            label: t('users.add'),
          },
        ],
      },
      {
        path: '/passkeys',
        label: t('passkeys.heading'),
        icon: 'key',
      },
      {
        path: '/settings',
        label: t('settings.label'),
        icon: 'settings',
        routes: [
          {
            path: '/settings/site',
            label: t('settings.site.label'),
          },
          {
            path: '/settings/dashboard',
            label: t('settings.dashboard.label'),
          },
          {
            path: '/settings/media',
            label: t('settings.media.label'),
          },
          {
            path: '/settings/podcast',
            label: t('settings.podcast.label'),
          },
        ],
      },
    ],
  ];
  return routeConfig;
};

export default useRouteConfig;
