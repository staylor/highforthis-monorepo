# Observability

[OpenObserve](https://openobserve.ai/) provides the GUI and stores the logs, traces, and metrics emitted by the Node services through OpenTelemetry.

The image is pinned in [`Dockerfile`](./Dockerfile). OpenObserve listens on port `5080` and stores its standalone-mode data in `/data`.

## Deploy to Railway

1. Create a Railway service from this repository with `/observability` as its root directory.
2. Add a persistent volume mounted at `/data`. **Do not deploy without a volume** or telemetry will be lost on every redeploy.
3. Set these service variables:

   ```text
   PORT=5080
   ZO_ROOT_USER_EMAIL=<admin email>
   ZO_ROOT_USER_PASSWORD=<long, unique password>
   ```

4. Generate a public domain for the service and verify that `/healthz` responds successfully.
5. Sign in, then use **Data Sources → Recommended → Traces → OpenTelemetry** to copy the OTLP endpoint and authorization header. Create a dedicated ingestion user instead of using the root user for long-term ingestion.

The root credentials initialize the first user on a fresh `/data` volume. Keep them configured so a replacement volume can initialize successfully.

## Configure `graphql` and `web`

Set the following variables on both Railway services. The endpoint must include the OpenObserve organization (`default` below), but must not include a signal-specific suffix such as `/v1/traces`.

```text
OTEL_EXPORTER_OTLP_ENDPOINT=https://<openobserve-domain>/api/default
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-credentials-from-openobserve>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
```

The standard OTLP exporters append `/v1/logs`, `/v1/metrics`, and `/v1/traces` to that endpoint. OpenObserve's ingestion screen is the source of truth for the endpoint and authorization value.

Optional variables:

```text
LOG_LEVEL=info
OTEL_METRIC_EXPORT_INTERVAL=60000
OTEL_SDK_DISABLED=false
```

If `OTEL_EXPORTER_OTLP_ENDPOINT` is absent, the services continue to emit structured JSON logs to stdout but do not initialize OpenTelemetry exporters. Set `OTEL_SDK_DISABLED=true` to explicitly disable exporting.

## Run locally

Docker is the default:

```bash
pnpm observability:dev
# equivalent to: pnpm observability:dev:docker
```

Podman is also supported:

```bash
pnpm observability:dev:podman
```

The scripts build the image, replace an existing development container, mount `.openobserve-data` at `/data`, and run OpenObserve in the foreground. Press `Ctrl-C` to stop it; data is preserved for the next run.

Local defaults are:

```text
URL=http://localhost:5080
ZO_ROOT_USER_EMAIL=root@example.com
ZO_ROOT_USER_PASSWORD=LocalOpenObserve123!
```

The startup output includes the OTLP variables needed by `graphql` and `web`. Override the defaults when needed:

```bash
ZO_ROOT_USER_EMAIL=me@example.com \
ZO_ROOT_USER_PASSWORD='a-different-local-password' \
OPENOBSERVE_PORT=5081 \
pnpm observability:dev:podman
```

Root credentials only initialize a new data directory. To use different credentials with existing `.openobserve-data`, change them in OpenObserve or remove the local data and start over.
