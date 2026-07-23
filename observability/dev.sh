#!/usr/bin/env bash

set -euo pipefail

runtime="${1:-}"

if [[ "$runtime" != "docker" && "$runtime" != "podman" ]]; then
  echo "Usage: $0 <docker|podman>" >&2
  exit 1
fi

if ! command -v "$runtime" >/dev/null 2>&1; then
  echo "Error: $runtime is not installed or is not available on PATH." >&2
  exit 1
fi

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
data_directory="$repository_root/.openobserve-data"
image_name="highforthis-openobserve:dev"
container_name="highforthis-openobserve"
port="${OPENOBSERVE_PORT:-5080}"
root_email="${ZO_ROOT_USER_EMAIL:-root@example.com}"
root_password="${ZO_ROOT_USER_PASSWORD:-LocalOpenObserve123!}"
authorization="$({ printf '%s' "$root_email:$root_password" | base64 | tr -d '\n'; } 2>/dev/null)"
volume="$data_directory:/data"

if [[ "$runtime" == "podman" && "$(uname -s)" == "Linux" ]]; then
  volume="$volume:Z"
fi

mkdir -p "$data_directory"

if "$runtime" container inspect "$container_name" >/dev/null 2>&1; then
  echo "Removing existing $container_name container..."
  "$runtime" rm -f "$container_name" >/dev/null
fi

echo "Building OpenObserve with $runtime..."
"$runtime" build -t "$image_name" "$repository_root/observability"

echo
echo "OpenObserve development server"
echo "  UI:       http://localhost:$port"
echo "  Email:    $root_email"
echo "  Password: $root_password"
echo "  Data:     $data_directory"
echo
echo "Node service environment:"
echo "  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:$port/api/default"
echo "  OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic $authorization"
echo "  OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf"
echo
echo "Press Ctrl-C to stop OpenObserve. Local data will be preserved."
echo

exec "$runtime" run --rm \
  --name "$container_name" \
  -p "$port:5080" \
  -v "$volume" \
  -e "ZO_ROOT_USER_EMAIL=$root_email" \
  -e "ZO_ROOT_USER_PASSWORD=$root_password" \
  "$image_name"
