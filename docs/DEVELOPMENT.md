# Development Guide

How to install, configure, run, migrate, seed, and test **Silence** locally.
This is the day-to-day companion to [PLAN.md](PLAN.md) (the build plan) and
[ARCHITECTURE.md](ARCHITECTURE.md) (the shape of the system).

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | ≥ 20 (repo tested on 24) | `node -v` |
| pnpm | 11.x | `corepack enable` then `corepack use pnpm@11` |
| Docker + Compose | recent | for local Postgres 16 + Redis 7 (see [P0-4]) |
| Git | any | — |

This is a **pnpm + Turborepo monorepo**:

```
apps/api        NestJS API (port 3010, /api/v1) — single source of truth
apps/web        Next.js user site + admin panel (port 3011)
packages/shared @silence/shared — enums, types, zod schemas, language list
```

## 1. Install

```bash
pnpm install
```

This installs every workspace at once. Turborepo orchestrates cross-package
builds (`@silence/shared` builds before its consumers).

## 2. Environment

Each app reads its own `.env`. Copy the examples and fill in real values —
`.env` files are gitignored and must never be committed.

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

**API — `apps/api/.env`** (see the example for the full annotated list):

| Var | Purpose |
|-----|---------|
| `API_PORT` | API port (default `3010`) |
| `DATABASE_URL` | `postgresql://silence_user:…@localhost:5432/silence_db?schema=public` |
| `REDIS_URL` | `redis://localhost:6379/3` (own logical index, isolated from CtrlChecks) |
| `JWT_ADMIN_SECRET` / `JWT_USER_SECRET` | separate signing secrets for admin vs user tokens |
| `GEMINI_API_KEY` | AI-Mode answers + translation; blank falls back to a stub |
| `WEB_ORIGIN` | allowed CORS origin(s) for the web app |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | first admin created by the seed |

**Web — `apps/web/.env.local`**:

| Var | Purpose |
|-----|---------|
| `API_BASE_URL` | server-side API base (`http://localhost:3010/api/v1`) |
| `NEXT_PUBLIC_API_BASE_URL` | browser-side API base |

> Secrets for deployment live only in `deploy/.secrets.env` (gitignored); see
> `deploy/.secrets.env.example` for the required VPS + API secrets.

## 3. Start infrastructure (Postgres + Redis)

Local Postgres 16 and Redis 7 run via Docker Compose, on isolated ports/volumes:

```bash
docker compose up -d
docker compose ps           # both healthy
pg_isready -h localhost -p 5432   # accepting connections
```

Stop with `docker compose down` (add `-v` to also drop the data volume).

## 4. Database: migrate & seed

Prisma owns the schema (`apps/api/prisma/schema.prisma`).

```bash
# apply migrations to the local DB (creates tables)
pnpm --filter @silence/api prisma:migrate

# generate the Prisma client (also runs automatically after install/build)
pnpm --filter @silence/api prisma:generate

# seed: first admin + the 11 supported languages
pnpm --filter @silence/api db:seed
```

Inspect data visually with `pnpm --filter @silence/api prisma:studio`.

## 5. Run the apps

Run everything with Turborepo, or target one app:

```bash
pnpm dev                              # all apps (turbo)
pnpm --filter @silence/api dev        # API only → http://localhost:3010/api/v1
pnpm --filter @silence/web dev        # web only → http://localhost:3011
```

Health check: `curl http://localhost:3010/api/v1/health`.

## 6. Build

```bash
pnpm build                            # all packages
pnpm --filter @silence/api build
pnpm --filter @silence/web build
```

## 7. Quality gates

```bash
pnpm lint            # ESLint (shared flat config at repo root)
pnpm typecheck       # tsc --noEmit across packages
pnpm test            # unit/e2e tests
pnpm format          # Prettier write   (format:check to verify only)
```

These are the same checks CI runs on every PR (see `.github/workflows/ci.yml`).

## 8. Tests

```bash
pnpm --filter @silence/api test              # Jest unit tests
pnpm --filter @silence/api test -- --watch   # watch mode
```

E2E and Playwright suites are added in later phases (see PLAN.md P3 / P8).

## 9. Common tasks

| I want to… | Command |
|------------|---------|
| Add a dependency to the API | `pnpm --filter @silence/api add <pkg>` |
| Reset the local DB | `docker compose down -v && docker compose up -d && pnpm --filter @silence/api prisma:migrate` |
| Regenerate Prisma client | `pnpm --filter @silence/api prisma:generate` |
| Clean all build output | `pnpm clean` |

## 10. Git workflow

- Branch per task: `feat/<task-id>` off `main` (task ids from [PLAN.md](PLAN.md)).
- Conventional Commits; sign work with the co-author trailer.
- Open a PR to `main`; CI must be green before squash-merge.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the isolated Hostinger VPS deployment.
