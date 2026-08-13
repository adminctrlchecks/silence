#!/usr/bin/env bash
#
# Nightly backup of the Silence database. Dumps ONLY silence_db (never the
# CtrlChecks database), gzips it, and keeps the most recent N days.
# Run as root (uses `sudo -u postgres`). Installed via deploy/cron/silence-backup.
set -euo pipefail

DIR="${SILENCE_BACKUP_DIR:-/opt/backups/silence-db}"
KEEP="${SILENCE_BACKUP_KEEP:-14}"
mkdir -p "$DIR"

TS="$(date +%F_%H%M)"
FILE="$DIR/silence_db-$TS.sql.gz"

sudo -u postgres pg_dump silence_db | gzip > "$FILE"

# Rotate: keep the newest $KEEP dumps.
ls -1t "$DIR"/silence_db-*.sql.gz 2>/dev/null | tail -n +"$((KEEP + 1))" | xargs -r rm -f

echo "$(date -Is) backup -> $FILE ($(du -h "$FILE" | cut -f1)); kept $(ls -1 "$DIR"/silence_db-*.sql.gz | wc -l) dumps"
