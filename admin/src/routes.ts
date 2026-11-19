import { type RouteConfig, route, index, prefix } from '@react-router/dev/routes';

const adminRoutes = (slug: string) =>
  prefix(slug, [
    index(`routes/admin/${slug}/index.tsx`),
    route(`add`, `routes/admin/${slug}/add.tsx`),
    route(`:id`, `routes/admin/${slug}/edit.tsx`),
  ]);

export default [
  route('admin', 'routes/admin/layout.tsx', [
    index('routes/admin/index.tsx'),
    route('logout', 'routes/admin/logout.ts'),
    ...prefix('passkeys', [
      index('routes/admin/passkeys/index.tsx'),
      route('options', 'routes/admin/passkeys/options.ts'),
      route('verify', 'routes/admin/passkeys/verify.ts'),
    ]),
    ...adminRoutes('post'),
  ]),
  route('login', 'routes/login/layout.tsx', [route(':error?', 'routes/login/index.tsx')]),
  ...prefix('modals', [
    route('media/:type/:cursor?', 'routes/modals/media.tsx'),
    route('video/:cursor?', 'routes/modals/video.tsx'),
  ]),
] satisfies RouteConfig;
