# Repository Audit

> Comprehensive inventory of the Silence codebase as it exists on 2026-08-16.

---

## 1. Monorepo Structure `CURRENT`

```
silence/
├── apps/
│   ├── api/          # NestJS backend (port 3010, /api/v1)
│   └── web/          # Next.js 16 frontend (port 3011, user + admin)
├── packages/
│   └── shared/       # @silence/shared — enums, types, Zod schemas, language defs
├── templates/        # Source templates (reference only, not deployed)
│   ├── free-nextjs-admin-dashboard-main/  # TailAdmin — admin shell inspiration
│   ├── saas-starter-main/                 # SaaS starter — auth/account patterns
│   └── ui-main/                           # @roxyapi/ui — astrology chart components
├── docs/             # Project documentation
├── deploy/           # Deployment scripts, systemd units, Nginx config
├── .github/          # CI/CD workflows
└── docker-compose.yml
```

**Package manager:** pnpm 11.21 with Turborepo  
**Node requirement:** ≥ 20  
**Monorepo tool:** Turborepo (`turbo run dev/build/lint/typecheck/test`)

---

## 2. Backend — `apps/api` `CURRENT`

### Tech stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 11.x | Framework |
| Prisma | 6.x | ORM + migrations |
| PostgreSQL | 16 | Database |
| Redis | 7 | Cache (logical DB index 3) |
| Passport + JWT | Latest | Authentication |
| Zod + nestjs-zod | Latest | Request validation |
| @google/generative-ai | 0.24 | Gemini AI (answers, translation, chart interpretation) |
| sweph | 2.10 | Swiss Ephemeris (astrology chart computation) |
| xlsx | 0.18 | Excel import/export |
| Swagger/OpenAPI | via @nestjs/swagger 11 | API documentation at /api/v1/docs |

### NestJS Modules
| Module | Controllers | Services | Purpose |
|--------|------------|----------|---------|
| Auth | AuthController | AuthService | Admin/user login, register, refresh, password change/reset, admin-as-user |
| Users | UsersController | UsersService | Profile CRUD, admin user list/search, dashboard, sessions, history |
| Questions | QuestionsController | QuestionsService | Question CRUD (level × category × order), admin + public list |
| Answers | AnswersController | AnswersService | Answer CRUD, AI generation, admin review queue, public answer lookup |
| Responses | ResponsesController | ResponsesService | Save user responses tied to sessions |
| Chart | ChartController | ChartService | Chart config CRUD, user chart generation (ephemeris + Gemini interpretation) |
| Remedies | RemediesController | RemediesService | Remedy CRUD with rule fields, personalized remedy selection per session |
| Languages | LanguagesController | LanguagesService | Language management |
| Import | ImportController | ImportService | Excel template download, upload, validation, job status |
| Translations | TranslationsController | TranslationsService | Per-entity translation CRUD, Gemini auto-translate |
| AdminDashboard | AdminDashboardController | AdminDashboardService | Live metrics, content completeness matrix |
| AdminAudit | — | AdminAuditService | Audit log for sensitive admin actions |
| Integrations/Gemini | — | GeminiService | AI answer generation, translation, chart interpretation |
| Integrations/Astrology | — | AstrologyService | Swiss Ephemeris planetary positions/houses |
| Integrations/Email | — | EmailService | Password reset email delivery |
| Prisma | — | PrismaService | Database connection |
| Health | HealthController | — | `/health` endpoint |

### Auth architecture
- **Two separate JWT realms:** admin (`JWT_ADMIN_SECRET`) and user (`JWT_USER_SECRET`)
- **Passport strategies:** `AdminJwtStrategy`, `UserJwtStrategy`
- **Guards:** `AdminJwtGuard`, `UserJwtGuard`
- **Tokens:** access + refresh pair per role; refresh rotation on exchange
- **Password:** bcrypt hashed, 10 rounds
- **Password reset:** sha256-hashed single-use tokens, 1-hour expiry, email delivery
- **Rate limiting:** Global 100/min, auth endpoints 10/min (Throttler)

### Prisma Schema — 16 models
| Model | Purpose |
|-------|---------|
| Admin | Admin accounts (email, name, passwordHash) |
| Language | 11 supported languages (code, name, rtl flag) |
| Question | Questions per level/category with order, inputType, helpText, active, branchingTags |
| QuestionTranslation | Per-language question text |
| Answer | Answers per question/level/category with source (admin/ai) and reviewed flag |
| AnswerTranslation | Per-language answer text |
| Remedy | Remedies with rule fields (planet/sign/house/keyword filters, priority, enabled) |
| RemedyTranslation | Per-language remedy title+text |
| ChartConfig | Per-category chart configuration (style, source, requires) |
| User | User profiles (birth details, contact, category, lang) |
| UserResponse | Saved question responses, optionally tied to a ReadingSession |
| UserChart | Computed astrology charts (ephemeris data + Gemini interpretation) |
| ReadingSession | Guided reading funnel (draft → in_progress → chart_ready → remedy_ready → complete) |
| RemedyResult | Snapshot of remedy shown per session (immutable even if Remedy row changes) |
| ImportJob | Excel import job tracking |
| PasswordResetToken | Single-use hashed tokens for password reset |
| AdminAuditLog | Sensitive admin action trail |

### API Endpoints (27 paths per Swagger)

**Auth:** `/auth/admin/login`, `/auth/admin/refresh`, `/auth/admin/change-password`, `/auth/admin/user-session`, `/auth/admin/forgot-password`, `/auth/admin/reset-password`, `/auth/user/register`, `/auth/user/login`, `/auth/user/refresh`, `/auth/user/change-password`, `/auth/user/forgot-password`, `/auth/user/reset-password`

**Admin content:** `/admin/questions` (CRUD), `/admin/answers` (CRUD + AI-generate), `/admin/remedies` (CRUD), `/admin/chart-config` (GET/PUT), `/admin/import` (template/upload/status), `/admin/languages` (list/add), `/admin/translations` (set/auto), `/admin/users` (list/detail/sessions), `/admin/dashboard/metrics`, `/admin/dashboard/content-matrix`, `/admin/audit-log`

**User flow:** `/questions` (public list), `/responses` (save), `/answers` (public lookup), `/users/:id` (profile CRUD), `/users/:id/chart`, `/users/:id/remedy`, `/users/:id/sessions` (CRUD + detail), `/users/:id/dashboard`, `/users/:id/history`

---

## 3. Frontend — `apps/web` `CURRENT`

### Tech stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.3 | Framework (App Router, standalone output) |
| React | 19.2 | UI library |
| Tailwind CSS | 4.3 | Styling (PostCSS integration) |
| next-intl | 4.13 | i18n (11 locales, RTL support) |
| next-themes | 0.4 | Dark/light mode |
| lucide-react | 1.31 | Icons |
| @roxyapi/ui-react | 0.27.5 | Astrology chart/card rendering |
| @radix-ui/react-slot | 1.3 | Component composition |
| class-variance-authority | 0.7 | Component variants |
| clsx + tailwind-merge | Latest | Class name utilities |
| react-dropzone | 20.1 | File upload (admin import) |

### Route structure

#### User routes (public-facing)
| Route | Page | Auth required |
|-------|------|--------------|
| `/` or `/[locale]` | Landing — session picker | No |
| `/login` or `/[locale]/login` | User login | No |
| `/register` or `/[locale]/register` | User registration | No |
| `/forgot-password` or `/[locale]/forgot-password` | Password reset request | No |
| `/reset-password` or `/[locale]/reset-password` | Password reset form | No |
| `/app` or `/[locale]/app` | User dashboard | Yes |
| `/app/questions` or `/[locale]/app/questions` | Question flow (3 layers) | Yes |
| `/app/chart` or `/[locale]/app/chart` | Birth chart view | Yes |
| `/app/remedy` or `/[locale]/app/remedy` | Remedy view | Yes |
| `/profile` or `/[locale]/profile` | User profile + edit | Yes |
| `/history` or `/[locale]/history` | Reading session list | Yes |
| `/history/[id]` or `/[locale]/history/[id]` | Reading session detail | Yes |

#### Admin routes
| Route | Page | Auth required |
|-------|------|--------------|
| `/admin/login` | Admin login | No |
| `/admin/forgot-password` | Admin password reset request | No |
| `/admin/reset-password` | Admin password reset form | No |
| `/admin` | Admin dashboard (overview + modules) | Yes (admin) |
| `/admin/questions` | Question management | Yes (admin) |
| `/admin/answers` | Answer management + AI review | Yes (admin) |
| `/admin/remedies` | Remedy management | Yes (admin) |
| `/admin/chart-config` | Chart configuration | Yes (admin) |
| `/admin/import` | Excel import | Yes (admin) |
| `/admin/languages` | Language + translation management | Yes (admin) |
| `/admin/users` | User list + detail | Yes (admin) |
| `/admin/audit-log` | Admin activity trail | Yes (admin) |

#### API proxy routes (Next.js → NestJS)
All under `apps/web/src/app/api/`:
- `/api/auth/*` — login, register, logout, change-password, forgot/reset-password (admin + user)
- `/api/questions`, `/api/answers`, `/api/responses` — user flow proxies
- `/api/users/*` — profile, chart, remedy, sessions, dashboard, history
- `/api/admin/*` — all admin content management proxies

### Components (38 total)
| Directory | Components | Purpose |
|-----------|-----------|---------|
| `ui/` | Button, Input, Label, ScreenState | Base UI primitives |
| `auth/` | AuthCard, AuthSessionProvider, SignOutButton, PasswordField, ChangePasswordCard, ForgotPasswordCard, ResetPasswordCard | Auth flow |
| `admin/` | AdminShell, AdminSidebar, AdminHeader, SidebarContext, AdminAuthSessionProvider, AdminLoginCard, DashboardOverview, QuestionsAdmin, AnswersAdmin, RemediesAdmin, ChartConfigAdmin, LanguagesAdmin, ImportAdmin, UsersAdmin, AuditLogAdmin, OpenUserAppButton | Admin panel |
| `session/` | SessionPicker | Language/category selection |
| `chart/` | SampleKundli, BirthChartView | Astrology chart rendering |
| `roxy-ui/` | VedicKundli, DoshaCard, VedicPlanetsTable | @roxyapi/ui wrappers |
| `questions/` | QuestionFlow | 3-layer Q&A stepper |
| `profile/` | ProfileDetailsCard | Profile display/edit |
| `shared/` | PlacesAutocomplete | Location search |
| Root | ThemeProvider, ThemeToggle | Dark mode |

### i18n
- **Library:** next-intl with App Router integration
- **Locales:** en, zh, hi, es, ar, fr, bn, pt, ru, ja, te
- **RTL:** Arabic (`ar`) sets `dir="rtl"` on `<html>`
- **Message files:** `apps/web/src/messages/{locale}.json` — UI strings only; content translations come from the API
- **Routing:** `[locale]` dynamic segment with middleware redirect

### Styling
- **Tailwind v4** with PostCSS
- **CSS variables** for semantic colors: `--background`, `--foreground`, `--card`, `--muted`, `--primary`, `--secondary`, `--accent`, `--border`, `--ring`
- **Dark mode:** `.dark` class variant (next-themes), separate CSS variable values
- **Roxy variables:** `--roxy-*` mapped from Silence tokens for @roxyapi/ui theming
- **Font:** Inter via `font-family` declaration (not loaded from Google Fonts CDN)
- **Border radius:** `--radius: 0.5rem` with sm/md/lg computed variants

### Current color palette `CURRENT`
| Token | Light (OKLCH) | Dark (OKLCH) | Approx appearance |
|-------|------|------|---------|
| `--primary` | `oklch(0.45 0.12 174)` | `oklch(0.68 0.13 174)` | Teal/cyan |
| `--secondary` | `oklch(0.9 0.045 70)` | `oklch(0.35 0.05 66)` | Warm beige |
| `--accent` | `oklch(0.7 0.13 22)` | `oklch(0.72 0.15 22)` | Warm orange/coral |
| `--background` | `oklch(0.985 0.008 95)` | `oklch(0.16 0.016 250)` | Near white / deep navy |
| `--foreground` | `oklch(0.2 0.018 260)` | `oklch(0.94 0.012 95)` | Near black / near white |

---

## 4. Shared Package — `packages/shared` `CURRENT`

- **Enums:** Category, Level, AnswerSource, ChartStyle, ImportType, ImportStatus, ReadingSessionStatus, NextStep, AdminAuditAction
- **Types:** All API response types (Question, Answer, Remedy, UserChart, UserProfile, ReadingSession, DashboardSummary, AdminDashboardMetrics, ContentMatrix, etc.)
- **Schemas:** Zod schemas for all API request payloads (login, register, create question/answer/remedy, etc.)
- **Languages:** 11 language definitions with name, code, RTL flag
- **Constants:** API_PREFIX (`/api/v1`), API_PORT (3010)

---

## 5. Infrastructure `CURRENT`

- **Docker Compose:** Postgres 16 + Redis 7 for local development
- **Deployment:** `/opt/silence` on Hostinger VPS (Ubuntu 24.04), systemd units, Nginx reverse proxy
- **TLS:** Let's Encrypt via certbot
- **CI/CD:** GitHub Actions — lint, typecheck, build, API tests (≥70% coverage gate), Playwright e2e
- **Backups:** Nightly `pg_dump` with 14-day rotation, 5-minute health checks

---

## 6. Documentation `CURRENT`

| File | Content |
|------|---------|
| `docs/REQUIREMENTS.md` | Investor requirements (13 Aug 2026) — 5 content layers, categories, languages |
| `docs/ARCHITECTURE.md` | Stack decisions, monorepo layout, mobile Phase 2 plan |
| `docs/API.md` | Complete REST API specification (27 endpoints) |
| `docs/DEPLOYMENT.md` | VPS deployment guide + live handover record |
| `docs/DEVELOPMENT.md` | Local dev setup guide |
| `docs/PLAN.md` | Build plan (P0–P12) — all phases complete |
| `docs/WORLD_CLASS_PRODUCT_GAP_ANALYSIS.md` | Feature gap analysis + 10-phase improvement plan |

---

## 7. Templates `CURRENT`

Three template repositories are included as reference material. They are **not deployed** — specific patterns were adapted into the app during Phases 4–6:

| Template | What was adopted | What remains unused |
|----------|-----------------|---------------------|
| TailAdmin | Admin sidebar/header shell, card layout patterns | Dense data tables, analytics charts, profile/settings depth, calendar/notification patterns |
| SaaS Starter | Auth card layout, route protection middleware, session cookie pattern | Activity feed, team/billing, structured onboarding, device session management |
| @roxyapi/ui | Birth chart rendering (VedicKundli, PlanetsTable), Roxy theme variables | Location search widget, aspect/dasha/transit components, dosha analysis, forecast digest, divisional charts |
