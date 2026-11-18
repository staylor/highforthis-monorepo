import { createAssetServer } from 'remix/assets';
import { componentHmr } from 'remix/component-hmr/assets';

const rootDir = process.cwd();
const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,
  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  // Every npm package that browser code imports, including transitive ones, must be
  // listed, and (under pnpm) be a direct dependency so it resolves from the app root. Each
  // module served gets an import map entry on every page, so large libraries are better
  // loaded as prebuilt bundles, as the OpenObserve SDKs are (lib/openobserve-bundles.ts).
  allowPackages: ['remix'],
  denyFiles: ['app/**/*.test.*'],
  sourceMaps: isDevelopment ? 'external' : undefined,
  minify: !isDevelopment,
  fingerprint: isProduction,
  watch: isDevelopment,
  hmr: isHmr
    ? {
        channel: async () => (await import('remix/node-hmr/runtime')).createBrowserHmrChannel(),
        moduleImporter: 'remix/multiple-import-maps-polyfill',
      }
    : undefined,
  scripts: {
    loaders: isHmr ? [componentHmr()] : undefined,
    // Some packages' ESM entries branch on process.env.NODE_ENV, which browsers don't have.
    define: { 'process.env.NODE_ENV': JSON.stringify(nodeEnv) },
  },
});

export const scriptEntry = await assets.getScriptEntry('app/actions/public/entry.ts');

// Built by the Tailwind CLI (`pnpm css`), then served and fingerprinted by the asset server.
export const stylesheetHref = await assets.getHref('app/styles/public/main.css');
