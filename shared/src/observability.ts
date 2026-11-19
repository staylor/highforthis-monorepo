import { context, logs, metrics, propagation, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
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
import { BatchSpanProcessor, TracerProvider } from '@opentelemetry/sdk-trace';
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_INSTANCE_ID,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_NAMESPACE,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';

interface ObservabilityOptions {
  serviceName: string;
  serviceVersion?: string;
}

interface Observability {
  enabled: boolean;
  shutdown: () => Promise<void>;
}

const disabledObservability: Observability = {
  enabled: false,
  shutdown: async () => undefined,
};

let observability: Observability | undefined;

// OpenObserve takes Basic auth. A Railway variable can reference its credentials but can't
// base64-encode them into OTEL_EXPORTER_OTLP_HEADERS, so when that isn't set, build the
// header from OPENOBSERVE_USER and OPENOBSERVE_PASSWORD.
function openObserveHeaders(): Record<string, string> | undefined {
  const user = process.env.OPENOBSERVE_USER;
  const password = process.env.OPENOBSERVE_PASSWORD;
  if (process.env.OTEL_EXPORTER_OTLP_HEADERS || !user || !password) {
    return undefined;
  }

  return { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}` };
}

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

  const headers = openObserveHeaders();

  // NodeSDK and auto-instrumentations-node load every exporter and 41 instrumentations,
  // about 24 MB of RSS per process; these are the only ones the apps use.
  // Spans follow async work within a process, and W3C trace context and baggage headers carry
  // them between services
  context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
    })
  );
  const tracerProvider = new TracerProvider({
    resource,
    spanProcessors: [new BatchSpanProcessor({ exporter: new OTLPTraceExporter({ headers }) })],
  });
  trace.setGlobalTracerProvider(tracerProvider);

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({ headers }),
        exportIntervalMillis: positiveInteger(process.env.OTEL_METRIC_EXPORT_INTERVAL, 60_000),
      }),
    ],
  });
  metrics.setGlobalMeterProvider(meterProvider);

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [new BatchLogRecordProcessor({ exporter: new OTLPLogExporter({ headers }) })],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new UndiciInstrumentation(),
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
