#!/usr/bin/env bash
#
# Basic health monitor for the Silence API. Logs the health status; systemd
# (Restart=on-failure) already restarts a crashed process, so this is for
# observability. Wire into cron (every few minutes) via deploy/cron/silence-backup.
set -uo pipefail
URL="${1:-http://127.0.0.1:3010/api/v1/health}"
code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$URL" || echo 000)"
echo "$(date -Is) health $URL -> $code"
[ "$code" = "200" ] || exit 1
