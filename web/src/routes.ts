import { type RouteConfig, route, index, prefix } from '@react-router/dev/routes';

const adminRoutes = (slug: string) =>
  prefix(slug, [
    index(`routes/admin/${slug}/index.tsx`),
    route(`add`, `routes/admin/${slug}/add.tsx`),
    route(`page/:page`, `routes/admin/${slug}/page.tsx`),
    route(`:id`, `routes/admin/${slug}/edit.tsx`),
  ]);

export default [
  index('routes/home/index.tsx'),
  route('admin', 'routes/admin/layout.tsx', [
    index('routes/admin/index.tsx'),
    ...adminRoutes('artist'),
    ...prefix('media', [
      index('routes/admin/media/index.tsx'),
      route('upload', 'routes/admin/media/upload.tsx'),
      route('page/:page', 'routes/admin/media/page.tsx'),
      route(':id', 'routes/admin/media/edit.tsx'),
    ]),
    ...adminRoutes('podcast'),
    ...adminRoutes('post'),
    ...prefix('settings', [
      route('dashboard', 'routes/admin/settings/dashboard.tsx'),
      route('media', 'routes/admin/settings/media.tsx'),
      route('podcast', 'routes/admin/settings/podcast.tsx'),
      route('site?', 'routes/admin/settings/site.tsx'),
    ]),
    ...adminRoutes('show'),
    ...adminRoutes('user'),
    ...adminRoutes('venue'),
    ...prefix('video', [
      index('routes/admin/video/index.tsx'),
      route('page/:page', 'routes/admin/video/page.tsx'),
      route(':id', 'routes/admin/video/edit.tsx'),
    ]),
  ]),
  route('artist/:slug', 'routes/artist.tsx'),
  route('login', 'routes/login/layout.tsx', [route(':error?', 'routes/login/index.tsx')]),
  ...prefix('modals', [
    route('media/:type/:cursor?', 'routes/modals/media.tsx'),
    route('video/:cursor?', 'routes/modals/video.tsx'),
  ]),
  route('oembed', 'routes/oembed.tsx'),
  route('podcast.xml', 'routes/podcast/xml/loader.tsx'),
  route('podcast/:id', 'routes/podcast/podcast.tsx'),
  route('podcast', 'routes/podcast/index.tsx'),
  route('post/:slug', 'routes/post/post.tsx'),
  ...prefix('shows', [
    index('routes/shows/index.tsx'),
    route('history/:year?', 'routes/shows/history.tsx'),
    route('list', 'routes/shows/list.tsx'),
    route('stats/:entity', 'routes/shows/entity.tsx'),
    route(':id', 'routes/shows/show.tsx'),
  ]),
  route('sphere', 'routes/sphere/index.tsx'),
  route('venue/:slug', 'routes/venue.tsx'),
  route('video/:slug', 'routes/videos/video.tsx'),
  route('videos/:year', 'routes/videos/year.tsx'),
  route('videos', 'routes/videos/index.tsx'),
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
