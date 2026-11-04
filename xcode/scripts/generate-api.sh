#!/bin/sh
# Generates xcode/HighForThisAPI from graphql/schema.graphql and the app's operations.
#
# The generated Package.swift pins apollo-ios to this CLI's exact version, so changing APOLLO_IOS_VERSION and
# regenerating is how to upgrade Apollo: the app and the generated code can't drift apart.
set -eu

APOLLO_IOS_VERSION=2.5.0

root=$(cd "$(dirname "$0")/../.." && pwd)
cli="$root/.cache/apollo-ios-cli/$APOLLO_IOS_VERSION/apollo-ios-cli"

if [ ! -x "$cli" ]; then
  mkdir -p "$(dirname "$cli")"
  curl -fsSL "https://github.com/apollographql/apollo-ios/releases/download/$APOLLO_IOS_VERSION/apollo-ios-cli.tar.gz" |
    tar -xz -C "$(dirname "$cli")"
fi

cd "$root"
"$cli" generate --path apollo-codegen-config.json
