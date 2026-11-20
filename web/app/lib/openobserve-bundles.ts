import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';

// The OpenObserve browser SDKs ship prebuilt bundles that set window.O2_RUM and
// window.O2_LOGS. The browser loads those instead of the SDKs' ES modules, which the asset
// server would send as about 275 separate files, each with an import map entry on every
// page. The SDK version is in the URL, so the files can be cached for good.

const require = createRequire(import.meta.url);

function bundle(name: 'rum' | 'logs') {
  const packageJson = require.resolve(`@openobserve/browser-${name}/package.json`);
  const { version } = require(packageJson) as { version: string };
  return {
    dir: join(dirname(packageJson), 'bundle'),
    base: `/vendor/openobserve-${name}@${version}`,
    file: `openobserve-${name}.js`,
  };
}

const bundles = [bundle('rum'), bundle('logs')];

/** Served URL path to file path, for each bundle and the chunks it loads on demand. */
export const openObserveBundleFiles = new Map<string, string>();
for (const { dir, base } of bundles) {
  for (const entry of readdirSync(dir, { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.js')) {
      const path = join(entry.parentPath, entry.name);
      openObserveBundleFiles.set(`${base}/${relative(dir, path).split(sep).join('/')}`, path);
    }
  }
}

/** Where the browser loads each SDK bundle from. */
export const openObserveScripts = {
  rum: `${bundles[0].base}/${bundles[0].file}`,
  logs: `${bundles[1].base}/${bundles[1].file}`,
};
