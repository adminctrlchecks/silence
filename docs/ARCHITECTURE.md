# Architecture

One backend, multiple clients. The **NestJS API is the single source of truth**;
the web app and the mobile app are both just clients of the same `/api/v1`
endpoints. Adding mobile requires **no backend changes**.

```
                    ┌─────────────────────────────┐
   Web  (Next.js) ──┤                             │
                    │   NestJS API   (port 3010)  │
Mobile (Expo / RN) ─┤   /api/v1  ·  JWT auth       │
                    │                             │
   Admin panel   ───┤   ┌──────────┬────────────┐ │
   (Next.js)        │   │ Gemini    │ Astrology  │ │
                    │   │ (AI+i18n) │ engine     │ │
                    └───┴──────────┴────────────┴─┘
                              │            │
                    PostgreSQL (silence_db)   Redis
                    localhost:5432            localhost:6379
```

## Stack

| Layer | Choice |
|-------|--------|
| Backend / API | **NestJS** (Node.js), port 3010 |
| Web + Admin | **Next.js** (React) |
| Mobile | **React Native + Expo** (iOS + Android, one codebase) |
| Database | **PostgreSQL** — separate `silence_db` / `silence_user` |
| Cache/queue | **Redis** (own logical DB index if used) |
| AI Mode + translation | **Gemini API** |
| Astrology chart | Ephemeris/astrology engine (chart geometry); Gemini for interpretation text |
| Auth | JWT bearer (admin + user), shared by web and mobile |

## Why this shape

- **Single API** → web and mobile stay in sync automatically; one place for
  business logic, auth, and content.
- **Same React skill set** across Next.js and React Native → faster team ramp,
  some shared logic.
- **Expo** → one codebase builds both app stores, with easy over-the-air updates.
- Handles all requirements identically on every client: **11 languages**
  (incl. Arabic RTL), astrology chart, AI-Mode content, Excel-imported data.

## Build phasing

- **Phase 1 (now): Web only** — NestJS API + Next.js (user + admin). This is the
  full product on web.
- **Phase 2 (later): Mobile** — React Native + Expo, reusing the same API. No
  backend rework required; it's an additional client.

The mobile notes below are recorded now so Phase 1 choices don't block Phase 2
(e.g. keeping all logic in the API, not in the web frontend).

## Mobile (Expo) specifics — Phase 2

- Consumes the same endpoints (§8–10 of [API.md](API.md)); no separate mobile API.
- **i18n:** use a library like `i18next` / `expo-localization`; enable RTL for
  Arabic via `I18nManager`.
- **Auth:** store the JWT securely with `expo-secure-store`.
- **Chart:** render the astrology chart from the API's chart data (SVG/canvas).
- **API base URL:** points to the VPS backend (`https://<subdomain>/api/v1`
  once a domain exists; the server IP during testing).

## Proposed repo layout (monorepo)

```
silence/
├─ apps/
│  ├─ api/       # NestJS backend
│  ├─ web/       # Next.js (user + admin)
│  └─ mobile/    # React Native + Expo
├─ packages/
│  └─ shared/    # shared types (API models, enums: category, level, langs)
└─ docs/         # REQUIREMENTS, API, DEPLOYMENT, ARCHITECTURE
```

> A shared `packages/shared` for API types keeps web and mobile in lock-step with
> the backend contract.
