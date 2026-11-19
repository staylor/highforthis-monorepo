import { createAssetServer, type ModuleLoader } from 'remix/assets';
import { componentHmr } from 'remix/component-hmr/assets';

const rootDir = process.cwd();
const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDevelopment = nodeEnv === 'development';
const isProduction = nodeEnv === 'production';
const isHmr = Boolean(isDevelopment && process.env.REMIX_NODE_HMR);

// Lexical's packages, for the post editor (app/ui/admin/public/editor). Only its pages load them.
const lexicalPackages = [
  'lexical',
  '@lexical/a11y',
  '@lexical/clipboard',
  '@lexical/code-core',
  '@lexical/dragon',
  '@lexical/extension',
  '@lexical/history',
  '@lexical/html',
  '@lexical/list',
  '@lexical/rich-text',
  '@lexical/selection',
  '@lexical/utils',
  // What @lexical/extension imports, at the version it asks for
  '@preact/signals-core',
];

const lexicalEntry = /\/(?:lexical|@lexical\/[\w-]+)\/dist\/[^/]+\.js$/;

/**
 * Each Lexical package's entry imports both its dev and prod builds and picks one with
 * process.env.NODE_ENV. Without a bundler to drop the other, the browser would download both, so
 * in production this removes the dev build's import. The compiler has already folded the
 * NODE_ENV check, so nothing reads the binding.
 */
const dropLexicalDevBuilds: ModuleLoader = (url, context, nextLoad) => {
  const result = nextLoad(url, context);
  if (!lexicalEntry.test(url)) {
    return result;
  }
  const source = String(result.source)
    .replace(
      /import\s*\*\s*as\s+(\w+)\s+from\s*["']\.\/[^"']+\.dev\.js["'];?/g,
      'const $1 = undefined;'
    )
    .replace(/import\s*["']\.\/[^"']+\.dev\.js["'];?/g, '');
  return { ...result, source };
};

export const assets = createAssetServer({
  basePath: '/assets',
  rootDir,
  allowFiles: ['app/routes.ts', 'app/**/public/**'],
  // Every npm package that browser code imports, including transitive ones, must be
  // listed, and (under pnpm) be a direct dependency so it resolves from the app root. Each
  // module served gets an import map entry on every page, so large libraries are better
  // loaded as prebuilt bundles, as the OpenObserve SDKs are (lib/openobserve-bundles.ts).
  allowPackages: ['remix', '@simplewebauthn/browser', ...lexicalPackages],
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
    loaders: isHmr ? [componentHmr()] : isProduction ? [dropLexicalDevBuilds] : undefined,
    // Some packages' ESM entries branch on process.env.NODE_ENV, which browsers don't have.
    define: { 'process.env.NODE_ENV': JSON.stringify(nodeEnv) },
  },
});

export const scriptEntry = await assets.getScriptEntry('app/actions/public/entry.ts');

// Each page's global stylesheets: base.css, then the site's or the admin's. Components style
// themselves with css(), which Remix renders into the page.
const baseStylesheet = await assets.getHref('app/styles/public/base.css');
export const stylesheetHrefs = {
  site: [baseStylesheet, await assets.getHref('app/styles/public/site.css')],
  admin: [baseStylesheet, await assets.getHref('app/styles/public/admin.css')],
};
