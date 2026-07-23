import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

export interface ObservabilityOptions {
  serviceName: string;
  serviceVersion?: string;
}

export interface Observability {
  enabled: boolean;
  shutdown: () => Promise<void>;
}

const disabledObservability: Observability = {
  enabled: false,
  shutdown: async () => undefined,
};

let observability: Observability | undefined;

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function startObservability({
  serviceName,
  serviceVersion = process.env.RAILWAY_GIT_COMMIT_SHA ?? '1.0.0',
}: ObservabilityOptions): Observability {
  if (observability) {
    return observability;
  }

  if (process.env.OTEL_SDK_DISABLED === 'true' || !process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    observability = disabledObservability;
    return observability;
  }

  const resource = resourceFromAttributes({
    [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
      process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV ?? 'development',
    [ATTR_SERVICE_INSTANCE_ID]:
      process.env.RAILWAY_REPLICA_ID ?? process.env.HOSTNAME ?? String(process.pid),
    [ATTR_SERVICE_NAME]: serviceName,
    [ATTR_SERVICE_NAMESPACE]: 'highforthis',
    [ATTR_SERVICE_VERSION]: serviceVersion,
  });

  const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-graphql': {
          ignoreTrivialResolveSpans: true,
          mergeItems: true,
        },
        // systeminformation's network probe can emit unhandled EPIPE errors in
        // restricted containers. Railway already exposes host-level metrics.
        '@opentelemetry/instrumentation-host-metrics': { enabled: false },
        '@opentelemetry/instrumentation-pino': { enabled: false },
      }),
    ],
    logRecordProcessors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() })],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: positiveInteger(process.env.OTEL_METRIC_EXPORT_INTERVAL, 60_000),
      }),
    ],
    resource,
    traceExporter: new OTLPTraceExporter(),
  });

  sdk.start();

  let shutdownPromise: Promise<void> | undefined;
  const shutdown = (): Promise<void> => {
    shutdownPromise ??= sdk.shutdown();
    return shutdownPromise;
  };

  observability = { enabled: true, shutdown };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void shutdown().finally(() => process.exit(0));
    });
  }

  return observability;
}
