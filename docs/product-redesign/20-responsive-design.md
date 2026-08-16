# Responsive Design

> Responsive behavior for Silence across public, user, and admin experiences.

---

## 1. Current Responsive State

- Current pages use Tailwind responsive utilities such as `sm`, `md`, `lg`, and max-width containers. `CURRENT`
- User/public navigation does not have a mobile drawer or bottom navigation. `CURRENT`
- Admin sidebar has a mobile overlay and desktop collapse behavior. `CURRENT`
- Most user pages stack naturally on mobile but are not intentionally redesigned for mobile workflows. `CURRENT`
- Tables/admin dense lists need stronger mobile patterns. `CURRENT` gap

## 2. Breakpoint Model

| Range | Label | Design Intent |
|---|---|---|
| 320-479px | Small mobile | One-handed use, single column, shortest labels, no horizontal page scroll. `PROPOSED` |
| 480-767px | Large mobile | Single column with larger touch controls and richer section spacing. `PROPOSED` |
| 768-1023px | Tablet | Two-column where content supports it; nav drawer or compact nav. `PROPOSED` |
| 1024-1279px | Desktop | Full public/user nav, admin sidebar, dashboard grids. `CURRENT` `PROPOSED` |
| 1280px+ | Large desktop | Wider chart/admin surfaces, but preserve readable line length. `CURRENT` `PROPOSED` |

## 3. Global Shell

| Surface | Mobile | Tablet/Desktop |
|---|---|---|
| Public nav | Logo + language + menu button; drawer for links/CTA. `PROPOSED` | Full navbar with links, language, sign in, start CTA. `PROPOSED` |
| User app nav | Top account bar + bottom nav for core pages. `PROPOSED` | Top app nav or compact sidebar/rail. `PROPOSED` |
| Admin nav | Current overlay sidebar, improve mobile search. `CURRENT` `PROPOSED` | Current collapsible sidebar/header. `CURRENT` |
| Footer | Stacked link groups. `PROPOSED` | Multi-column compact footer. `PROPOSED` |

## 4. Page Behavior

| Page | Mobile Behavior | Desktop Behavior |
|---|---|---|
| Homepage | Hero text/CTA first, visual below, start panel in flow, no giant full-screen hero. `PROPOSED` | Hero with product visual and next section visible. `PROPOSED` |
| Registration | Multi-step single column, sticky/visible continue. `PROPOSED` | Centered card or two-column support/context + form. `PROPOSED` |
| Dashboard | Next action first, journey tracker, supporting cards below. `PROPOSED` | Primary panel + 2-3 card grid. `PROPOSED` |
| Questions | Single column, large textareas, sticky save/continue optional. `PROPOSED` | Reading column plus side progress if useful. `PROPOSED` |
| Chart | Summary first; chart scaled/reserved; table scroll only inside table wrapper. `PROPOSED` | Summary/chart split and technical details below. `PROPOSED` |
| Remedy | Focused single-column practice card. `PROPOSED` | Same with wider line length cap. `PROPOSED` |
| History | Timeline cards, no dense table. `PROPOSED` | Timeline/list with filters/load more. `PROPOSED` |
| Admin lists | Card rows or table with controlled scroll and filter drawer. `PROPOSED` | Full toolbar + table + pagination. `PROPOSED` |

## 5. Forms

- Inputs and textareas use 16px minimum on mobile. `PROPOSED`
- Labels remain visible; helper text wraps. `PROPOSED`
- Two-column form grids collapse to one column below `sm`. Current auth form uses `sm:grid-cols-2` for some fields. `CURRENT`
- Place autocomplete results must fit viewport and remain keyboard/touch accessible. `PROPOSED`
- Required/optional states must be textual as well as visual. `PROPOSED`

## 6. Tables And Dense Data

- Admin tables need horizontal scroll only within the table region, never at page level. `PROPOSED`
- On mobile, prefer card rows for Questions/Answers/Remedies/Users where row actions are important. `PROPOSED`
- Pagination controls wrap and keep previous/next buttons reachable. `PROPOSED`
- Chart planets table can scroll horizontally if all columns are necessary; provide summary cards above it. `CURRENT` `PROPOSED`

## 7. Touch Targets

- Minimum interactive target: 44x44px for mobile controls. `PROPOSED`
- Current standard button height is 40px; keep for desktop, use 44-48px for mobile primary actions. `CURRENT` `PROPOSED`
- Icon-only buttons need 40px desktop and 44px mobile targets. `PROPOSED`
- Bottom nav height should account for safe-area inset. `PROPOSED`

## 8. Images And Charts

- Homepage product visual uses responsive aspect ratio and optimized image sizes. `PROPOSED`
- Chart visual must have stable aspect ratio to avoid layout shift. `PROPOSED`
- Avoid text embedded in images because of localization/accessibility. `PROPOSED`
- Provide textual alternatives for chart meaning. `PROPOSED`

## 9. Modals, Drawers, Menus

- Mobile modals should be full-width sheets/drawers when content is longer than a simple confirm. `PROPOSED`
- Confirmation dialogs must fit small screens and keep destructive action separated. `PROPOSED`
- Menus/drawers must close on Escape/backdrop and restore focus. `PROPOSED`
- RTL should flip drawer/sidebar direction. Current admin CSS handles sidebar transform for RTL. `CURRENT`

## 10. Text Expansion And Localization

- Allow 30-50% text expansion. `PROPOSED`
- Button labels wrap only when unavoidable; use icons plus concise labels for nav. `PROPOSED`
- Do not rely on fixed-width English labels in admin if admin i18n is enabled later. `PROPOSED`
- Arabic RTL layout must be screenshot-tested for nav, profile, questions, and admin sidebar. `PROPOSED`

## 11. Acceptance Criteria

- No page-level horizontal scroll at 320px width. `PROPOSED`
- Primary action visible without excessive scrolling on dashboard/questions/auth. `PROPOSED`
- Admin mobile users can navigate, search/filter, and take row actions. `PROPOSED`
- Text does not overlap controls at all supported locales. `PROPOSED`
- Chart and table overflow is intentional, contained, and labelled. `PROPOSED`
