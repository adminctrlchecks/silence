#!/usr/bin/env bash
#
# Read-only smoke test against a live Silence deployment. Safe for production:
# it only reads (health, languages, questions, Swagger) plus an admin login,
# and never creates content.
#
# Usage:
#   deploy/smoke.sh                                  # defaults to the prod URL
#   BASE=https://silence.ctrlchecks.ai/api/v1 \
#     ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='...' deploy/smoke.sh
#   # From a machine whose resolver lags DNS, pin the IP:
#   RESOLVE="silence.ctrlchecks.ai:443:187.127.185.105" deploy/smoke.sh
set -uo pipefail

BASE="${BASE:-https://silence.ctrlchecks.ai/api/v1}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-change-me}"
CURL=(curl -s --max-time 20)
[ -n "${RESOLVE:-}" ] && CURL+=(--resolve "$RESOLVE")

pass=0; fail=0
check() { # name  expected-code  curl-args...
  local name="$1" want="$2"; shift 2
  local code; code=$("${CURL[@]}" -o /dev/null -w '%{http_code}' "$@")
  if [ "$code" = "$want" ]; then printf '  ✓ %-28s %s\n' "$name" "$code"; pass=$((pass+1));
  else printf '  ✗ %-28s got %s want %s\n' "$name" "$code" "$want"; fail=$((fail+1)); fi
}

echo "Live smoke against $BASE"
check "health"            200 "$BASE/health"
check "languages"         200 "$BASE/languages"
check "questions (public)" 200 "$BASE/questions?level=common&category=male&lang=en"
check "swagger docs"      200 "$BASE/docs"
check "admin login"       201 -X POST -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" "$BASE/auth/admin/login"

# Content assertions (read-only).
DB=$("${CURL[@]}" "$BASE/health" | grep -oE '"db":"[a-z]+"')
LANGS=$("${CURL[@]}" "$BASE/languages" | grep -oE '"code":"[a-z]+"' | wc -l | tr -d ' ')
echo "  · health $DB · languages=$LANGS"
[ "$DB" = '"db":"up"' ] || fail=$((fail+1))
[ "$LANGS" = "11" ] || fail=$((fail+1))

echo ""
echo "$pass passed, $fail failed."
[ "$fail" -eq 0 ] || exit 1
