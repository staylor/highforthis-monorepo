import { describe, expect, it } from 'vitest';

import { getOpenObserveRumConfig } from '../rum.server';

describe('openobserve RUM configuration', () => {
  it('is disabled when no RUM variables are set', () => {
    expect(getOpenObserveRumConfig({})).toBeUndefined();
  });

  it('builds a safe browser configuration', () => {
    expect(
      getOpenObserveRumConfig({
        OPENOBSERVE_RUM_APPLICATION_ID: 'highforthis-web',
        OPENOBSERVE_RUM_CLIENT_TOKEN: 'client-token',
        OPENOBSERVE_RUM_SITE: 'http://localhost:5080/api/default',
        NODE_ENV: 'test',
      })
    ).toEqual({
      applicationId: 'highforthis-web',
      clientToken: 'client-token',
      site: 'localhost:5080',
      organizationIdentifier: 'default',
      service: 'web',
      environment: 'test',
      version: '1.0.0',
      insecureHTTP: true,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      traceSampleRate: 100,
    });
  });

  it('requires all core variables when RUM is configured', () => {
    expect(() =>
      getOpenObserveRumConfig({
        OPENOBSERVE_RUM_APPLICATION_ID: 'highforthis-web',
      })
    ).toThrow('OpenObserve RUM is missing OPENOBSERVE_RUM_CLIENT_TOKEN, OPENOBSERVE_RUM_SITE');
  });

  it('validates sampling rates', () => {
    expect(() =>
      getOpenObserveRumConfig({
        OPENOBSERVE_RUM_APPLICATION_ID: 'highforthis-web',
        OPENOBSERVE_RUM_CLIENT_TOKEN: 'client-token',
        OPENOBSERVE_RUM_SITE: 'openobserve.example.com',
        OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE: '101',
      })
    ).toThrow('OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE must be a number between 0 and 100');
  });
});
