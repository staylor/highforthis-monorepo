import { openobserveLogs } from '@openobserve/browser-logs';
import { openobserveRum } from '@openobserve/browser-rum';

import type { OpenObserveRumConfig } from './rum';

let initialized = false;

export function initializeOpenObserveRum(config: OpenObserveRumConfig) {
  if (initialized) {
    return;
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

  initialized = true;
}
