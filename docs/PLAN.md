# Silence — End-to-End Build Plan (loop state file)

This file is **both the plan and the loop's state**. An autonomous agent works
through it top to bottom, one task at a time, and edits the checkboxes/notes here
as it goes. See [LOOP_PROMPT.md](LOOP_PROMPT.md) for the prompt that drives it.

> Read first, every iteration: [README.md](../README.md),
> [REQUIREMENTS.md](REQUIREMENTS.md), [API.md](API.md), [ARCHITECTURE.md](ARCHITECTURE.md),
> [DEPLOYMENT.md](DEPLOYMENT.md), then this file.

---

## Execution protocol (the loop obeys this)

1. **Pick the next task**: the first `[ ]` task whose dependencies are all `[x]`.
   Skip tasks tagged `(blocked: …)`.
2. **Branch**: work on `feat/<task-id>` off `main` (create `main` in P0-6).
3. **Implement** only that task. Keep changes scoped.
4. **Verify** — run the task's *Verify* commands. They must pass. If they fail,
   fix within the same task; never check off a task with a failing build/test.
5. **Commit** (Conventional Commits), then **push**, then **open/update a PR**
   (`gh pr create`) targeting `main`. Squash-merge green PRs.
   - Commit trailer (required): `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
   - PR body trailer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
6. **Update this file**: flip `[ ]`→`[x]`, add a one-line note after the task.
7. **Continue to the next task automatically — do NOT stop between phases.**
8. **Only stop when**: (a) every task is `[x]`, or (b) the only remaining tasks
   are `(blocked: …)`. On stop, post a summary of what's done and what's blocked.
9. **Blocked handling**: if a task needs a missing secret/credential, tag it
   `(blocked: needs X)`, note exactly what's required, and move to the next
   unblocked task. Never fabricate credentials, server access, or test results.

### Safety rails (never violate)
- **Never touch CtrlChecks**: no edits to `/opt/ctrlchecks-*`, no restart of its
  services, no reuse of its DB. Silence is fully isolated (own folder, DB, user,
  ports, systemd unit, Nginx vhost) per [DEPLOYMENT.md](DEPLOYMENT.md).
- **Never expose Postgres publicly** (localhost only).
- **Secrets** live only in gitignored `.env` / `deploy/.secrets.env`; never commit them.
- Do a **read-only inspection + backup** before any VPS config change.

### Standard verify commands
- Workspace build: `pnpm build`
- Types: `pnpm typecheck`
- Tests: `pnpm test`
- API only: `pnpm --filter @silence/api build|test`
- Web only: `pnpm --filter @silence/web build`

---

## Locked decisions (chosen defaults — override here if you disagree)

- **A. Next.js version for `apps/web`:** **16** (matches TailAdmin; SaaS-starter
  components backported as needed).
- **B. Astrology engine:** **Swiss Ephemeris** via `swisseph` (self-hosted, free,
  accurate). `@roxyapi/ui` used for *rendering only*, fed by our own chart data.
- **C. i18n:** **`next-intl`** (App-Router native, RTL support). 11 languages,
  Arabic = RTL.
- **D. User auth:** email/phone + **password** (bcrypt), JWT. OTP is a later add-on.
- **E. Local dev DB/cache:** **Docker Compose** (Postgres 16 + Redis 7).
- **Styling:** **Tailwind v4 + shadcn/radix** as the `apps/web` foundation (all
  three templates already use it).

## Templates → targets
- `templates/free-nextjs-admin-dashboard-main` (**TailAdmin**) → `(admin)` panel.
- `templates/saas-starter-main` (**Next.js SaaS Starter**) → `(user)` shell +
  auth UI + middleware. Strip its Drizzle + Stripe (NestJS API is source of truth).
- `templates/ui-main` (**@roxyapi/ui**) → astrology chart/remedy components in `(user)`.

---

## PHASE 0 — Foundation & repo hygiene

- [x] **P0-1** Monorepo (pnpm+turbo), `packages/shared`, API skeleton, web shell — builds green.
- [ ] **P0-2** Shared **ESLint + Prettier** config at root; wire `lint` in each package. *Verify:* `pnpm lint`.
- [ ] **P0-3** Root **dev README** (`docs/DEVELOPMENT.md`): install, env, run, migrate, seed, test.
- [ ] **P0-4** **`docker-compose.yml`** (Postgres 16 + Redis 7, isolated volumes/ports) + `.env` wiring. *Verify:* `docker compose up -d` then `pg_isready`.
- [ ] **P0-5** **`deploy/.secrets.env.example`** documenting required VPS + API secrets (SSH host/user/key path, DB password, JWT secrets, GEMINI_API_KEY). Real file is gitignored.
- [ ] **P0-6** `git init`, `main` branch, add remote `https://github.com/adminctrlchecks/silence.git`, commit current tree, **push**. *(blocked: needs GitHub auth — `gh auth login` or PAT — if not already configured)*
- [ ] **P0-7** **GitHub Actions CI** (`.github/workflows/ci.yml`): install → lint → typecheck → build on PRs. *Verify:* workflow file valid; green on P0-6 branch.

## PHASE 1 — Database live (local)

- [ ] **P1-1** `prisma migrate dev --name init` against Docker Postgres; commit `prisma/migrations`. *Verify:* migration applies clean.
- [ ] **P1-2** Run `db:seed`; confirm admin + 11 languages present. *Verify:* row counts.
- [ ] **P1-3** `/health` returns `{ db: "up" }`; write a smoke script hitting one endpoint per module. *Verify:* smoke script all 2xx.

## PHASE 2 — Backend feature completion

- [ ] **P2-1** Real **Gemini** integration (`@google/generative-ai`) for AI answers + translation, behind existing `GeminiService`. Fallback to stub when key absent. *(partial-blocked: needs GEMINI_API_KEY for live verify)*
- [ ] **P2-2** Real **astrology engine** (`swisseph`): compute planetary positions/houses from dob/time/place; replace `AstrologyService.compute`. *Verify:* unit test on a known birth datum.
- [ ] **P2-3** **Excel import** hardening: per-row validation, error rows, `GET /admin/import/template` real xlsx, job status. *Verify:* import a sample xlsx → created/updated/errors correct.
- [ ] **P2-4** **Auth hardening**: bcrypt user passwords (decision D), guards on all `/admin/*`, global rate-limit, refresh strategy. *Verify:* e2e — protected routes 401 without token.
- [ ] **P2-5** **Swagger/OpenAPI** at `/api/v1/docs`; DTOs annotated. *Verify:* docs render, schema matches API.md.
- [ ] **P2-6** Consistent pagination + error envelope across all list endpoints. *Verify:* e2e checks.

## PHASE 3 — Backend tests

- [ ] **P3-1** Jest **unit tests** for each service (questions, answers, remedies, chart, languages, users, responses, import, auth). *Verify:* `pnpm --filter @silence/api test`.
- [ ] **P3-2** **e2e (supertest)** covering each endpoint group against a test DB. *Verify:* e2e suite green.
- [ ] **P3-3** Coverage gate ≥ 70% lines on API; wire into CI.

## PHASE 4 — Design-system adoption (web)

- [ ] **P4-1** Bump `apps/web` to **Next 16**; add **Tailwind v4 + PostCSS + shadcn/radix**; base theme, dark mode, **RTL** direction handling. *Verify:* `pnpm --filter @silence/web build`.
- [ ] **P4-2** Adapt **TailAdmin** shell (sidebar/header/content) into `(admin)` layout. *Verify:* `/admin` renders themed.
- [ ] **P4-3** Adapt **SaaS-starter** landing + auth UI + route-protection middleware into `(user)`; remove Drizzle/Stripe. *Verify:* `/` renders themed; middleware guards user routes.
- [ ] **P4-4** Integrate **@roxyapi/ui** (chart + card components) as a dependency/registry copy. *Verify:* a sample chart renders from mock data.

## PHASE 5 — User web app (features)

- [ ] **P5-1** **Language + category picker** (11 langs incl. RTL) persisted to session. *Verify:* switching sets `dir`/locale.
- [ ] **P5-2** **`next-intl`** wired; message catalogs for all 11 languages (UI strings). *Verify:* locale routes render.
- [ ] **P5-3** **Registration** form (name, category, dob, time, place, contact, password, consent) → `POST /auth/user/register`. *Verify:* creates user, stores JWT.
- [ ] **P5-4** **Login** → `POST /auth/user/login`; JWT in httpOnly cookie; auth context. *Verify:* protected pages gated.
- [ ] **P5-5** **Question flow** common→level1→level2 via `GET /questions` + `POST /responses`. *Verify:* answers persist.
- [ ] **P5-6** **Answer display** per question (`GET /answers`). *Verify:* correct lang/category answer shows.
- [ ] **P5-7** **Birth chart** render from `GET /users/:id/chart` using roxyapi/ui. *Verify:* chart draws from API data.
- [ ] **P5-8** **Remedy** screen from `GET /users/:id/remedy`. *Verify:* remedy shows.
- [ ] **P5-9** **Profile + history** from `GET /users/:id` + `/history`. *Verify:* saved sessions list.

## PHASE 6 — Admin panel (features)

- [ ] **P6-1** **Admin login** → `POST /auth/admin/login`; admin auth context/guarding.
- [ ] **P6-2** **Questions** CRUD (level × category) incl. add-question-level-wise. *Verify:* CRUD round-trips.
- [ ] **P6-3** **Answers** CRUD + **AI-generate** button + **AI review queue** (`source=ai&reviewed=false`). *Verify:* generate → appears unreviewed → approve.
- [ ] **P6-4** **Remedies** CRUD linked to level/question. *Verify:* CRUD round-trips.
- [ ] **P6-5** **Chart config** editor per category. *Verify:* PUT persists.
- [ ] **P6-6** **Languages + auto-translate** UI (`/admin/translations/auto`). *Verify:* triggers translation, fills catalog.
- [ ] **P6-7** **Excel import** UI: react-dropzone upload, template download, job-status polling. *Verify:* upload → job → results shown.

## PHASE 7 — i18n content + polish

- [ ] **P7-1** RTL QA pass (Arabic) across user + admin. *Verify:* layout mirrors correctly.
- [ ] **P7-2** a11y + responsive + loading/empty/error states across key screens.

## PHASE 8 — Frontend E2E

- [ ] **P8-1** **Playwright** e2e: full user journey (pick → register → answer → chart → remedy). *Verify:* suite green.
- [ ] **P8-2** Playwright e2e: admin content-building journey. *Verify:* suite green.
- [ ] **P8-3** Wire Playwright into CI (against seeded API + web). *Verify:* CI green.

## PHASE 9 — CI/CD complete

- [ ] **P9-1** CI runs lint+typecheck+test+build for all packages on every PR. *Verify:* required checks pass.
- [ ] **P9-2** Build **Docker images** for api + web (multi-stage). *Verify:* images build & run locally.

## PHASE 10 — Deployment prep

- [ ] **P10-1** `apps/web` `output: 'standalone'`; production build verified. *Verify:* `next build` standalone runs.
- [ ] **P10-2** **systemd units**: `silence-api.service` (:3010), `silence-web.service` (:3011). Templates in `deploy/systemd/`.
- [ ] **P10-3** **Nginx vhost** template (`deploy/nginx/silence.conf`) → proxy 3010/3011; placeholder `server_name` (no domain yet).
- [ ] **P10-4** `deploy/deploy.sh` + `prisma migrate deploy` step; `.env.production` templates. *Verify:* dry-run script logic.

## PHASE 11 — VPS deploy (Hostinger, isolated) 🔒

Requires `deploy/.secrets.env` with VPS host/user/SSH key + DB password.
**If that file is absent, tag every P11 task `(blocked: needs Hostinger credentials)`
and STOP with a request for them.**

- [ ] **P11-1** *(blocked: needs Hostinger credentials)* SSH read-only inspection (ports, nginx, systemd, `psql \du`/`\l`, confirm 5432 localhost-only). Record baseline.
- [ ] **P11-2** *(blocked: needs Hostinger credentials)* Backups: `/etc/nginx` + service list to `/opt/backups/<date>`.
- [ ] **P11-3** *(blocked: needs Hostinger credentials)* Create Postgres `silence_user` + `silence_db` (localhost). **Do not touch CtrlChecks DB.**
- [ ] **P11-4** *(blocked: needs Hostinger credentials)* Deploy code to `/opt/silence`; install; `prisma migrate deploy` (**creates all tables**); seed admin + languages.
- [ ] **P11-5** *(blocked: needs Hostinger credentials)* Install systemd units; `enable --now`; api on 3010, web on 3011.
- [ ] **P11-6** *(blocked: needs Hostinger credentials)* Add **new** Nginx vhost; `nginx -t`; `systemctl reload nginx` (reload, not restart).
- [ ] **P11-7** *(blocked: needs Hostinger credentials)* Verify: `curl :3010/api/v1/health` 200; site loads; **CtrlChecks still active & serving.**

## PHASE 12 — Post-deploy

- [ ] **P12-1** Smoke tests against the live server.
- [ ] **P12-2** Logging + basic monitoring; nightly `pg_dump` cron for `silence_db`.
- [ ] **P12-3** Handover notes in `docs/DEPLOYMENT.md` (actual values, redacted secrets).

## PHASE 13 — (future) Mobile — out of scope now
- Expo app on the same API (product Phase 2).

---

## Progress log
_(the loop appends dated one-liners here as phases complete)_
- 2026-08-13 — P0-1 done (scaffold + green builds).
