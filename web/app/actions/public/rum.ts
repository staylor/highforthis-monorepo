import { openobserveLogs } from '@openobserve/browser-logs';
import { openobserveRum } from '@openobserve/browser-rum';

import type { OpenObserveRumConfig } from '../../lib/rum.ts';

// Remix navigates with the browser's Navigation API rather than history.pushState, which the
// RUM SDK watches to start views. So views are started here: one on load and one after each
// navigation, which is what the admin dashboard counts as page views.
export function startRum(config: OpenObserveRumConfig) {
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

  openobserveRum.init({
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

  openobserveLogs.init({
    ...commonOptions,
    sessionSampleRate: config.sessionSampleRate,
    forwardErrorsToLogs: true,
  });

  if (config.sessionReplaySampleRate > 0) {
    openobserveRum.startSessionReplayRecording();
  }

  const startView = () => openobserveRum.startView({ name: window.location.pathname });
  startView();
  (window as Window & { navigation?: EventTarget }).navigation?.addEventListener(
    'navigatesuccess',
    startView
  );
}
