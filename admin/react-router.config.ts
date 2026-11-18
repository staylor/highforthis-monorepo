import type { Config } from '@react-router/dev/config';
export default {
  appDirectory: 'src',
  splitRouteModules: true,
  // Every admin route is in the first page's manifest, so the browser never requests
  // /__manifest, which the public site answers on the shared domain.
  routeDiscovery: { mode: 'initial' },
  future: {
    // Scan every route for dependencies at startup. Without this, Vite finds
    // them on the first page load, re-bundles, and the browser's in-flight
    // requests fail with "504 (Outdated Optimize Dep)".
    unstable_optimizeDeps: true,
  },
} satisfies Config;
