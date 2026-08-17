#!/usr/bin/env bash
#
# Silence deploy script — run ON the Hostinger VPS from the repo root
# (/opt/silence), after `git clone`/`git pull`. Fully isolated from CtrlChecks:
# own dir, DB/user, ports 3010/3011, own systemd units + Nginx vhost.
#
# Usage:
#   sudo bash deploy/deploy.sh --dry-run     # print every step, change nothing
#   sudo bash deploy/deploy.sh               # perform the deploy
#
# Reads secrets from deploy/.secrets.env (gitignored). Never touches
# /opt/ctrlchecks-* or the CtrlChecks database/services.
set -euo pipefail

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    *) echo "Unknown argument: $arg" >&2; exit 2 ;;
  esac
done

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECRETS_FILE="$REPO_ROOT/deploy/.secrets.env"
DEPLOY_DIR_DEFAULT="/opt/silence"

log()  { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[deploy]\033[0m %s\n' "$*"; }

# run: execute a command, or just print it in --dry-run mode.
run() {
  if [ "$DRY_RUN" -eq 1 ]; then
    printf '  DRY-RUN> %s\n' "$*"
  else
    eval "$@"
  fi
}

# ── 1. Load + validate secrets ────────────────────────────────────────────────
if [ ! -f "$SECRETS_FILE" ]; then
  echo "Missing $SECRETS_FILE — copy deploy/.secrets.env.example and fill it in." >&2
  exit 1
fi
# shellcheck disable=SC1090
set -a; . "$SECRETS_FILE"; set +a

: "${DEPLOY_DIR:=$DEPLOY_DIR_DEFAULT}"
: "${API_PORT:=3010}"
: "${WEB_PORT:=3011}"
: "${POSTGRES_DB:?set in secrets}"
: "${POSTGRES_USER:?set in secrets}"
: "${POSTGRES_PASSWORD:?set in secrets}"
: "${SERVER_NAME:?set in secrets}"
: "${DATABASE_URL:=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:5432/$POSTGRES_DB?schema=public}"
: "${REDIS_URL:=redis://localhost:6379/3}"
: "${GEMINI_MODEL:=gemini-2.5-flash}"
: "${SEED_ADMIN_EMAIL:=admin@example.com}"
# Generate JWT secrets if not provided.
: "${JWT_ADMIN_SECRET:=$(openssl rand -hex 32)}"
: "${JWT_USER_SECRET:=$(openssl rand -hex 32)}"

log "Deploy dir: $DEPLOY_DIR   server_name: $SERVER_NAME   dry-run: $DRY_RUN"
if [ "$REPO_ROOT" != "$DEPLOY_DIR" ]; then
  warn "Running from $REPO_ROOT (expected $DEPLOY_DIR). Adjust DEPLOY_DIR or run from $DEPLOY_DIR."
fi

# ── 2. Write env files (never committed) ──────────────────────────────────────
API_ENV="$REPO_ROOT/apps/api/.env"
WEB_ENV="$REPO_ROOT/apps/web/.env.production"
log "Writing $API_ENV and $WEB_ENV"
if [ "$DRY_RUN" -eq 1 ]; then
  printf '  DRY-RUN> write %s (API_PORT, DATABASE_URL, JWT secrets, GEMINI, GOOGLE_CLIENT_ID, WEB_ORIGIN, seed admin)\n' "$API_ENV"
  printf '  DRY-RUN> write %s (API_BASE_URL, NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_GOOGLE_CLIENT_ID)\n' "$WEB_ENV"
else
  cat > "$API_ENV" <<EOF
NODE_ENV=production
API_PORT=$API_PORT
DATABASE_URL="$DATABASE_URL"
REDIS_URL="$REDIS_URL"
JWT_ADMIN_SECRET="$JWT_ADMIN_SECRET"
JWT_USER_SECRET="$JWT_USER_SECRET"
JWT_ADMIN_EXPIRES_IN="${JWT_ADMIN_EXPIRES_IN:-12h}"
JWT_USER_EXPIRES_IN="${JWT_USER_EXPIRES_IN:-7d}"
JWT_ADMIN_REFRESH_EXPIRES_IN="${JWT_ADMIN_REFRESH_EXPIRES_IN:-30d}"
JWT_USER_REFRESH_EXPIRES_IN="${JWT_USER_REFRESH_EXPIRES_IN:-30d}"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
GEMINI_MODEL="$GEMINI_MODEL"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
WEB_ORIGIN="https://$SERVER_NAME"
SEED_ADMIN_EMAIL="$SEED_ADMIN_EMAIL"
SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-change-me}"
EOF
  chmod 600 "$API_ENV"
  cat > "$WEB_ENV" <<EOF
NODE_ENV=production
API_BASE_URL="http://127.0.0.1:$API_PORT/api/v1"
NEXT_PUBLIC_API_BASE_URL="https://$SERVER_NAME/api/v1"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-}"
EOF
  chmod 600 "$WEB_ENV"
fi

# ── 3. Install deps + build ───────────────────────────────────────────────────
log "Installing dependencies and building"
run "cd '$REPO_ROOT' && pnpm install --frozen-lockfile"
run "cd '$REPO_ROOT' && pnpm --filter @silence/api prisma:generate"
run "cd '$REPO_ROOT' && pnpm --filter @silence/shared build"
run "cd '$REPO_ROOT' && pnpm --filter @silence/api build"
run "cd '$REPO_ROOT' && pnpm --filter @silence/web build"

# Next standalone needs static assets + public copied in beside server.js.
STANDALONE="$REPO_ROOT/apps/web/.next/standalone/apps/web"
run "cp -r '$REPO_ROOT/apps/web/.next/static' '$STANDALONE/.next/static'"
run "[ -d '$REPO_ROOT/apps/web/public' ] && cp -r '$REPO_ROOT/apps/web/public' '$STANDALONE/public' || true"

# ── 4. Database: migrate + seed (creates all tables on first deploy) ──────────
log "Applying migrations and seeding"
run "cd '$REPO_ROOT' && pnpm --filter @silence/api prisma:deploy"
run "cd '$REPO_ROOT' && pnpm --filter @silence/api db:seed"

# ── 5. systemd units (isolated names) ─────────────────────────────────────────
log "Installing systemd units"
run "cp '$REPO_ROOT/deploy/systemd/silence-api.service' /etc/systemd/system/silence-api.service"
run "cp '$REPO_ROOT/deploy/systemd/silence-web.service' /etc/systemd/system/silence-web.service"
run "systemctl daemon-reload"
run "systemctl enable --now silence-api.service"
run "systemctl enable --now silence-web.service"
run "systemctl restart silence-api.service silence-web.service"

# ── 6. Nginx vhost (new file; reload, never restart) ──────────────────────────
log "Installing Nginx vhost"
run "cp '$REPO_ROOT/deploy/nginx/silence.conf' /etc/nginx/sites-available/silence.conf"
run "ln -sf /etc/nginx/sites-available/silence.conf /etc/nginx/sites-enabled/silence.conf"
run "nginx -t"
run "systemctl reload nginx"

# ── 7. Verify ─────────────────────────────────────────────────────────────────
log "Verifying local health endpoint"
run "curl -fsS http://127.0.0.1:$API_PORT/api/v1/health"
log "Done. Next: point DNS ($SERVER_NAME -> this VPS) and run certbot for TLS."
log "Confirm CtrlChecks is untouched: systemctl is-active its services + load its site."
