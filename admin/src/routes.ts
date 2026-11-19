import { type RouteConfig, route, index, prefix } from '@react-router/dev/routes';

export default [
  route('admin', 'routes/admin/layout.tsx', [
    index('routes/admin/index.tsx'),
    route('logout', 'routes/admin/logout.ts'),
    ...prefix('passkeys', [
      index('routes/admin/passkeys/index.tsx'),
      route('options', 'routes/admin/passkeys/options.ts'),
      route('verify', 'routes/admin/passkeys/verify.ts'),
    ]),
  ]),
  route('login', 'routes/login/layout.tsx', [route(':error?', 'routes/login/index.tsx')]),
] satisfies RouteConfig;
