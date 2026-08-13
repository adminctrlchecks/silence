# Deployment Plan — Silence on the Hostinger VPS (side-by-side with CtrlChecks)

> **Goal:** deploy the Silence app on the same Ubuntu 24.04 VPS that already runs
> **CtrlChecks**, with full isolation. **CtrlChecks must never be modified,
> broken, or restarted unless absolutely required.**
>
> **Status:** planning only. No server connection has been made yet and no server
> changes have been performed.

## 0. Hard constraints (do not violate)

- Do **not** edit `/opt/ctrlchecks-*` files.
- Do **not** restart CtrlChecks services unless absolutely required.
- Do **not** reuse the CtrlChecks database.
- Do **not** expose PostgreSQL publicly (localhost only).
- Keep **backups** before any server-config change.

## 1. Existing environment (given — to be verified on first inspection)

| Resource | CtrlChecks / shared |
|----------|---------------------|
| App ports | 3001, 3002, 3003, 3004, 3005, 3006, 3007 |
| PostgreSQL | localhost:5432 (shared engine) |
| Redis | localhost:6379 (shared engine) |
| Nginx | ports 80, 443 |
| Process mgmt | systemd |

## 2. Isolation strategy for Silence

| Layer | CtrlChecks | Silence (new) |
|-------|-----------|---------------|
| Folder | `/opt/ctrlchecks-*` | `/opt/silence` |
| Backend port | 3001–3007 | **3010** |
| DB name | (existing) | `silence_db` |
| DB user | (existing) | `silence_user` (separate password) |
| systemd unit | (existing) | `silence-backend.service` |
| Nginx | (existing vhosts) | new config file + subdomain |
| Redis | (existing) | separate logical DB index if used, e.g. `redis://localhost:6379/3` |

## 3. Read-only inspection checklist (run FIRST, change nothing)

```bash
# Ports currently in use
sudo ss -tlnp | sort -t: -k2 -n

# Existing Nginx configs (list only — do not edit)
ls -l /etc/nginx/sites-available/ /etc/nginx/sites-enabled/
sudo nginx -t                      # confirm current config is valid before we add ours

# Existing systemd services
systemctl list-units --type=service --state=running | grep -Ei 'ctrl|node'

# PostgreSQL users and databases (read-only)
sudo -u postgres psql -c "\du"     # roles
sudo -u postgres psql -c "\l"      # databases

# Confirm Postgres is NOT listening publicly
sudo ss -tlnp | grep 5432          # expect 127.0.0.1:5432 only
```

Record the output before proceeding so we know the exact baseline.

## 4. Backups before any config change

```bash
sudo mkdir -p /opt/backups/$(date +%F)
sudo cp -r /etc/nginx /opt/backups/$(date +%F)/nginx
sudo systemctl list-units --type=service > /opt/backups/$(date +%F)/services-before.txt
# (No CtrlChecks DB dump needed — we never touch it — but Nginx + service list are cheap insurance.)
```

## 5. Setup order (only after inspection + sign-off)

1. Create `/opt/silence` and deploy backend/frontend build.
2. Create Postgres role + DB (separate, localhost):
   ```sql
   CREATE USER silence_user WITH PASSWORD '••••••';
   CREATE DATABASE silence_db OWNER silence_user;
   ```
3. Backend `.env` uses `postgres://silence_user:••••@localhost:5432/silence_db`.
4. Create `silence-backend.service` bound to port **3010**; `systemctl enable --now`.
5. Add a **new** Nginx config (own file in `sites-available`, symlink to
   `sites-enabled`) for the Silence subdomain → `proxy_pass http://127.0.0.1:3010`.
6. `sudo nginx -t` then reload (reload, not full restart): `sudo systemctl reload nginx`.

## 6. Post-setup verification

- New backend health endpoint: `curl http://127.0.0.1:3010/api/v1/health` → `200`.
- New DB connection works (backend logs / a test query as `silence_user`).
- Nginx route/subdomain resolves to the Silence app.
- **CtrlChecks still active:** `systemctl is-active <ctrlchecks services>`.
- **CtrlChecks website still loads** (open its URL, expect normal response).

## 7. App specification (to confirm)

| Field | Value |
|-------|-------|
| New app name | **Silence** |
| Domain / subdomain | *None yet — to be decided later* (e.g. `silence.<domain>`) |
| Backend framework | **NestJS** (Node.js) |
| Frontend framework | **Next.js** (React) |
| Database name | `silence_db` |
| DB user | `silence_user` |
| Backend port | **3010** |
| Features | Astrology Q&A: Common Questions → Level 1 (Admin + AI) → Level 2 → astrology Chart → Remedy; Admin panel with level-wise add-question; Excel import; multi-lingual (11 languages) |
| Authentication | Admin login + User login (JWT bearer) |
| File uploads | Excel import files (`.xlsx`) for bulk content |
| AI / integrations | **Gemini API** (AI-Mode answers + translation); astrology engine for chart geometry |
| Email / payment | None for now (add later if needed) |

## 8. What is still needed to proceed

- **VPS connection details:** IP/hostname, SSH user, auth method (key path).
- Subdomain name (can wait until a domain exists — until then, test via the
  server IP or a placeholder `server_name`).

### Stack decided

- **Backend:** NestJS (Node.js), port **3010**, systemd unit `silence-backend.service`.
- **Frontend:** Next.js. Can run as its own Node service (e.g. port 3011) behind
  Nginx, or be exported as static files — to confirm at build stage.
- Both proxied by a **new** Nginx config; CtrlChecks vhosts untouched.
