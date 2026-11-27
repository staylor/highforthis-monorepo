// Starting the analytics SDKs. It runs in a browser (`pnpm test:browser`), since the SDKs load as
// scripts and name views for the page's location.
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import type { OpenObserveRumConfig } from '#/lib/rum.ts';

import { sdkGlobals, startRum } from './rum.ts';

// The SDK bundles load as this script, which does nothing: each test puts stand-ins for the SDKs
// in their globals itself
const emptyScript = URL.createObjectURL(new Blob([''], { type: 'text/javascript' }));

const config: OpenObserveRumConfig = {
  scripts: { rum: emptyScript, logs: emptyScript },
  applicationId: 'application',
  clientToken: 'token',
  site: 'openobserve.example',
  organizationIdentifier: 'default',
  service: 'web',
  environment: 'test',
  version: '1',
  insecureHTTP: false,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 0,
  traceSampleRate: 0,
};

/** Stand-ins for the SDKs. The RUM one keeps the names of the views it's asked to start. */
function standInSdks(t: TestContext) {
  const views: string[] = [];
  window[sdkGlobals.rum] = {
    init() {},
    startView: ({ name }: { name: string }) => views.push(name),
    startSessionReplayRecording() {},
  } as unknown as Window['O2_RUM'];
  window[sdkGlobals.logs] = { init() {} } as unknown as Window['O2_LOGS'];
  t.after(() => {
    delete window[sdkGlobals.rum];
    delete window[sdkGlobals.logs];
  });
  return views;
}

describe('startRum', () => {
  it('starts a view of the page the visit started on', async (t) => {
    const views = standInSdks(t);

    await startRum(config, window.location.pathname);

    assert.deepEqual(views, [window.location.pathname]);
  });

  // The SDKs start once the page has loaded and the browser is idle, which can be after a click
  it('starts one of the page the visitor has gone on to by then, too', async (t) => {
    const views = standInSdks(t);

    await startRum(config, '/post/the-first-page');

    assert.deepEqual(views, ['/post/the-first-page', window.location.pathname]);
  });
});
