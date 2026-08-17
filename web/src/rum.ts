export interface OpenObserveRumConfig {
  applicationId: string;
  clientToken: string;
  site: string;
  organizationIdentifier: string;
  service: string;
  environment: string;
  version: string;
  insecureHTTP: boolean;
  sessionSampleRate: number;
  sessionReplaySampleRate: number;
  traceSampleRate: number;
}

declare global {
  interface Window {
    __OPENOBSERVE_RUM__?: OpenObserveRumConfig;
  }
}
