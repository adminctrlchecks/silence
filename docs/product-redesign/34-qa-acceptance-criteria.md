# QA Acceptance Criteria

> Testable acceptance criteria for the Phase 1 product redesign specification.

---

## 1. Global Criteria

- No application code is considered complete if it contradicts the documented product model in [02-product-understanding.md](02-product-understanding.md). `PROPOSED`
- All non-trivial user-facing changes are responsive, accessible, and localized-ready. `PROPOSED`
- No fabricated testimonials, statistics, legal claims, certifications, or customer logos appear. `PROPOSED`
- Public/user pages include appropriate navigation and footer/legal links. `PROPOSED`
- Authenticated/private pages are protected and not indexed. `CURRENT` `PROPOSED`

## 2. Design System QA

- Color tokens include primary, secondary, accent, background, surface, border, text, success, warning, error, info, disabled. `PROPOSED`
- `text-destructive`/error classes resolve to actual tokens. `CURRENT` gap `PROPOSED`
- Typography scale is consistent and does not use viewport-width scaling. `PROPOSED`
- Component states exist for hover, focus, active, disabled, loading, error, success. `PROPOSED`
- Light and dark themes pass contrast checks. `PROPOSED`

## 3. Homepage QA

- Homepage explains what Silence is before asking users to register. `PROPOSED`
- Primary CTA starts the reading flow. `PROPOSED`
- Language/category selection remains available and saves preferences. `CURRENT` `PROPOSED`
- "JWT" or other implementation terms do not appear. `CURRENT` gap `PROPOSED`
- Terms/Privacy links are visible. `PROPOSED`
- Mobile hero shows CTA and a hint of following content without overlap. `PROPOSED`

## 4. Auth QA

- Registration is not one overwhelming flat form. `PROPOSED`
- Birth-date/time/place fields explain their purpose. `PROPOSED`
- Consent links to Terms/Privacy. `PROPOSED`
- Forgot-password response is generic and does not enumerate accounts. `CURRENT`
- Reset invalid/expired token state is recoverable. `CURRENT` `PROPOSED`
- Google OAuth is either fully working/tested or absent from visible UI. `CURRENT` gap `PROPOSED`

## 5. Dashboard QA

- Dashboard shows one clear next action based on `nextStep`. `CURRENT` `PROPOSED`
- First-time, in-progress, chart-ready, remedy-ready, and complete states are visually distinct. `PROPOSED`
- Profile completeness and missing fields remain visible. `CURRENT`
- App navigation is available on mobile and desktop. `PROPOSED`
- Admin-as-user banner remains visible when applicable. `CURRENT`

## 6. Core Journey QA

| Page | Criteria |
|---|---|
| Questions | User can answer, save, see guidance, resume drafts, and continue through all layers. `CURRENT` `PROPOSED` |
| Chart | User sees summary, accuracy, chart visual, table/detail, interpretation, and remedy CTA. `CURRENT` `PROPOSED` |
| Remedy | User sees structured practice, why selected, disclaimer/support copy, and history/completion CTA. `CURRENT` `PROPOSED` |
| History | Empty state has CTA; completed sessions are listed; detail page shows responses/chart/remedy or section-level partial states. `CURRENT` `PROPOSED` |

## 7. Profile/Settings QA

- Profile sections separate personal info, birth details, preferences, security, and privacy. `PROPOSED`
- Password change is in Security and signs user out after success. `CURRENT` `PROPOSED`
- Birth detail changes explain chart impact. `PROPOSED`
- Privacy section links to legal pages and marks export/delete decisions if not implemented. `NEEDS DECISION`

## 8. Admin QA

- Admin sidebar/header remain usable on desktop and mobile. `CURRENT` `PROPOSED`
- Questions/Answers/Remedies lists do not silently truncate at fixed lookup limits. `CURRENT` gap `PROPOSED`
- Delete actions use accessible confirmation dialogs, not `window.confirm()`. `CURRENT` gap `PROPOSED`
- AI review, translation gaps, import failures, and content matrix states are visible. `CURRENT` `PROPOSED`
- Admin settings contains password/security controls. `PROPOSED`

## 9. Legal/Trust QA

- Terms and Privacy pages exist before production launch. `PROPOSED`
- Actual legal copy is reviewed and dated. `NEEDS DECISION`
- Privacy describes current data categories and AI use accurately. `CURRENT` `NEEDS DECISION`
- Chart/remedy pages avoid unsupported outcome claims. `PROPOSED`

## 10. Accessibility QA

- Keyboard-only user can complete registration, questions, chart, remedy, history, and admin CRUD. `PROPOSED`
- Focus is visible and logical. `PROPOSED`
- Dialogs/drawers trap and restore focus. `PROPOSED`
- Forms have visible labels and announced errors. `CURRENT` `PROPOSED`
- Chart has textual alternative/summary. `PROPOSED`
- 200% zoom works without clipped content. `PROPOSED`

## 11. Responsive/i18n QA

- No page-level horizontal scroll at 320px. `PROPOSED`
- Arabic RTL pages render nav/forms/questions/admin sidebar correctly. `CURRENT` `PROPOSED`
- Long translations do not overlap buttons/cards/nav. `PROPOSED`
- Dates/status/category labels are localized. `CURRENT` `PROPOSED`
- Missing translation fallback is controlled and admin-visible. `PROPOSED`

## 12. Performance/SEO QA

- Homepage LCP asset is optimized and dimensioned. `PROPOSED`
- Dashboard/chart/history loading states avoid layout shift. `PROPOSED`
- Sitemap/robots/canonical/hreflang exist for public pages. `PROPOSED`
- OG/favicons/app icons exist. `PROPOSED`
- Auth/app/admin pages are noindexed/protected. `PROPOSED`

## 13. Regression Flow Tests

Recommended Playwright scenarios:
1. Anonymous homepage -> choose language/category -> register -> dashboard. `PROPOSED`
2. Login -> dashboard -> questions partial save -> refresh -> resume. `CURRENT` `PROPOSED`
3. Complete questions -> chart -> remedy -> history detail. `CURRENT` `PROPOSED`
4. Profile edit birth details -> chart accuracy copy visible. `PROPOSED`
5. Forgot/reset password user and admin. `CURRENT` `PROPOSED`
6. Admin CRUD create/edit/delete with confirmation. `CURRENT` `PROPOSED`
7. Arabic RTL core journey smoke. `PROPOSED`
8. Mobile viewport homepage/dashboard/questions smoke. `PROPOSED`
