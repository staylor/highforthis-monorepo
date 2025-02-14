import { useTranslation } from 'react-i18next';

import type { AdminRouteGroup } from '~/types';

const useRouteConfig = () => {
  const { t } = useTranslation();
  const routeConfig: AdminRouteGroup[] = [
    [
      {
        path: '/',
        label: t('settings.dashboard.label'),
        dashicon: 'dashboard',
      },
    ],
    [
      {
        path: '/post',
        label: t('posts.heading'),
        dashicon: 'admin-post',
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
        dashicon: 'admin-media',
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
        dashicon: 'video-alt',
      },
      {
        path: '/show',
        label: t('shows.heading'),
        dashicon: 'calendar',
        routes: [
          {
            path: '/show',
            label: t('shows.all'),
          },
          {
            path: '/show/add',
            label: t('nav.addNew'),
          },
        ],
      },
      {
        path: '/podcast',
        label: t('podcasts.heading'),
        dashicon: 'microphone',
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
        dashicon: 'tag',
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
        dashicon: 'tag',
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
        dashicon: 'admin-users',
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
        path: '/settings',
        label: t('settings.label'),
        dashicon: 'admin-settings',
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
