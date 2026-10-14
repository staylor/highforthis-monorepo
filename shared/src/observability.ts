import { metrics } from '@opentelemetry/api';
import { logs } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { RouterInstrumentation } from '@opentelemetry/instrumentation-router';
import { RuntimeNodeInstrumentation } from '@opentelemetry/instrumentation-runtime-node';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import {
  detectResources,
  envDetector,
  hostDetector,
  processDetector,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
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

  const resource = detectResources({
    detectors: [envDetector, hostDetector, processDetector],
  }).merge(
    resourceFromAttributes({
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
        process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV ?? 'development',
      [ATTR_SERVICE_INSTANCE_ID]:
        process.env.RAILWAY_REPLICA_ID ?? process.env.HOSTNAME ?? String(process.pid),
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_NAMESPACE]: 'highforthis',
      [ATTR_SERVICE_VERSION]: serviceVersion,
    })
  );

  // NodeSDK and auto-instrumentations-node load every exporter and 41 instrumentations,
  // about 24 MB of RSS per process; these are the only ones the apps use.
  const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
  });
  tracerProvider.register();

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: positiveInteger(process.env.OTEL_METRIC_EXPORT_INTERVAL, 60_000),
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter() })],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new UndiciInstrumentation(),
      // Express 5 is imported from ESM, which require-hooks can't patch; its router is required.
      new RouterInstrumentation(),
      new GraphQLInstrumentation({ ignoreTrivialResolveSpans: true, mergeItems: true }),
      new PgInstrumentation(),
      new RuntimeNodeInstrumentation(),
    ],
  });

  let shutdownPromise: Promise<void> | undefined;
  const shutdown = (): Promise<void> => {
    shutdownPromise ??= Promise.all([
      tracerProvider.shutdown(),
      meterProvider.shutdown(),
      loggerProvider.shutdown(),
    ]).then(() => undefined);
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
