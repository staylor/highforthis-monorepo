import type { OpenObserveRumConfig } from './rum';

const requiredVariables = [
  'OPENOBSERVE_RUM_APPLICATION_ID',
  'OPENOBSERVE_RUM_CLIENT_TOKEN',
  'OPENOBSERVE_RUM_SITE',
] as const;

function sampleRate(value: string | undefined, fallback: number, variable: string) {
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error(`${variable} must be a number between 0 and 100`);
  }

  return parsed;
}

function parseSite(value: string) {
  const url = new URL(value.includes('://') ? value : `https://${value}`);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('OPENOBSERVE_RUM_SITE must use HTTP or HTTPS');
  }

  return {
    site: url.host,
    insecureHTTP: url.protocol === 'http:',
  };
}

export function getOpenObserveRumConfig(
  environment: NodeJS.ProcessEnv = process.env
): OpenObserveRumConfig | undefined {
  const configuredVariables = requiredVariables.filter((variable) => environment[variable]?.trim());
  if (configuredVariables.length === 0) {
    return undefined;
  }

  const missingVariables = requiredVariables.filter((variable) => !environment[variable]?.trim());
  if (missingVariables.length > 0) {
    throw new Error(`OpenObserve RUM is missing ${missingVariables.join(', ')}`);
  }

  const { site, insecureHTTP } = parseSite(environment.OPENOBSERVE_RUM_SITE!);

  return {
    applicationId: environment.OPENOBSERVE_RUM_APPLICATION_ID!.trim(),
    clientToken: environment.OPENOBSERVE_RUM_CLIENT_TOKEN!.trim(),
    site,
    organizationIdentifier:
      environment.OPENOBSERVE_RUM_ORGANIZATION_IDENTIFIER?.trim() || 'default',
    service: environment.OPENOBSERVE_RUM_SERVICE?.trim() || 'web',
    environment:
      environment.OPENOBSERVE_RUM_ENVIRONMENT?.trim() ||
      environment.RAILWAY_ENVIRONMENT_NAME?.trim() ||
      environment.NODE_ENV?.trim() ||
      'development',
    version:
      environment.OPENOBSERVE_RUM_VERSION?.trim() ||
      environment.RAILWAY_GIT_COMMIT_SHA?.trim() ||
      '1.0.0',
    insecureHTTP,
    sessionSampleRate: sampleRate(
      environment.OPENOBSERVE_RUM_SESSION_SAMPLE_RATE,
      100,
      'OPENOBSERVE_RUM_SESSION_SAMPLE_RATE'
    ),
    sessionReplaySampleRate: sampleRate(
      environment.OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE,
      20,
      'OPENOBSERVE_RUM_REPLAY_SAMPLE_RATE'
    ),
    traceSampleRate: sampleRate(
      environment.OPENOBSERVE_RUM_TRACE_SAMPLE_RATE,
      100,
      'OPENOBSERVE_RUM_TRACE_SAMPLE_RATE'
    ),
  };
}
