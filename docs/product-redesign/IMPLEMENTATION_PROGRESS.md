# Phase 2 — Implementation Progress & Loop State

> **Read this file first, every time you resume work.** It is the single source of truth for what is built, what is next, and how to keep going. Update it after every task you complete — before moving to the next one. This is the Phase 2 counterpart to `PROGRESS.md` (Phase 1, documentation, already complete).

---

## 0. Governing Spec

Phase 1 produced a complete blueprint in `docs/product-redesign/`. Phase 2 turns it into real, working code. The authority documents, in the order you need them:

1. **[33-implementation-roadmap.md](33-implementation-roadmap.md)** — the phase plan this file's checklist is built from.
2. **[32-priority-matrix.md](32-priority-matrix.md)** — P0/P1/P2/P3 ranking; P0 must be fully done before anything is called production-ready.
3. **[open-decisions.md](open-decisions.md)** — every `NEEDS DECISION` item has a **recommended default**. Where a task below is blocked by one, apply that default and keep moving. Do not stop to ask.
4. **The 30+ spec files (06–31)** — each covers one concern (navigation, color, typography, components, page specs, a11y, i18n, responsive, SEO, performance, security, etc.). Read the relevant spec file(s) before implementing the matching task — they contain the actual acceptance detail this checklist doesn't repeat.
5. **[34-qa-acceptance-criteria.md](34-qa-acceptance-criteria.md)** — testable criteria; use it as your verification checklist per page/flow.
6. **[35-final-implementation-checklist.md](35-final-implementation-checklist.md)** and **[36-final-gap-analysis.md](36-final-gap-analysis.md)** — what "done" looks like.

## 1. Hard Constraints (do not violate)

1. **Work on a dedicated branch**, not `main` — e.g. `feat/product-redesign-v2`. Create it first if it doesn't already exist. Commit after each completed, verified task (small, reviewable commits, not one giant diff at the end).
2. **Never push to a remote, never deploy, never touch anything under `deploy/`, and never run destructive database commands.** Local commits only. The user reviews and merges/deploys separately.
3. **Never touch CtrlChecks**: no edits to `/opt/ctrlchecks-*`, no restart of its services, no reuse of its DB, no changes to shared infra outside this repo.
4. **Never expose or commit secrets.** `.env` files stay gitignored; never print their values into commits, comments, or generated code.
5. **Preserve existing business logic** (session lifecycle, remedy rule engine, auth, Prisma schema, API contracts) **unless a spec file explicitly calls for a change.** This is a UX/UI/IA redesign built on the current backend, not a rewrite of it. If a spec genuinely requires a backend change (e.g., new field), implement it precisely as scoped in the spec — nothing broader.
6. **Apply the recommended default from `open-decisions.md`** for anything tagged `NEEDS DECISION` rather than fabricating final content or stalling. In particular:
   - Legal pages (Terms/Privacy/Cookies): implement full page structure and real, product-accurate content per `19-legal-pages.md`, but mark the copy blocks clearly as `<!-- NEEDS LEGAL REVIEW -->` where the doc calls for reviewed legal language — do not fabricate binding legal terms.
   - No testimonials, user counts, logos, awards, or certifications anywhere — ever.
   - Business model: build for the free/admin-operated model. Do not add billing, pricing, paywalls, or usage limits.
   - Admin UI stays English-only for this pass (per decision #10) — do not spend time localizing admin components.
   - **Google OAuth is IN SCOPE for Phase 2's authentication work**, not deferred: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` already exist in `apps/api/.env` (real Google Cloud OAuth credentials, already created by the user). Implement it end-to-end (passport-google-oauth20 strategy + controller routes + `googleId` on the `User` model + "Continue with Google" UI) as part of Phase 4 — do not ship a fake/disabled button, and do not skip it citing the open-decision as unresolved; the decision is resolved by this instruction.
7. **Keep the app buildable and green at every checkpoint.** After each task: run typecheck, lint, and build for whatever workspace(s) you touched (`pnpm --filter @silence/web typecheck`, `pnpm --filter @silence/api typecheck`, `pnpm build`, `pnpm lint`, and relevant tests). Never move to the next task with a red build.
8. **Do not stop to ask the user questions.** If you hit something genuinely unresolvable (not covered by any spec file or open-decision default), make the most conservative, spec-consistent choice, note it in this file's log, and continue.
9. **Do not silently skip a P0 item.** If a P0 task turns out to be larger than expected, break it into sub-tasks in §3 rather than deferring it past P1/P2 work.

## 2. Completed Tasks Log

*(Append one row per completed task as you go — file(s) touched, what changed, how it was verified, commit hash.)*

| Phase | Task | Files touched | Verified via | Commit |
|-------|------|----------------|---------------|--------|
| Phase 0 | Create branch `feat/product-redesign-v2` from current `main` | `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `git branch --show-current` | `1c3a982` |
| Phase 0 | Re-read roadmap, priority matrix, and open decisions | `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `Get-Content -Raw` for all three planning docs | `bd90466` |
| Phase 0 | Confirm task breakdown matches specs | `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `Test-Path` check for cited spec files | `b0c1d3e` |
| Phase 1 | Implement color/status/destructive tokens | `apps/web/src/app/globals.css`, `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/` light/dark desktop and `/ar` mobile RTL | `a6c0c5a` |
| Phase 1 | Implement typography/spacing/container/radius/shadow tokens | `apps/web/src/app/globals.css`, `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/` light/dark desktop and `/ar` mobile RTL | `8cedc4a` |
| Phase 1 | Expand `components/ui` form, feedback, and navigation primitives | `apps/web/src/components/ui/button.tsx`, `apps/web/src/components/ui/input.tsx`, `apps/web/src/components/ui/textarea.tsx`, `apps/web/src/components/ui/select.tsx`, `apps/web/src/components/ui/checkbox.tsx`, `apps/web/src/components/ui/form-field.tsx`, `apps/web/src/components/ui/alert.tsx`, `apps/web/src/components/ui/skeleton.tsx`, `apps/web/src/components/ui/link.tsx`, `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/login` light/dark desktop and `/ar/login` mobile RTL | `be4d2e5` |
| Phase 1 | Add Dialog, Drawer, and Toast primitives | `apps/web/src/app/layout.tsx`, `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/drawer.tsx`, `apps/web/src/components/ui/toast.tsx`, `apps/web/src/components/ui/use-overlay-focus.ts`, `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/login` light/dark desktop and `/ar/login` mobile RTL | `c31d806` |
| Phase 1 | Verify light/dark contrast and RTL basics on primitives | `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | Token contrast audit script for light/dark semantic pairs; `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/login` light/dark desktop and `/ar/login` mobile RTL (`dir=rtl`) | `0d9e54d` |
| Phase 2 | Add public navbar, language switcher, mobile drawer, and footer legal links | `apps/web/src/app/(user)/layout.tsx`, `apps/web/src/components/navigation/nav-links.ts`, `apps/web/src/components/navigation/language-switcher.tsx`, `apps/web/src/components/navigation/public-navbar.tsx`, `apps/web/src/components/navigation/site-footer.tsx`, `apps/web/src/components/ui/dialog.tsx`, `apps/web/src/components/ui/drawer.tsx`, `docs/product-redesign/IMPLEMENTATION_PROGRESS.md` | `pnpm --filter @silence/web typecheck`; `pnpm --filter @silence/web lint`; `pnpm --filter @silence/web build`; Playwright smoke screenshots for `/` light/dark desktop and `/ar` mobile RTL, including mobile drawer Escape close | pending |

## 3. Work Queue (in roadmap order — P0 items are distributed across phases 1–6 and 8; do not reorder across phases, but within a phase prefer P0 tasks first)

### Phase 0 — Decisions & Setup
- [x] Create branch `feat/product-redesign-v2` from current `main`.
- [x] Re-read `33-implementation-roadmap.md`, `32-priority-matrix.md`, `open-decisions.md` in full.
- [x] Confirm this file's task breakdown still matches the specs (specs are the source of truth if they've been edited since this file was written); adjust checklist rows below if needed.

### Phase 1 — Design System `P0`
- [x] Implement color/status/destructive tokens per [09-color-system.md](09-color-system.md) and [12-design-tokens.md](12-design-tokens.md) in `apps/web/src/app/globals.css`.
- [x] Implement typography/spacing/container/radius/shadow tokens per [10-typography-system.md](10-typography-system.md), [11-spacing-grid-layout.md](11-spacing-grid-layout.md), [12-design-tokens.md](12-design-tokens.md).
- [x] Expand `components/ui/`: Button variants, Link, FormField, Input, Textarea, Select, Checkbox, Alert, Skeleton per [13-component-system.md](13-component-system.md).
- [x] Add Dialog/Drawer/Toast primitives (needed by later phases — admin confirm dialogs, mobile nav drawer, form feedback).
- [x] Verify light/dark contrast (WCAG AA) and RTL basics on the new primitives per [21-accessibility.md](21-accessibility.md).

### Phase 2 — Global Shell `P0` (mobile nav), `P1` (rest)
- [x] Public navbar + footer per [07-navigation-architecture.md](07-navigation-architecture.md) — footer must include legal links (P0, since Terms/Privacy don't exist yet, link them now and build the pages in Phase 8).
- [ ] User app navigation: mobile bottom nav / drawer, profile menu.
- [ ] Accessible mobile drawer/menu (focus trap, ESC to close, `aria-*`).
- [ ] Custom `not-found.tsx` (404) at the appropriate route-group levels.
- [ ] Shared page container/layout components used consistently across public/user/admin shells.

### Phase 3 — Public Experience `P0`
- [ ] Replace the `/` session-picker homepage per [15-homepage-specification.md](15-homepage-specification.md) — hero, product visual/demo, how-it-works, benefits, trust/privacy section, start panel, FAQ, final CTA, footer.
- [ ] `/how-it-works` page if not fully absorbed into the homepage, per [14-page-specifications.md](14-page-specifications.md).
- [ ] Per-page metadata/SEO (title, description, OG tags, canonical) per [28-seo.md](28-seo.md) — replace the single global `<title>`/`<meta description>`.
- [ ] Favicon, app icon, OG image per [24-image-and-asset-strategy.md](24-image-and-asset-strategy.md) — `apps/web/public/` is currently empty; populate it. Use only licensed/owned sources (Unsplash/Pexels/Lucide licenses as already referenced in the Phase 1 docs) — never unlicensed stock art.

### Phase 4 — Authentication `P0` (registration restructuring, legal links), `P1` (rest)
- [ ] Restructure `/register` into progressive steps with a birth-data "why we ask" explanation, per [18-authentication-flows.md](18-authentication-flows.md).
- [ ] Add Terms/Privacy links and consent copy to registration.
- [ ] Improve `/login`, `/forgot-password`, `/reset-password` visual hierarchy and states.
- [ ] Move password-change UX out of `/profile` into the new settings/security area (coordinate with Phase 7).
- [ ] **Implement Google OAuth end-to-end** (user-facing; admin OAuth out of scope):
  - Backend: `passport-google-oauth20` strategy, `GET /auth/user/google` + `GET /auth/user/google/callback` routes, add nullable `googleId` (and any needed fields) to the `User` Prisma model + migration, handle account linking when an email already exists.
  - Frontend: "Continue with Google" button on `AuthCard` (both login and register modes), callback handling, cookie issuance matching the existing user-auth cookie pattern.
  - Verify against the real credentials already in `apps/api/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`) — do not regenerate or invent new ones.

### Phase 5 — Application Shell & Dashboard `P0`
- [ ] Redesign `/app` around next-action + journey tracker per [16-dashboard-specification.md](16-dashboard-specification.md).
- [ ] Implement first-time / in-progress / returning / complete dashboard states.
- [ ] Move the quick-links grid into nav/secondary region rather than the primary content area.
- [ ] Mobile-first dashboard layout.

### Phase 6 — Core Product Pages `P1`
- [ ] Question flow: improved stepper, cards, save-state indicators, focus management per [14-page-specifications.md](14-page-specifications.md).
- [ ] Chart: plain-language summary above the technical data, accuracy badge, accessible chart/table pairing, clear next-step CTA.
- [ ] Remedy: structured practice card (what/why/how-often), "why selected" copy in plain language, completion state.
- [ ] History + detail: visual timeline, pagination/load-more, better partial-data states.

### Phase 7 — Profile & Settings `P1`
- [ ] Split `/profile` into Overview / Birth Details / Security / Privacy sections per [17-profile-settings-specification.md](17-profile-settings-specification.md).
- [ ] Password change lives under Security.
- [ ] Add a Privacy/data-handling section reflecting the manual-request model from `open-decisions.md` #3 (no self-serve export/delete claims).
- [ ] Add an admin settings route (`/admin/settings`) for admin password/security, out of the dashboard page.

### Phase 8 — Legal & Trust `P0`
- [ ] Implement `/terms` and `/privacy` page layout and structure per [19-legal-pages.md](19-legal-pages.md), with content marked for legal review where the spec calls for it.
- [ ] Add the chart/remedy disclaimer copy (concise on-page note, per decision #5) and link to the fuller Terms section.
- [ ] Add a Cookies section within Privacy (essential cookies only, per decision #14) — no separate tracking/consent banner since no analytics/marketing cookies are in scope.

### Phase 9 — Admin Quality & Operations `P1`
- [ ] Add pagination to `/admin/questions`, `/admin/answers`, `/admin/remedies` (currently `limit=100`, no UI pagination — content silently truncates).
- [ ] Replace all `window.confirm()` calls with the new Dialog primitive from Phase 1.
- [ ] Improve AI-review queue, import-failure, and user-timeline views per [01-repository-audit.md](01-repository-audit.md) findings and [13-component-system.md](13-component-system.md).
- [ ] Add mobile filter/search patterns to admin list views.

### Phase 10 — Accessibility, Responsive, Performance, SEO, QA `P0`/`P1` (this phase gates "done")
- [ ] WCAG 2.2 AA pass across all touched pages per [21-accessibility.md](21-accessibility.md).
- [ ] Mobile + RTL (Arabic) screenshot/manual pass across the full user journey.
- [ ] Lighthouse/Core Web Vitals pass per [27-performance.md](27-performance.md).
- [ ] Sitemap/robots/canonical/hreflang verification per [28-seo.md](28-seo.md).
- [ ] Extend Playwright coverage for mobile and the key flows touched in this redesign.
- [ ] Run the full checklist in [34-qa-acceptance-criteria.md](34-qa-acceptance-criteria.md) and fix anything that fails.

## 4. Loop Protocol

Repeat until every box in §3 is checked:

1. Pick the next unchecked task, in phase order, P0 items within reach first.
2. **Analyze:** read the cited spec file(s) fully; read the current implementation of whatever you're changing.
3. **Plan:** decide the minimal correct change that satisfies the spec — do not gold-plate, do not refactor unrelated code.
4. **Implement** the change.
5. **Verify:** typecheck + lint + build for every workspace touched; run relevant existing tests; for UI changes, load the page in the dev server (light + dark, desktop + mobile viewport, and at least one RTL locale for user-facing pages) and visually confirm against the spec's acceptance criteria; fix anything broken before moving on.
6. **Commit** on the feature branch with a clear message referencing the roadmap phase/task.
7. **Update state:** check the box in §3, append a row to §2's log.
8. **Continue immediately** to the next unchecked task — no stopping, no summarizing back to the user mid-run, no questions. Apply §1.6 for anything decision-blocked.

## 5. Definition of Done

Every box in §3 is checked, every commit left the tree green, and the "Definition Of Done For Redesign Implementation" section at the bottom of [33-implementation-roadmap.md](33-implementation-roadmap.md) is satisfied: P0 items from the priority matrix are complete, legal pages are live (structure + review-flagged copy), the core user journey works on mobile/desktop/RTL, admin can operate content without truncation or native-confirm issues, and the accessibility/performance/SEO checks in Phase 10 pass. Only then stop, and report: branch name, full list of commits, any conservative decisions you made under §1.8, and anything from `open-decisions.md` that still blocks true production legal/brand finality (since those genuinely need the user/legal, not more engineering).
