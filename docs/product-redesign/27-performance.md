# Performance

> UX-related performance recommendations for Silence.

---

## 1. Current Performance State

- Next.js uses `reactStrictMode`, `next-intl`, workspace transpilation for `@silence/shared`, and standalone output outside Vercel. `CURRENT`
- API client uses `cache: 'no-store'` for requests, which favors fresh data over caching. `CURRENT`
- Several protected routes render server-side data and redirect unauthenticated users. `CURRENT`
- Some route-level loading files exist, but loading UI is mostly generic. `CURRENT`
- No public images/assets currently ship, so image weight is not yet a problem but will become one when homepage assets are added. `CURRENT` `PROPOSED`
- Playwright config currently defines a desktop Chromium project only. `CURRENT`

## 2. Performance Principles

- Prioritize perceived speed for reading flows and admin CRUD. `PROPOSED`
- Do not add heavy visuals or animation that delay comprehension. `PROPOSED`
- Optimize images/fonts before adding them to public pages. `PROPOSED`
- Preserve data freshness for admin/user session state while caching static public content. `PROPOSED`

## 3. Page Loading Strategy

| Page | Strategy |
|---|---|
| Homepage/public pages | Static or mostly static where possible; avoid blocking on API. `PROPOSED` |
| Auth | Minimal JS, fast form render, no heavy hero media. `PROPOSED` |
| Dashboard | Skeletons for journey and cards; load profile/dashboard together where practical. `PROPOSED` |
| Questions | Show skeleton cards; preserve local drafts during network delays. `CURRENT` `PROPOSED` |
| Chart | Reserve chart aspect ratio; show chart-generation progress and retry. `PROPOSED` |
| Admin lists | Skeleton table rows, pagination, debounced search. `PROPOSED` |

## 4. Images And Assets

- Use optimized responsive images for homepage/product visuals. `PROPOSED`
- Lazy-load below-fold images. `PROPOSED`
- Prefer product screenshots/composites compressed to modern formats. `PROPOSED`
- Add favicon/OG assets without bloating main app JS. `PROPOSED`
- Avoid autoplay video/animated backgrounds in initial redesign. `PROPOSED`

## 5. Fonts

- Current font strategy relies on system stack with Inter declared but not loaded as an asset. `CURRENT`
- If custom fonts are added, use `next/font` or self-hosted subsets. `PROPOSED`
- Avoid large multilingual font payloads unless rendering tests show system fonts are insufficient. `PROPOSED`
- Use `font-display: swap` if webfonts are introduced. `PROPOSED`

## 6. JavaScript And Bundle

- Keep public homepage interactivity minimal: nav, language/category picker, theme. `PROPOSED`
- Use server components for static/public content where possible. `PROPOSED`
- Load admin-heavy components only on admin routes. Current route split already helps. `CURRENT` `PROPOSED`
- Avoid adding large chart/animation libraries beyond current `@roxyapi/ui` unless justified. `CURRENT` `PROPOSED`
- Keep icon imports tree-shaken by importing only used Lucide icons. Current code imports named icons. `CURRENT`

## 7. Data Fetching And Caching

- `cache: 'no-store'` is appropriate for auth/session/admin mutable data. `CURRENT`
- Public content such as homepage/how-it-works/legal can be static or revalidated. `PROPOSED`
- Admin search should debounce and paginate rather than fetch large fixed limits. `CURRENT` gap `PROPOSED`
- Chart/remedy generation should avoid duplicate work where session snapshots already exist. `CURRENT` model `PROPOSED`

## 8. Core Web Vitals Targets

| Metric | Target |
|---|---|
| LCP | Under 2.5s on public homepage with optimized hero. `PROPOSED` |
| CLS | Under 0.1; reserve image/chart/card skeleton dimensions. `PROPOSED` |
| INP | Under 200ms for forms/nav/admin search. `PROPOSED` |
| TTFB | Monitor API-backed pages separately from static public pages. `PROPOSED` |

## 9. Admin Performance

- Add pagination UI for Questions/Answers/Remedies/Languages lookup paths currently using `limit=100`. `CURRENT` gap `PROPOSED`
- Use debounced search and server-side filters. `PROPOSED`
- Avoid rendering huge translation matrices without virtualization or pagination. `PROPOSED`
- Import status polling should back off and stop when terminal. `PROPOSED`

## 10. Testing And Monitoring

- Add Lighthouse or Web Vitals checks for homepage, dashboard, chart, and admin dashboard. `PROPOSED`
- Expand Playwright projects to include mobile viewport and RTL smoke tests. `CURRENT` gap `PROPOSED`
- Track API/chart/remedy failures in admin dashboard/monitoring. `CURRENT` partial `PROPOSED`
- Performance budgets should cover JS, image payload, and LCP asset size. `PROPOSED`

## 11. Acceptance Criteria

- Public pages do not block rendering on authenticated API calls. `PROPOSED`
- Homepage hero image/product visual is optimized and dimensioned. `PROPOSED`
- Dashboard/questions/chart have skeletons that prevent layout shift. `PROPOSED`
- Admin lists are paginated and do not silently truncate after fixed limits. `CURRENT` gap `PROPOSED`
- Mobile performance is tested, not inferred from desktop only. `CURRENT` gap `PROPOSED`
