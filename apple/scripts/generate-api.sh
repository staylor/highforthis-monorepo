#!/bin/sh
set -eu

APOLLO_IOS_VERSION=2.5.0
APOLLO_IOS_SHA256=c0161b298112b6a00f992149d0d8e5d2aa6825b03ef72923dd1eb19972988e77

root=$(cd "$(dirname "$0")/../.." && pwd)
cli="$root/.cache/apollo-ios-cli/$APOLLO_IOS_VERSION/apollo-ios-cli"

if [ ! -x "$cli" ]; then
  mkdir -p "$(dirname "$cli")"
  temporary=$(mktemp -d "$(dirname "$cli")/.install.XXXXXX")
  trap 'rm -rf "$temporary"' EXIT HUP INT TERM
  archive="$temporary/apollo-ios-cli.tar.gz"
  curl -fsSL --retry 3 --connect-timeout 15 --max-time 180 \
    "https://github.com/apollographql/apollo-ios/releases/download/$APOLLO_IOS_VERSION/apollo-ios-cli.tar.gz" \
    -o "$archive"
  printf '%s  %s\n' "$APOLLO_IOS_SHA256" "$archive" | shasum -a 256 -c -
  tar -xzf "$archive" -C "$temporary" apollo-ios-cli
  mv "$temporary/apollo-ios-cli" "$cli"
fi

if [ "$("$cli" --version)" != "$APOLLO_IOS_VERSION" ]; then
  echo "Unexpected Apollo CLI version at $cli" >&2
  exit 1
fi

cd "$root"
"$cli" generate --path apollo-codegen-config.json
