# UI/UX Audit & Implementation Plan

> Source spec: `docs/analasis.txt`. This doc is the working record for that task — findings first, plan second, updated as work proceeds (same pattern as `product-redesign/IMPLEMENTATION_PROGRESS.md`).

## 0. Scope & method

Read every route under `apps/web/src/app` (public, `(auth)`, `(admin-auth)`, `(user)`, `(admin)`, plus their `[locale]` re-export twins), every shared component under `apps/web/src/components/{ui,navigation,layout,admin,auth,profile,questions,chart,legal,dashboard}`, `globals.css` (design tokens), and representative admin table/detail pages. No files were modified.

## 1. Executive summary

The Phase 1–10 redesign already put a real, coherent design-token system in place: one color/typography/spacing/radius/shadow token set in `globals.css`, a consistent primitive library (`Button`, `Input`, `Select`, `Textarea`, `Alert`, `Dialog`, `Drawer`, `Toast`, `ConfirmDialog`, `ScreenState`), a shared `PageContainer`, and broadly-applied RTL/dark-mode/a11y handling. This is not a from-scratch rebuild situation.

Two real, systemic problems stand out, plus a handful of smaller component-reuse gaps:

- **Finding 1 (HIGH):** User and Admin sign-in are two disconnected experiences — a full separate route/component reachable only via a small footer/drawer link — exactly what `analasis.txt` §3 says to fix.
- **Finding 2 (HIGH):** Every authenticated "app shell" page (dashboard, questions, chart, remedy, history ×2, profile ×4) bypasses the shared `PageContainer` and hand-rolls its own arbitrary max-width, so pages that are steps in the same journey don't share a layout grid with each other or with the nav/footer above them.
- **Findings 3–5 (MED/LOW):** Raw `<select>`/`<input>`/`<textarea>` markup duplicated instead of reusing `Select`/`Input`/`Textarea`; ad-hoc error/empty/loading markup duplicated instead of reusing `ScreenState`'s `LoadingState`/`EmptyState`/`ErrorState`.

## 2. Detailed findings

### Finding 1 — [HIGH] Split User/Admin authentication (`analasis.txt` §3)

- `/login` → `AuthCard` (`components/auth/auth-card.tsx`) is a fully separate route/component from `/admin/login` → `AdminLoginCard` (`components/admin/admin-login-card.tsx`). No toggle exists. The only path to admin sign-in is a small text link in `site-footer.tsx`'s "Trust" column and in `public-navbar.tsx`'s mobile drawer footer — precisely the "separate Admin Sign-in section" pattern §3 says to remove.
- The two cards already share near-identical chrome (same `rounded-md border bg-card p-5 shadow-sm`, size-10 icon badge, `h1`, form spacing, error-banner style) — unifying is a composition change, not a redesign.
- Backends genuinely differ and must be preserved: separate cookies (`USER_TOKEN_COOKIE` / `ADMIN_TOKEN_COOKIE`), separate endpoints (`/api/auth/login` vs `/api/auth/admin/login`), separate middleware redirect logic in `lib/auth-routing.ts` (`decideUserRoute` vs `decideAdminRoute`, which hardcodes `/admin/login` as the admin auth path and public route).
- **Fix:** build one shared sign-in card with a segmented `[User][Admin]` toggle at the top, default `User`. Selecting a mode swaps the field set + submit handler + endpoint, not the surrounding card/container/spacing. Keep both `/login` and `/admin/login` as routes (middleware depends on `/admin/login` existing) but render both through the shared component — `/login` defaults to the User tab, `/admin/login` defaults to the Admin tab. Remove the standalone "Admin sign in" links from `site-footer.tsx` and the mobile drawer in `public-navbar.tsx` (or repoint them at `/login` with the Admin tab pre-selected). Retire `admin-login-card.tsx`'s bespoke markup.
- **Files:** `components/auth/auth-card.tsx` (evolve), `components/admin/admin-login-card.tsx` (retire), `app/(auth)/login/page.tsx`, `app/(admin-auth)/admin/login/page.tsx`, `components/navigation/site-footer.tsx`, `components/navigation/public-navbar.tsx`, `app/[locale]/(auth)/login/page.tsx`.
- **Preserve exactly:** register flow (untouched, no admin equivalent), Google Sign-In button (user-mode only), admin forgot/reset-password routes, redirect targets (`/app` vs `/admin`).

### Finding 2 — [HIGH] Inconsistent page container / max-width across the app shell (§4, §7, §9)

`grep` of `mx-auto w-full max-w-` under `app/(user)` returns 17 hand-rolled instances, each a different, arbitrary width:

| Width | Pages |
|---|---|
| `max-w-2xl` | `/profile/security` |
| `max-w-3xl` | `/profile/privacy` |
| `max-w-4xl` | `/profile`, `/profile/birth-details`, `/app/remedy` |
| `max-w-5xl` | `/app/questions`, `/history`, `/history/[id]` |
| `max-w-6xl` | `/app` (dashboard) |
| `max-w-7xl` | `/app/chart` |

All use only two padding breakpoints (`px-4`, `sm:px-6`) — missing the `lg` step that the shared `.page-container` utility has (2rem at ≥64rem). Meanwhile the navbar, footer, mobile app-nav bar, homepage, and legal pages all consistently use `PageContainer` / `.page-container(-wide|-narrow|-reading)` with the token-driven `--container-*-width` values and the full 3-step gutter scale (1rem/1.5rem/2rem).

Effect: page content's left edge doesn't line up with the nav/logo above it at common desktop widths, and every page in one continuous journey (dashboard → questions → chart → remedy → history) has an unrelated content width from its neighbor — the literal "one dashboard card appearing visually unrelated to another" and "consistent card widths" complaints in §7/§9.

- **Fix:** replace every hand-rolled `<main className="mx-auto w-full max-w-Nxl px-4 py-8 sm:px-6">` with `<PageContainer as="main" size="…" className="py-8">`, settling on 2–3 tiers instead of 7:
  - `app`/`wide` (existing 70rem/80rem tokens) → dashboard, chart (in-page nav/tables/data-dense).
  - `reading` (existing 55rem token) → questions, remedy, history, history detail, profile, profile/birth-details, profile/privacy (prose + card content).
  - `narrow` (existing 45rem token) → profile/security (single small form).
- **Files (12 pages + loading/error twins + `[locale]` re-exports):** `app/(user)/app/page.tsx` (+`loading.tsx`/`error.tsx`), `app/(user)/app/chart/page.tsx` (+`loading`/`error`), `app/(user)/app/questions/page.tsx`, `app/(user)/app/remedy/page.tsx`, `app/(user)/history/page.tsx` (+`loading`/`error`), `app/(user)/history/[id]/page.tsx`, `app/(user)/profile/page.tsx` (+`loading`/`error`), `app/(user)/profile/birth-details/page.tsx`, `app/(user)/profile/security/page.tsx`, `app/(user)/profile/privacy/page.tsx`, and their `app/[locale]/(user)/...` twins.

### Finding 3 — [MED] Raw `<select>` markup duplicated instead of the shared `Select` primitive (§2, §10)

`components/ui/select.tsx` exists (adds the chevron-down affordance + invalid/success state styling) but isn't used by `auth-card.tsx` (register step 1 category/language), `profile-overview-card.tsx` (category/language), `users-admin.tsx` (category filter, sort-by), and the same hand-rolled pattern appears in the other admin `*-admin.tsx` filter bars (confirmed via grep across 6+ admin files). Functionally fine, but no dropdown affordance and any future token/visual tweak to `Select` won't reach them.

- **Fix:** swap these for `<Select>` — drop-in, same classes it already replicates by hand.

### Finding 4 — [MED] Raw `<input>`/`<textarea>` in the question flow, with visible style drift (§2, §10)

`components/questions/question-flow.tsx` hand-rolls its own text input and textarea instead of `<Input>`/`<Textarea>`, and the hand-rolled classes have already drifted from the shared ones: `min-h-24` vs the shared `Textarea`'s `min-h-28`, `bg-card` vs the shared components' `bg-background`. This is the exact failure mode §2 warns against.

- **Fix:** replace with `<Input>` / `<Textarea>`.

### Finding 5 — [LOW-MED] Inconsistent error/empty/loading treatment vs. the shared `ScreenState` components (§1, §2)

`components/ui/screen-state.tsx` defines `LoadingState`/`EmptyState`/`ErrorState` with one visual language (icon + card + optional retry action), and they're used for the top-level `loading.tsx`/`error.tsx` route boundaries. But most in-component states — `dashboard-overview.tsx`, `users-admin.tsx`, and by the same pattern the other admin table components — hand-roll near-duplicate markup instead: a plain `<p role="alert" className="...px-3 py-2 text-sm text-destructive">` with no icon and no retry affordance, coexisting with `ErrorState`'s icon+padding+retry-button version elsewhere in the same product. Confirmed via grep: 17 files reproduce the destructive-alert pattern by hand.

- **Fix:** standardize section/page-level error and empty states on the existing shared components; tight inline field-validation errors can stay as-is (that's a different, correctly-scoped pattern).

## 3. Deliberately not flagged

- Color/typography/spacing/radius/shadow tokens — already one coherent set, used consistently everywhere sampled.
- Dark mode / RTL — token-driven and logical-property-based (`start`/`end`, drawer side-flipping, `rtl:rotate-180`) throughout; will re-verify visually once the above land, not re-litigating here.
- Accessibility primitives (focus trap, ARIA, `role=progressbar`, `aria-live`) — already implemented per the Phase 2 redesign; the fix here is consistency (Finding 5), not missing a11y architecture.
- Admin English-only terminology — intentional, per `open-decisions.md` #10.

## 4. Implementation plan

**Phase A — Branch.** `feat/uiux-audit-fixes` off current `main` (repo convention: no direct edits/pushes to `main`).

**Phase B — Shared components first.**
- B1. Swap remaining raw `<select>` for `<Select>` (Finding 3).
- B2. Swap question-flow's raw input/textarea for `<Input>`/`<Textarea>` (Finding 4).
- B3. Standardize section-level loading/empty/error in `dashboard-overview.tsx` and the admin table components on `ScreenState` (Finding 5).

**Phase C — Authentication unification (Finding 1).**
- C1. Build the shared toggle card; retire `admin-login-card.tsx`'s bespoke markup.
- C2. Wire `/login` and `/admin/login` to it with the correct default tab.
- C3. Remove/repoint the standalone footer + mobile-drawer "Admin sign in" links.
- C4. Verify: user login, user register (untouched), admin login, admin forgot/reset-password links, redirect targets, Google button only in User mode.

**Phase D — App-shell container normalization (Finding 2).**
- D1. Apply the container-tier mapping above.
- D2. Apply consistently across all listed pages + loading/error twins + `[locale]` re-exports.

**Phase E — Re-verify.** Typecheck/lint/build for `@silence/web`; dev-server pass at 1280/1366/1440/1536/1920 (desktop), 768/820/912/1024 (tablet), 320/360/375/390/414/430 (mobile) across `/`, `/login` (both tabs), `/register`, `/app`, `/app/questions`, `/app/chart`, `/app/remedy`, `/history`, `/history/[id]`, all 4 `/profile` tabs, `/terms`, `/privacy`, `/admin` (+ a couple of table pages) — dark mode and one RTL locale (`/ar`) pass on changed pages.

**Phase F — Update this doc's summary against §16's checklist; commit in small reviewable chunks per sub-phase.**

## 5. Open decisions — resolved

1. Auth unification: two routes, one shared toggle card, different default tabs. Confirmed and implemented.
2. Container-tier mapping: applied as proposed. Confirmed and implemented.
3. Branch: `feat/uiux-audit-fixes`. Confirmed.
4. `admin-login-card.tsx`: deleted outright — no other importers (confirmed via grep before removal).

## 6. Implementation summary (post-fix)

All five findings implemented on `feat/uiux-audit-fixes`, verified with `typecheck`/`lint`/`build` after each phase plus a live dev-server pass (both locales, mobile viewport, redirect-when-signed-out regression checks). Not merged or pushed — that, and the VPS deploy, remain the user's call per this repo's established hard constraints.

| Finding | Commit | What changed |
|---|---|---|
| 3 — raw `<select>` | `61b6cd9` | ~30 hand-rolled selects across `auth-card.tsx`, `profile-overview-card.tsx`, and 8 admin components swapped for the shared `Select` |
| 4 — raw input/textarea | `a35cbb8` | `question-flow.tsx`'s drifted hand-rolled input/textarea swapped for `Input`/`Textarea` |
| 5 — ad-hoc error/loading states | `a35cbb8` | Page/section-level fetch-error banners in the admin dashboard overview and 5 admin list views, plus the dashboard's loading block, swapped for `ErrorState`/`LoadingState` (with retry actions). Compact, action-adjacent inline errors left as-is — a different, correctly-scoped pattern |
| 1 — split User/Admin auth | `4900228` | `AuthCard` gained a `[User][Admin]` toggle (default User); `/admin/login` now renders the same card defaulting to the Admin tab. `AdminLoginCard` retired. `Auth.toggleUser`/`toggleAdmin` added to all 11 locales |
| 2 — inconsistent app-shell containers | `7ab3f7c` | 18 pages (dashboard, chart, questions, remedy, history ×2, profile ×4, + loading/error twins) moved from 7 arbitrary `max-w-*` values onto 3 `PageContainer` tiers (`wide`/`reading`/`narrow`) |

**Verified, not just implemented:** live dev-server checks confirmed the auth toggle swaps fields/copy/Google-button/footer correctly in both directions, in Arabic (RTL) and English, with no horizontal overflow at 375px in either tab; `/admin/login` opens on the Admin tab; `/register` is unaffected (no toggle ever renders there); all protected app-shell routes still redirect to `/login` when signed out after the container swap; homepage/terms/privacy render with no console errors.

**Not independently re-verified (no live Postgres+API stack in this sandbox — same constraint noted throughout `product-redesign/IMPLEMENTATION_PROGRESS.md`):** the authenticated *content* of the 18 container-normalized pages (dashboard cards, chart, remedy, history entries, profile forms) — only their layout wrapper changed, and that wrapper is the same `PageContainer` component already proven correct elsewhere in the app (navbar, footer, homepage, legal pages, admin shell), but a real authenticated click-through at the new widths is worth doing before merge, same recommendation as prior phases.

**Deliberately left alone (out of scope, per the audit's own scoping):** `language-switcher.tsx`'s compact inline `<select>` (a different, intentionally minimal nav-chip control, not a form field); action-adjacent inline error banners right before a single form's submit button (import/chart-config/languages admin) — converting those to the larger `ErrorState` card would visually clutter a tight form-submit flow for no benefit.
