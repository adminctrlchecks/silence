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
- [x] **P0-2** Shared **ESLint + Prettier** config at root; wire `lint` in each package. *Verify:* `pnpm lint`. — flat `eslint.config.mjs` (typescript-eslint + prettier), root `.prettierrc`, `.gitattributes`; all 3 packages lint green.
- [x] **P0-3** Root **dev README** (`docs/DEVELOPMENT.md`): install, env, run, migrate, seed, test. — full dev guide: prereqs, install, env vars, docker infra, migrate/seed, run, quality gates, git workflow.
- [x] **P0-4** **`docker-compose.yml`** (Postgres 16 + Redis 7, isolated volumes/ports) + `.env` wiring. *Verify:* `docker compose up -d` then `pg_isready`. — project `silence`, named volumes, healthchecks; root `.env.example` wires POSTGRES_*; containers healthy, `pg_isready` OK, redis PONG.
- [x] **P0-5** **`deploy/.secrets.env.example`** documenting required VPS + API secrets (SSH host/user/key path, DB password, JWT secrets, GEMINI_API_KEY). Real file is gitignored. — template covers SSH/deploy/Postgres/Redis/JWT/Gemini/seed-admin; `deploy/.secrets.env` added to .gitignore (verified ignored).
- [x] **P0-6** `git init`, `main` branch, add remote `https://github.com/adminctrlchecks/silence.git`, commit current tree, **push**. — repo initialized, P0-1..P0-5 landed on `main` (bootstrap: remote didn't exist before this task), pushed to origin; `gh` installed + auth via stored credential.
- [x] **P0-7** **GitHub Actions CI** (`.github/workflows/ci.yml`): install → lint → typecheck → build on PRs. *Verify:* workflow file valid; green on P0-6 branch. — CI green on PR #1 (1m1s); pnpm from packageManager, Node 22, prisma generate before build.

## PHASE 1 — Database live (local)

- [x] **P1-1** `prisma migrate dev --name init` against Docker Postgres; commit `prisma/migrations`. *Verify:* migration applies clean. — migration `20260813110356_init` applied; 13 tables created in silence_db.
- [x] **P1-2** Run `db:seed`; confirm admin + 11 languages present. *Verify:* row counts. — seed OK: 11 languages (ar rtl=true) + 1 admin.
- [x] **P1-3** `/health` returns `{ db: "up" }`; write a smoke script hitting one endpoint per module. *Verify:* smoke script all 2xx. — `scripts/smoke.mjs` (11/11 modules 2xx). Fixed two runtime blockers: `@silence/shared` now compiles to CJS `dist/` (was raw TS, unloadable by Nest) and api `start` path corrected to `dist/src/main.js`.

## PHASE 2 — Backend feature completion

- [x] **P2-1** Real **Gemini** integration (`@google/generative-ai`) for AI answers + translation, behind existing `GeminiService`. Fallback to stub when key absent. — real `generateContent` call (lazy-loaded SDK), graceful stub fallback on missing key/error. **Live-verified** with provided key: AI answer generated + auto-translated to hi/es/ar (stored). Default model updated to `gemini-2.5-flash`.
- [x] **P2-2** Real **astrology engine** (`swisseph`): compute planetary positions/houses from dob/time/place; replace `AstrologyService.compute`. *Verify:* unit test on a known birth datum. — Swiss Ephemeris via **`sweph`** (same SE C library, ships prebuilt binaries — `swisseph` needs MSVC and won't build on Windows/CI without a toolchain). Moshier mode (no data files). Computes 9 grahas + Placidus houses + ascendant. Jest+ts-jest set up; 5 tests green incl. J2000 Sun≈280.37° known datum.
- [x] **P2-3** **Excel import** hardening: per-row validation, error rows, `GET /admin/import/template` real xlsx, job status. *Verify:* import a sample xlsx → created/updated/errors correct. — per-row validation (level/category/text/questionId-exists) with 1-based error rows; upsert → create-vs-update tallies; template now has an example row. 10 jest tests + live verify: created=2/errors=2, re-upload updated=2, job status correct.
- [x] **P2-4** **Auth hardening**: bcrypt user passwords (decision D), guards on all `/admin/*`, global rate-limit, refresh strategy. *Verify:* e2e — protected routes 401 without token. — user register/login now require a bcrypt password; access+refresh tokens with `/auth/{admin,user}/refresh`; global ThrottlerGuard (100/min) + stricter 10/min on auth routes. 6 auth unit tests + live verify: /admin/* 401 w/o token, wrong password 401, refresh works, access-as-refresh 401, 429 on rate-limit.
- [x] **P2-5** **Swagger/OpenAPI** at `/api/v1/docs`; DTOs annotated. *Verify:* docs render, schema matches API.md. — Swagger UI at /api/v1/docs + JSON at /docs-json; 27 paths tagged per module, admin/user bearer schemes; request schemas generated from the shared Zod schemas (createZodDto + zodToOpenAPI, since nestjs-zod's swagger patch is incompatible with @nestjs/swagger 11). Removed redundant global class-validator pipe (it stripped the zod DTO bodies). Smoke 11/11.
- [x] **P2-6** Consistent pagination + error envelope across all list endpoints. *Verify:* e2e checks. — shared `parsePageParams`/`paginated` helper; answers + remedies now return `{data,page,limit,total}` like questions (page/limit query params, max 100). Error envelope `{error:{code,message}}` already global (verified 404/401/400). 6 pagination unit tests + live verify.

## PHASE 3 — Backend tests

- [x] **P3-1** Jest **unit tests** for each service (questions, answers, remedies, chart, languages, users, responses, import, auth). *Verify:* `pnpm --filter @silence/api test`. — service unit coverage added/expanded across all named modules; API tests 57/57, lint, and typecheck green.
- [x] **P3-2** **e2e (supertest)** covering each endpoint group against a test DB. *Verify:* e2e suite green. — Supertest suite covers health, auth, admin content/import/translations, public Q&A flow, and user chart/remedy/history against isolated `silence_e2e` schema.
- [x] **P3-3** Coverage gate ≥ 70% lines on API; wire into CI. — Jest enforces global line coverage >=70%; CI provisions Postgres and runs API coverage on PR/push (local coverage: 87.96% lines).

## PHASE 4 — Design-system adoption (web)

- [x] **P4-1** Bump `apps/web` to **Next 16**; add **Tailwind v4 + PostCSS + shadcn/radix**; base theme, dark mode, **RTL** direction handling. *Verify:* `pnpm --filter @silence/web build`. — upgraded to Next 16.3 + Tailwind v4/PostCSS; added shadcn/radix button primitives, theme provider/toggle, and cookie-driven `lang`/`dir`; web/root build gates green.
- [x] **P4-2** Adapt **TailAdmin** shell (sidebar/header/content) into `(admin)` layout. *Verify:* `/admin` renders themed. — TailAdmin-style collapsible/mobile sidebar, header, backdrop, and content frame adapted for Silence admin modules; `/admin` builds under the themed shell.
- [x] **P4-3** Adapt **SaaS-starter** landing + auth UI + route-protection middleware into `(user)`; remove Drizzle/Stripe. *Verify:* `/` renders themed; middleware guards user routes. — added user shell links, login/register UI, protected `/app`, and Next 16 proxy guard around `silence_user_token` with no Drizzle/Stripe code.
- [x] **P4-4** Integrate **@roxyapi/ui** (chart + card components) as a dependency/registry copy. *Verify:* a sample chart renders from mock data. — added `@roxyapi/ui-react`, local typed chart/card wrappers, Roxy theme variables, mock birth-chart/dosha data, and `/app/chart`; web/root lint, typecheck, test, and build green. **Phase 4 complete.**

## PHASE 5 — User web app (features)

- [x] **P5-1** **Language + category picker** (11 langs incl. RTL) persisted to session. *Verify:* switching sets `dir`/locale. — added a cookie-backed session picker on `/`, centralized `silence_lang`/`silence_category`, immediate `html lang/dir` updates, and register-form defaults from the saved session; web lint/typecheck/build green.
- [x] **P5-2** **`next-intl`** wired; message catalogs for all 11 languages (UI strings). *Verify:* locale routes render. — added `next-intl` App Router config, `[locale]` user/auth route wrappers, 11 JSON catalogs, localized current user-shell UI, and locale-aware picker navigation; web/root lint, typecheck, test, and build green.
- [x] **P5-3** **Registration** form (name, category, dob, time, place, contact, password, consent) → `POST /auth/user/register`. *Verify:* creates user, stores JWT. — register form now posts to a same-origin Next route, validates with the shared schema, calls the Nest register endpoint, sets httpOnly user access/refresh cookies, persists language/category cookies, and redirects to `/app`; root lint/typecheck/test/build green.
- [x] **P5-4** **Login** → `POST /auth/user/login`; JWT in httpOnly cookie; auth context. *Verify:* protected pages gated. — login form now posts to a same-origin Next route, validates with the shared schema, calls the Nest login endpoint, sets shared httpOnly user auth cookies, redirects to `/app`, and seeds an auth context from the token cookie in the user shell; root lint/typecheck/test/build green.
- [x] **P5-5** **Question flow** common→level1→level2 via `GET /questions` + `POST /responses`. *Verify:* answers persist. — added authenticated `/app/questions` (and locale route) loading profile + common/level1/level2 questions from the API, a stepper answer UI, and a token-backed same-origin `/api/responses` save route; root lint/typecheck/test/build green.
- [x] **P5-6** **Answer display** per question (`GET /answers`). *Verify:* correct lang/category answer shows. — question flow now fetches localized reviewed answers per saved question through a same-origin `/api/answers` proxy and displays them inline beneath each response; root lint/typecheck/test/build green.
- [x] **P5-7** **Birth chart** render from `GET /users/:id/chart` using roxyapi/ui. *Verify:* chart draws from API data. — `/app/chart` now reads the httpOnly user session, fetches profile + `GET /users/:id/chart`, adapts API astrology geometry for Roxy Kundli rendering, and displays the API interpretation; root lint/typecheck/test/build green.
- [x] **P5-8** **Remedy** screen from `GET /users/:id/remedy`. *Verify:* remedy shows. — `/app/remedy` fetches the authenticated user's localized API remedy and the dashboard links to it; root lint/typecheck/test/build green.
- [x] **P5-9** **Profile + history** from `GET /users/:id` + `/history`. *Verify:* saved sessions list. — `/profile` and `/history` now fetch authenticated API profile/history, render saved details/responses/charts, and build in locale routes; root lint/typecheck/test/build green. **Phase 5 complete.**

## PHASE 6 — Admin panel (features)

- [x] **P6-1** **Admin login** → `POST /auth/admin/login`; admin auth context/guarding. — `/admin/login` posts through a same-origin admin login route, stores separate httpOnly admin JWT cookies, and proxy-guards `/admin`; root lint/typecheck/test/build green.
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
- 2026-08-13 — P0-2 done (shared ESLint flat config + Prettier + .gitattributes; `pnpm lint` green).
- 2026-08-13 — P0-3 done (`docs/DEVELOPMENT.md` dev guide).
- 2026-08-13 — P0-4 done (docker-compose Postgres 16 + Redis 7; containers healthy, pg_isready OK).
- 2026-08-13 — P0-5 done (`deploy/.secrets.env.example` template; real secrets file gitignored).
- 2026-08-13 — P0-6 done (git repo + origin adminctrlchecks/silence; main pushed; gh CLI installed & authed). From P0-7 on: feature branch → PR → squash-merge on GitHub.
- 2026-08-13 — P0-7 done (GitHub Actions CI; PR #1 green & squash-merged). **Phase 0 complete.**
- 2026-08-13 — P1-1 done (prisma init migration; 13 tables live in local silence_db).
- 2026-08-13 — P1-2 done (db:seed; 11 languages + 1 admin verified by row counts).
- 2026-08-13 — P1-3 done (smoke script 11/11 2xx; fixed @silence/shared CJS build + api start path). **Phase 1 complete.**
- 2026-08-13 — P2-1 done (real Gemini integration; live-verified AI answer + hi/es/ar translation; model gemini-2.5-flash). Key provided by user, stored in gitignored .env only.
- 2026-08-13 — P2-2 done (real Swiss Ephemeris via `sweph`, Moshier; 5 jest tests incl. known J2000 datum). Adapted `swisseph`→`sweph` (prebuilt binaries; native swisseph won't build without MSVC).
- 2026-08-13 — P2-3 done (Excel import hardening: per-row validation, upsert create/update tallies, error rows, example template; 10 jest tests + live xlsx verify).
- 2026-08-13 — P2-4 done (auth hardening: bcrypt user passwords, access+refresh tokens, global + per-route rate limits; 6 unit tests + live 401/429 verify).
- 2026-08-13 — P2-5 done (Swagger UI at /api/v1/docs; 27 paths from zod DTOs; removed conflicting class-validator global pipe).
- 2026-08-13 — P2-6 done (uniform pagination envelope on answers/remedies/questions; error envelope verified). **Phase 2 complete.**
- 2026-08-13 — P3-1 done (service unit specs across questions, answers, remedies, chart, languages, users, responses, import, auth; API tests 57/57 + lint/typecheck green).
- 2026-08-13 — P3-2 done (Supertest e2e suite against isolated `silence_e2e` schema; API lint/typecheck/build + test 58/58 green).
- 2026-08-13 — P3-3 done (API coverage gate >=70% lines wired into Jest + CI; local coverage 87.96% lines). **Phase 3 complete.**
- 2026-08-13 — P4-1 done (Next 16.3 + Tailwind v4/PostCSS + shadcn/radix foundation, theme toggle, RTL root direction; web/root lint/typecheck/build green).
- 2026-08-13 — P4-2 done (TailAdmin-style admin shell with collapsible/mobile sidebar, header, backdrop, content frame; web/root lint/typecheck/build green).
- 2026-08-13 — P4-3 done (SaaS-starter-inspired user/auth shell, login/register UI, protected `/app`, Next 16 proxy guard; web/root lint/typecheck/build green).
- 2026-08-13 — P4-4 done (`@roxyapi/ui-react` chart/card wrappers + themed mock Kundli/dosha preview at `/app/chart`; web/root lint, typecheck, test, and build green). **Phase 4 complete.**
- 2026-08-13 — P5-1 done (session cookie language/category picker with immediate `html lang/dir` updates and register defaults; web lint/typecheck/build green).
- 2026-08-13 — P5-2 done (`next-intl` routing/request config, 11 UI catalogs, localized user/auth route wrappers; locale routes listed in Next build; web/root gates green).
- 2026-08-13 — P5-3 done (registration form → Next route → Nest `/auth/user/register`, httpOnly JWT cookies set; root lint/typecheck/test/build green).
- 2026-08-13 — P5-4 done (login form → Next route → Nest `/auth/user/login`, shared httpOnly JWT cookies + auth context; root lint/typecheck/test/build green).
- 2026-08-13 — P5-5 done (`/app/questions` common→level1→level2 UI + same-origin `/api/responses` token-backed save route; root lint/typecheck/test/build green).
- 2026-08-13 — P5-6 done (localized answer display per saved question via `/api/answers` → Nest `GET /answers`; root lint/typecheck/test/build green).
- 2026-08-13 — P5-7 done (`/app/chart` fetches API user chart and renders it through the Roxy Kundli adapter with interpretation; root lint/typecheck/test/build green).
- 2026-08-13 — P5-8 done (`/app/remedy` fetches authenticated `GET /users/:id/remedy` and displays the localized title/text; root lint/typecheck/test/build green).
- 2026-08-13 — P5-9 done (`/profile` + `/history` fetch authenticated `GET /users/:id` and `/history`, showing saved details, responses, and charts; root lint/typecheck/test/build green). **Phase 5 complete.**
- 2026-08-13 — P6-1 done (`/admin/login` → same-origin admin auth route → Nest `/auth/admin/login`, separate admin JWT cookies, proxy guard for `/admin`; root lint/typecheck/test/build green).
