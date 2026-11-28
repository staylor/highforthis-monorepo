import type { openobserveLogs } from '@openobserve/browser-logs';
import type { openobserveRum } from '@openobserve/browser-rum';

import type { OpenObserveRumConfig } from '#/lib/rum.ts';

import type { trackViews } from './rum-views.ts';

// The SDKs are loaded as their prebuilt bundles (see lib/openobserve-bundles.ts), which set
// these globals. Only their types are imported, so the asset server never serves the SDKs'
// own modules.
declare global {
  interface Window {
    O2_RUM?: typeof openobserveRum;
    O2_LOGS?: typeof openobserveLogs;
  }
}

/** The globals the SDK bundles set, which startRum reads once they load. */
export const sdkGlobals = { rum: 'O2_RUM', logs: 'O2_LOGS' } as const;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}

// Remix navigates with the browser's Navigation API rather than history.pushState, which the
// RUM SDK watches to start views. So views are started here: one for the page the visit started
// on and one after each navigation, which is what the admin dashboard counts as page views.
export async function startRum(config: OpenObserveRumConfig, views: ReturnType<typeof trackViews>) {
  await Promise.all([loadScript(config.scripts.rum), loadScript(config.scripts.logs)]);
  const rum = window[sdkGlobals.rum];
  const logs = window[sdkGlobals.logs];
  if (!rum || !logs) {
    throw new Error('The OpenObserve SDK bundles loaded without setting their globals');
  }

  const commonOptions = {
    clientToken: config.clientToken,
    site: config.site,
    organizationIdentifier: config.organizationIdentifier,
    service: config.service,
    env: config.environment,
    version: config.version,
    apiVersion: 'v1',
    insecureHTTP: config.insecureHTTP,
  };

  rum.init({
    ...commonOptions,
    applicationId: config.applicationId,
    sessionSampleRate: config.sessionSampleRate,
    sessionReplaySampleRate: config.sessionReplaySampleRate,
    traceSampleRate: config.traceSampleRate,
    allowedTracingUrls: [window.location.origin],
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    trackViewsManually: true,
    defaultPrivacyLevel: 'mask-user-input',
  });

  logs.init({
    ...commonOptions,
    sessionSampleRate: config.sessionSampleRate,
    forwardErrorsToLogs: true,
  });

  if (config.sessionReplaySampleRate > 0) {
    rum.startSessionReplayRecording();
  }

  views.start((name) => rum.startView({ name }));
}
