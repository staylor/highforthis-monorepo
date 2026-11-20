#!/bin/bash
# Boots a simulator and waits until it's ready: usage boot-simulator.sh <udid>
#
# The test runner can stall while a cold simulator boots, and then never starts, so the tests start on a booted one.
# The boot itself can also hang at "Waiting on BackBoard": CI boots take under 5 minutes, so this gives up after 10 and
# boots the erased device again.
set -euo pipefail
udid=$1

boot() {
  xcrun simctl bootstatus "$udid" -b &
  local pid=$!
  SECONDS=0
  while kill -0 "$pid" 2>/dev/null; do
    if [ "$SECONDS" -ge 600 ]; then
      kill "$pid"
      return 1
    fi
    sleep 5
  done
  wait "$pid"
}

if ! boot; then
  echo "::warning::The simulator didn't finish booting in 10 minutes, so it's being erased and booted again."
  xcrun simctl shutdown "$udid" || true
  xcrun simctl erase "$udid"
  boot
fi
