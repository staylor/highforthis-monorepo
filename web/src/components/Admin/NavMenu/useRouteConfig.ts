import { useMatches } from '@remix-run/react';

import type { AdminRouteGroup, AdminTopLevelRoute } from '@/types';
import type { AdminQuery } from '@/types/graphql';

const useRouteConfig = () => {
  const matches = useMatches();
  const admin = matches.find((match) => (match.handle as RouteHandle)?.layout === 'admin');
  const taxonomies = (admin?.data as AdminQuery).taxonomies?.edges.map(({ node }) => node) || [];
  const taxRoutes = taxonomies.map((taxonomy) => ({
    path: `/term/${taxonomy.id}`,
    label: taxonomy.plural,
    dashicon: 'tag',
    routes: [
      {
        path: `/term/${taxonomy.id}`,
        label: `All ${taxonomy.plural}`,
      },
      {
        path: `/term/${taxonomy.id}/add`,
        label: 'Add New',
      },
    ],
  }));

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
        path: '/taxonomy',
        label: 'Taxonomies',
        dashicon: 'category',
        routes: [
          {
            path: '/taxonomy',
            label: 'All Taxonomies',
          },
          {
            path: '/taxonomy/add',
            label: 'Add New',
          },
        ],
      },
      ...(taxRoutes as AdminTopLevelRoute[]),
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
