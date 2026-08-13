# VPS Baseline — recorded before the Silence deploy (P11-1)

Read-only inspection of the Hostinger VPS on 2026-08-14, before any change.
Silence deploys fully isolated alongside CtrlChecks (do not modify CtrlChecks).

## Host
- Ubuntu 24.04.4 LTS, kernel 6.8, hostname `orixs`.
- Node `v22.23.1` at `/usr/bin/node`, npm 10.9.8, git 2.43.0. **pnpm not installed** (enable via corepack).
- No `silence` system user yet.

## Listening ports (before)
| Port | Bind | Owner |
|------|------|-------|
| 22 | 0.0.0.0 | sshd |
| 80, 443 | 0.0.0.0 | nginx |
| 8080 | * | apache2 |
| 3001 | 0.0.0.0 | node (CtrlChecks) |
| 3002–3007 | 127.0.0.1 | node (CtrlChecks) |
| 3306, 33060 | 127.0.0.1 | mysqld |
| 5432 | 127.0.0.1 / [::1] | postgres 16 (**localhost only ✓**) |
| 6379 | 127.0.0.1 / [::1] | redis |
| 53 | 127.0.0.53/54 | systemd-resolve |
| 65529 | 127.0.0.1 | monarx-agent |

- **Ports 3010 and 3011 are FREE** → used by Silence api/web.

## CtrlChecks services (active, must stay untouched)
`ctrlchecks-ai-generator`, `ctrlchecks-credential-service`, `ctrlchecks-execution-engine`,
`ctrlchecks-notification-service`, `ctrlchecks-trigger-service`, `ctrlchecks-worker`,
`ctrlchecks-workflow-crud-service` — all `active (running)`. Code under `/opt/ctrlchecks-*`.

## Nginx (before)
- Enabled vhosts: `africa`, `construction`, `ctrlchecks-worker`, `dev.orixs.io`, `insurance`, `master.orixs.io`, `talent`.
- server_names in use include `worker.ctrlchecks.ai`, `*.orixs.io`. **No `silence.ctrlchecks.ai`** → no collision.
- `nginx -t` → syntax OK.

## PostgreSQL (before)
- Roles: `postgres`, `ctrlchecks_app`, plus `anon/authenticated/service_role` (+ built-in `pg_*`). **No `silence_user`.**
- Databases: `ctrlchecks`, `postgres`, `template0`, `template1`. **No `silence_db`.**
- Bound to `127.0.0.1:5432` only (not public).

## Deploy targets for Silence (isolated)
- Folder `/opt/silence`, DB `silence_db` / user `silence_user` (localhost), ports 3010/3011,
  systemd units `silence-api` / `silence-web`, Nginx vhost `silence.conf` (`silence.ctrlchecks.ai`).
