import type { AdminRouteGroup } from '~/types';

const useRouteConfig = () => {
  const routeConfig: AdminRouteGroup[] = [
    [
      {
        path: '/',
        label: 'Dashboard',
        dashicon: 'dashboard',
      },
    ],
    [
      {
        path: '/post',
        label: 'Posts',
        dashicon: 'admin-post',
        routes: [
          {
            path: '/post',
            label: 'All Posts',
          },
          {
            path: '/post/add',
            label: 'Add New',
          },
        ],
      },
      {
        path: '/media',
        label: 'Media',
        dashicon: 'admin-media',
        routes: [
          {
            path: '/media',
            label: 'All Media',
          },
          {
            path: '/media/upload',
            label: 'Upload Media',
          },
        ],
      },
    ],
    [
      {
        path: '/video',
        label: 'Videos',
        dashicon: 'video-alt',
      },
      {
        path: '/show',
        label: 'Shows',
        dashicon: 'calendar',
        routes: [
          {
            path: '/show',
            label: 'All Shows',
          },
          {
            path: '/show/add',
            label: 'Add New',
          },
        ],
      },
      {
        path: '/podcast',
        label: 'Podcasts',
        dashicon: 'microphone',
        routes: [
          {
            path: '/podcast',
            label: 'All Podcasts',
          },
          {
            path: '/podcast/add',
            label: 'Add New',
          },
        ],
      },
    ],
    [
      {
        path: '/artist',
        label: 'Artists',
        dashicon: 'tag',
        routes: [
          {
            path: '/artist',
            label: 'All Artists',
          },
          {
            path: '/artist/add',
            label: 'Add New',
          },
        ],
      },
      {
        path: '/venue',
        label: 'Venues',
        dashicon: 'tag',
        routes: [
          {
            path: '/venue',
            label: 'All Venues',
          },
          {
            path: '/venue/add',
            label: 'Add New',
          },
        ],
      },
    ],
    [
      {
        path: '/user',
        label: 'Users',
        dashicon: 'admin-users',
        routes: [
          {
            path: '/user',
            label: 'All Users',
          },
          {
            path: '/user/add',
            label: 'Add User',
          },
        ],
      },
      {
        path: '/settings',
        label: 'Settings',
        dashicon: 'admin-settings',
        routes: [
          {
            path: '/settings/site',
            label: 'General',
          },
          {
            path: '/settings/dashboard',
            label: 'Dashboard',
          },
          {
            path: '/settings/media',
            label: 'Media',
          },
          {
            path: '/settings/podcast',
            label: 'Podcast',
          },
        ],
      },
    ],
  ];
  return routeConfig;
};

export default useRouteConfig;
