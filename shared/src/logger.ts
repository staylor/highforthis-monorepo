import { randomUUID } from 'node:crypto';

import { context, isSpanContextValid, trace } from '@opentelemetry/api';
import { logs, SeverityNumber, type AnyValue, type AnyValueMap } from '@opentelemetry/api-logs';
import pino, { type DestinationStream, type Logger, type LoggerOptions as PinoOptions } from 'pino';
import { pinoHttp, type HttpLogger } from 'pino-http';

export interface LoggerOptions {
  serviceName: string;
}

const severityByLevel: Record<number, SeverityNumber> = {
  10: SeverityNumber.TRACE,
  20: SeverityNumber.DEBUG,
  30: SeverityNumber.INFO,
  40: SeverityNumber.WARN,
  50: SeverityNumber.ERROR,
  60: SeverityNumber.FATAL,
};

const severityTextByLevel: Record<number, string> = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL',
};

function toAnyValue(value: unknown): AnyValue {
  if (
    value === undefined ||
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(toAnyValue);
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, toAnyValue(nestedValue)])
    );
  }

  return String(value);
}

function createOpenTelemetryStream(serviceName: string): DestinationStream {
  const otelLogger = logs.getLogger(serviceName);

  return {
    write(message) {
      try {
        const record = JSON.parse(message) as Record<string, unknown>;
        const level = typeof record.level === 'number' ? record.level : 30;
        const body = typeof record.message === 'string' ? record.message : 'log record';
        const attributes = Object.fromEntries(
          Object.entries(record)
            .filter(([key]) => !['level', 'message', 'time'].includes(key))
            .map(([key, value]) => [key, toAnyValue(value)])
        ) as AnyValueMap;

        otelLogger.emit({
          attributes,
          body,
          severityNumber: severityByLevel[level] ?? SeverityNumber.UNSPECIFIED,
          severityText: severityTextByLevel[level] ?? 'UNSPECIFIED',
          timestamp: typeof record.time === 'string' ? new Date(record.time) : undefined,
        });
      } catch {
        // Logging must never make the application fail.
      }
    },
  };
}

export function createLogger({ serviceName }: LoggerOptions): Logger {
  const options: PinoOptions = {
    base: {
      environment: process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV ?? 'development',
      service: serviceName,
    },
    level: process.env.LOG_LEVEL ?? 'info',
    messageKey: 'message',
    mixin: () => {
      const spanContext = trace.getSpan(context.active())?.spanContext();

      return spanContext && isSpanContextValid(spanContext)
        ? {
            span_id: spanContext.spanId,
            trace_flags: `0${spanContext.traceFlags.toString(16)}`.slice(-2),
            trace_id: spanContext.traceId,
          }
        : {};
    },
    redact: {
      paths: [
        'authorization',
        'cookie',
        'req.headers.authorization',
        'req.headers.cookie',
        'res.headers.set-cookie',
      ],
      censor: '[Redacted]',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (process.env.OTEL_SDK_DISABLED !== 'true' && process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    return pino(
      options,
      pino.multistream([
        { stream: process.stdout },
        { stream: createOpenTelemetryStream(serviceName) },
      ])
    );
  }

  return pino(options);
}

export function createHttpLogger(logger: Logger): HttpLogger {
  return pinoHttp({
    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
    customErrorMessage: () => 'request failed',
    customLogLevel: (_req, res, error) => {
      if (error || res.statusCode >= 500) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    customSuccessMessage: () => 'request completed',
    genReqId: (req, res) => {
      const incomingRequestId = req.headers['x-request-id'];
      const requestId = typeof incomingRequestId === 'string' ? incomingRequestId : randomUUID();

      res.setHeader('x-request-id', requestId);
      return requestId;
    },
    logger,
  });
}
