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

// Marks the page once its client entries have hydrated, which the end-to-end tests wait for:
// until then, their buttons and selects do nothing. A navigation in place renders the next page
// into this document and settles once its client entries have hydrated, so the mark comes off
// when one starts and goes back on when it settles.
const root = document.documentElement;
const markHydrated = () => root.setAttribute('data-hydrated', '');
app
  .ready()
  .then(markHydrated)
  .catch((error) => console.error('Client entries failed to hydrate', error));
window.navigation?.addEventListener('navigate', () => root.removeAttribute('data-hydrated'));
window.navigation?.addEventListener('navigatesuccess', markHydrated);
window.navigation?.addEventListener('navigateerror', markHydrated);

// The analytics SDKs weigh more than the site's own scripts, so they load once the page has and
// the browser is idle, rather than compete with the page for the network and the main thread. The
// first view is still timed from the start of the visit, from the timings the browser keeps.
const rumConfig = window.__OPENOBSERVE_RUM__;
if (rumConfig) {
  const firstPath = window.location.pathname;
  const start = () => {
    import('./rum.ts')
      .then(({ startRum }) => startRum(rumConfig, firstPath))
      .catch((error) => console.error('OpenObserve RUM failed to start', error));
  };
  // Not every browser has requestIdleCallback
  const startWhenIdle = () =>
    'requestIdleCallback' in window
      ? requestIdleCallback(start, { timeout: 2000 })
      : setTimeout(start, 0);
  if (document.readyState === 'complete') {
    startWhenIdle();
  } else {
    window.addEventListener('load', startWhenIdle, { once: true });
  }
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
