import { run } from 'remix/component';
import {
  detectMultipleImportMapSupport,
  importModule,
  preloadShim,
} from 'remix/multiple-import-maps-polyfill';

const app = run({
  async loadModule(moduleUrl, exportName) {
    const mod = await importModule(moduleUrl);
    const Component = mod[exportName];
    if (typeof Component !== 'function') {
      throw new Error(`Unknown component: ${moduleUrl}#${exportName}`);
    }
    return Component;
  },
  async processClientEntryPreloads(preloads) {
    if (await detectMultipleImportMapSupport()) return preloads;

    preloadShim(preloads);
    return [];
  },
});

const rumConfig = window.__OPENOBSERVE_RUM__;
if (rumConfig) {
  import('./rum.ts')
    .then(({ startRum }) => startRum(rumConfig))
    .catch((error) => console.error('OpenObserve RUM failed to start', error));
}

if (import.meta.hot) {
  import.meta.hot.on('server:update', async () => {
    try {
      await app.ready();
      await app.frames.top.reload();
    } catch (error) {
      console.error('Error reloading top frame on server update', error);
    }
  });
}
