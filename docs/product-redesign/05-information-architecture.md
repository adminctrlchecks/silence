# Information Architecture

> Proposed page hierarchy and content organization.

---

## 1. Proposed Sitemap `PROPOSED`

```
Public (unauthenticated)
├── / ....................................... Homepage (new — replaces bare session picker)
├── /how-it-works ........................... How It Works (new)
├── /about ................................... About (new, optional P2)
├── /terms .................................... Terms & Conditions (new)
├── /privacy .................................. Privacy Policy (new)
├── /login .................................... User login (existing, enhanced)
├── /register ................................. User registration (existing, restructured)
├── /forgot-password .......................... (existing)
├── /reset-password ........................... (existing)
└── /admin/login ............................... Admin login (existing)

Authenticated — User App
├── /app ....................................... Dashboard (existing, restructured)
├── /app/questions ............................. Question flow (existing, improved)
├── /app/chart .................................. Birth chart (existing, improved)
├── /app/remedy ................................. Remedy (existing, improved)
├── /profile ..................................... Profile — split into sections (restructured)
│   ├── /profile (personal info)
│   ├── /profile/birth-details
│   └── /profile/security (password change — moved out of profile page)
├── /history ..................................... Reading history (existing, improved)
└── /history/[id] ................................ Reading detail (existing, improved)

Authenticated — Admin
├── /admin ....................................... Dashboard (existing, enhanced visuals)
├── /admin/questions .............................. (existing)
├── /admin/answers ................................ (existing)
├── /admin/remedies ............................... (existing)
├── /admin/chart-config ........................... (existing)
├── /admin/import .................................. (existing)
├── /admin/languages ............................... (existing)
├── /admin/users ................................... (existing)
├── /admin/audit-log ............................... (existing)
└── /admin/settings ................................ (new — password change moved here)

Error / Utility
└── /404 (not-found.tsx) ........................... New — currently missing
```

## 2. Rationale for Changes

| Change | Why |
|--------|-----|
| New homepage at `/` | Current `/` is a session picker with zero product explanation — see [03-current-state.md](03-current-state.md) |
| `/how-it-works` | Users need to understand the reading process before committing personal birth data |
| `/terms`, `/privacy` | Legal requirement for collecting DOB, birth time, birth place — currently absent entirely |
| Split `/profile` into sections | Current page mixes identity, birth details, and password change in one card |
| `/admin/settings` | Password change currently lives inline on the dashboard — not discoverable, not scalable |
| `not-found.tsx` | No custom 404 exists anywhere in the app today |

## 3. Content Grouping Logic

The IA follows the **five-layer domain model** ([02-product-understanding.md](02-product-understanding.md)) directly:

```
Public Marketing Layer  →  explains the product
Auth Layer               →  gets the user in
Reading Layer             →  questions → chart → remedy (the core product loop)
Account Layer             →  profile, history, security
Admin Layer                →  content operations (unchanged structure, polished UI)
```

## 4. Navigation Depth

- **Public pages:** 1 level deep, all reachable from a persistent top nav
- **User app:** 2 levels (`/app/questions`, `/app/chart`, etc. are siblings under `/app`)
- **History detail:** 2 levels (`/history/[id]`)
- **Admin:** 1 level, all reachable from the persistent sidebar (already well-structured — kept as-is)

## 5. URL Naming Conventions `DOCUMENTED`

Existing conventions to preserve:
- kebab-case for multi-word segments (`forgot-password`, `chart-config`, `audit-log`)
- Resource-based nouns, not verbs (`/history`, not `/view-history`)
- Locale prefix applied uniformly via `next-intl` routing (`/{locale}/...`) — note: this currently causes route duplication between `(user)`/`(auth)` and `[locale]/(user)`/`[locale]/(auth)` (files re-export from the non-locale versions). This pattern should be preserved as-is since it's how next-intl's App Router integration works, but documented so it isn't mistaken for genuine duplication during redesign — see [06-route-and-page-inventory.md](06-route-and-page-inventory.md)
