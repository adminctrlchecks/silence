# Navigation Architecture

> Global navigation recommendation for public, authenticated user, and admin experiences. Based on [05-information-architecture.md](05-information-architecture.md), [06-route-and-page-inventory.md](06-route-and-page-inventory.md), and inspected layout components.

---

## 1. Current Navigation Summary

- User/public pages currently share `apps/web/src/app/(user)/layout.tsx`, which renders a simple 64px header with `Silence`, `My session`, auth/admin links, sign out, and theme toggle. `CURRENT`
- The current user shell has no footer, no mobile menu, no profile menu, no language selector in the header, and no route-aware active states. `CURRENT`
- Admin pages use `AdminShell`, `AdminSidebar`, and `AdminHeader` with a collapsible desktop sidebar, mobile overlay sidebar, page title, scoped search for questions/answers/remedies, theme toggle, admin-as-user button, and sign out. `CURRENT`
- Admin navigation is substantially closer to the target product than public/user navigation. `CURRENT`

## 2. Navigation Principles

1. Public navigation should answer "what is this, how does it work, can I trust it, and how do I start?" `PROPOSED`
2. User-app navigation should keep the reading journey primary: Dashboard, Questions, Chart, Remedy, History, Profile. `PROPOSED`
3. Admin navigation should remain operational and dense; do not make it marketing-like. `PROPOSED`
4. Legal/privacy links should be available from every public and authenticated user page. `PROPOSED`
5. Mobile navigation must be intentional rather than the desktop header squeezed into a row. `PROPOSED`

## 3. Public Desktop Navbar

| Element | Recommendation | Status |
|---|---|---|
| Logo | Left-aligned wordmark "Silence" with a refined mark; current single-letter admin square is not enough for public brand. | `PROPOSED` |
| Primary links | `How it works`, `About` (optional), `FAQ` section link, `Privacy`. | `PROPOSED` |
| Language selector | Compact menu showing current locale/native language; write locale cookie and route to localized path. | `PROPOSED` |
| Theme toggle | Keep, but place after language/profile controls so it does not compete with conversion CTA. | `CURRENT` `PROPOSED` |
| Auth actions | `Sign in` secondary, `Start reading` primary. | `PROPOSED` |
| Admin link | Remove from public primary nav; place in footer or low-emphasis menu. Current page shows it repeatedly. | `CURRENT` `PROPOSED` |

## 4. Public Mobile Navbar

- Use a 56-64px top bar with logo, language control, and menu button. `PROPOSED`
- Menu drawer should contain public links, sign in, start reading, theme toggle, and admin link at the bottom. `PROPOSED`
- Touch targets should be at least 44px high. `PROPOSED`
- Drawer must trap focus while open, close on Escape/backdrop, restore focus to the menu button, and respect RTL. `PROPOSED`

## 5. User App Navigation

### Desktop

Recommended structure: keep a top header for brand/account controls and add a compact app nav row or sidebar depending on implementation cost. `PROPOSED`

| Area | Links/Controls | Notes |
|---|---|---|
| Brand | Silence mark + wordmark links to `/app` for authenticated users. | Avoid sending signed-in users to marketing homepage unless explicitly requested. |
| Primary app nav | Dashboard, Questions, Chart, Remedy, History. | Use active route indicators and icons from `lucide-react`. |
| Account controls | Profile menu with Profile, Security, Privacy, Sign out. | Current sign-out button is exposed as a standalone header control. |
| Language | Current language selector with native names. | Current language/category selection is only prominent on homepage/register. |
| Status | Optional small reading-status pill derived from active session. | Reinforces progress without clutter. |

### Mobile

Use bottom navigation for the five core app destinations: Dashboard, Questions, Chart, Remedy, History. `PROPOSED`

- Profile/settings stay in the top-right account menu. `PROPOSED`
- Bottom nav icons should be labeled, route-aware, and safe-area aware. `PROPOSED`
- If the current session has a required next action, the dashboard's primary CTA remains the dominant action; bottom nav is secondary. `PROPOSED`

## 6. Admin Navigation

### Keep

- Collapsible sidebar with icons and labels. `CURRENT` `PROPOSED`
- Mobile sidebar overlay. `CURRENT` `PROPOSED`
- Section links: Overview, Questions, Answers, AI review, Remedies, Chart config, Import, Languages, Users, Audit log. `CURRENT` `PROPOSED`
- Scoped search in admin header for questions/answers/remedies. `CURRENT`

### Improve

| Gap | Recommendation | Status |
|---|---|---|
| English-only nav labels | Internationalize only if admin team needs multilingual operation. | `NEEDS DECISION` |
| No admin settings route | Add `/admin/settings` for password/security controls. | `PROPOSED` |
| Review queue card is static copy | Show live unreviewed AI count and link to filtered queue. | `PROPOSED` |
| Sidebar active matching treats query link as same section | Keep section active, but add secondary indicator for AI review when query is active. | `PROPOSED` |
| Search hidden on mobile | Add mobile search button/sheet for dense content pages. | `PROPOSED` |

## 7. Footer Architecture

### Public Footer

| Group | Links | Status |
|---|---|---|
| Product | Home, How it works, Start reading, Sign in | `PROPOSED` |
| Trust | Privacy, Terms, Contact/Support | `PROPOSED` |
| Language/Region | Locale selector with native language names | `PROPOSED` |
| Admin | Admin sign in, low emphasis | `PROPOSED` |
| Copyright | Product name, year, legal owner | `NEEDS DECISION` |

### Authenticated User Footer

- Keep compact: Privacy, Terms, Support, language selector, copyright. `PROPOSED`
- Do not add large marketing footer inside task-heavy pages like Questions. `PROPOSED`

### Admin Footer

- Admin pages do not need a full public footer. `PROPOSED`
- Add version/build or environment label only if operationally useful. `NEEDS DECISION`

## 8. Breadcrumbs And Contextual Navigation

- Public pages: no breadcrumbs for one-level pages. `PROPOSED`
- User app: use back links for detail pages like `/history/[id]` (already present) and avoid over-breadcrumbing the core journey. `CURRENT` `PROPOSED`
- Admin: page title in header is already generated from path; add breadcrumbs only for future nested detail routes. `CURRENT` `PROPOSED`

## 9. Search And Command Navigation

- Public site does not need global search. `PROPOSED`
- User app does not need search until history/content volume increases. `PROPOSED`
- Admin should keep scoped search and later add global command/search across content, users, and audit log. `PROPOSED`

## 10. Accessibility Requirements

- Navbar links use semantic `<nav>` landmarks with accessible labels when multiple nav regions exist. `PROPOSED`
- Icon-only buttons require visible tooltips or `aria-label`/`title`; current admin header buttons already use labels/titles. `CURRENT`
- Mobile drawer focus must be trapped and restored. `PROPOSED`
- Active nav state must not rely on color alone; add `aria-current="page"` and a shape/indicator. `PROPOSED`
- RTL must flip sidebar/drawer placement and preserve reading order. Existing admin sidebar has RTL transform handling. `CURRENT`

## 11. Implementation Notes

- Reuse `lucide-react` for navigation icons because it is already installed and used. `CURRENT` `PROPOSED`
- Preserve route names from [05-information-architecture.md](05-information-architecture.md). `PROPOSED`
- Build navigation as reusable shell components rather than page-local link rows. `PROPOSED`
