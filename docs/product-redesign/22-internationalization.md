# Internationalization

> i18n and localization readiness for Silence across UI, content, data, accessibility, and admin operations.

---

## 1. Current i18n State

- Frontend uses `next-intl` with locale-prefixed routes and 11 message catalogs. `CURRENT`
- Supported seed languages are English, Chinese, Hindi, Spanish, Arabic, French, Bengali, Portuguese, Russian, Japanese, and Telugu. `DOCUMENTED` `CURRENT`
- Arabic is marked RTL and root layout sets `html dir` based on language. `CURRENT`
- User-facing message catalogs exist under `apps/web/src/messages`. `CURRENT`
- API content translations exist as separate rows for questions, answers, and remedies. `CURRENT`
- Admin UI strings are mostly hard-coded English, even though content translation workflows exist. `CURRENT` gap
- Admin can add languages through the backend, so the seed language list is not necessarily the permanent ceiling. `CURRENT`

## 2. Internationalization Principles

- Translate interface and content separately, but make both visible in QA. `PROPOSED`
- Avoid assuming English text length or Latin script. `PROPOSED`
- Treat RTL as layout behavior, not just text alignment. `PROPOSED`
- Do not use machine translation as silently final for sensitive guidance without review policy. `PROPOSED` `NEEDS DECISION`

## 3. Locale Routing

- Preserve `/{locale}` route support for public/auth/user pages. `CURRENT` `PROPOSED`
- Ensure canonical/alternate metadata is generated per locale. `PROPOSED`
- Admin routes currently stay unprefixed. `CURRENT`
- `NEEDS DECISION`: whether admin UI should be localized. Recommended default: keep admin shell English for Phase 1 redesign unless operators require multilingual admin, but localize admin content fields and translation quality states. `PROPOSED`

## 4. Language Selection

| Surface | Requirement |
|---|---|
| Homepage | Language selector visible in nav and start panel, using native names. `PROPOSED` |
| Registration | Language selected from preferences/default and editable. `CURRENT` `PROPOSED` |
| User app | Allow language change from header/profile; warn if content translation coverage is incomplete. `PROPOSED` |
| Admin | Manage language list/content translations; admin UI localization requires decision. `CURRENT` `NEEDS DECISION` |

## 5. Content Translation Model

- Questions, answers, and remedies support per-language translation rows. `CURRENT`
- Gemini auto-translation exists for content. `CURRENT`
- Admin review status for translated content quality is not fully defined as human-reviewed vs machine-translated. `CURRENT` gap

Recommended additions:
- Translation coverage dashboard by entity/language/category/level. `CURRENT` partial `PROPOSED`
- Machine-translated/human-reviewed status. `PROPOSED`
- Missing translation fallback policy visible to admin. `PROPOSED`
- RTL preview for Arabic content. `PROPOSED`

## 6. Formatting

| Data | Recommendation |
|---|---|
| Dates/times | Use `Intl.DateTimeFormat(locale)`; history already formats dates with the user's language. `CURRENT` `PROPOSED` |
| Numbers/counts | Use locale-aware formatting and plural rules. `PROPOSED` |
| Category labels | Translate labels; do not show raw enum values to users. `CURRENT` messages `PROPOSED` |
| Session statuses | Translate via message keys; current user app/history does this. `CURRENT` |
| Birth place | Support international city/country names and manual fallback. `PROPOSED` |
| Phone/contact | Current field accepts email or phone; international phone formatting/validation is not specified. `CURRENT` `NEEDS DECISION` |

## 7. Text Expansion And Layout

- Design for 30-50% text expansion. `PROPOSED`
- Buttons should wrap or use shorter localized labels; no clipped text. `PROPOSED`
- Admin tables need flexible columns and tooltips/details for long translated content. `PROPOSED`
- Do not uppercase translated strings globally. `PROPOSED`

## 8. RTL Readiness

Current:
- Root layout sets `dir`. `CURRENT`
- Global CSS includes RTL text-align and admin sidebar transform handling. `CURRENT`
- Several content blocks use `dir="auto"`. `CURRENT`

Proposed:
- Use logical CSS properties (`start`, `end`, `ps`, `pe`) consistently. `PROPOSED`
- Test mobile drawers, bottom nav, profile forms, question stepper, and admin sidebar in Arabic. `PROPOSED`
- Ensure icons that imply direction flip where appropriate (back/forward), while semantic icons do not. `PROPOSED`

## 9. AI Translation UX

- Gemini is used for translation. `CURRENT`
- Admin should see which translations are machine-generated and whether they have been reviewed. `PROPOSED`
- User-facing pages should not expose "AI translated" labels unless product/legal decides transparency requires it. `NEEDS DECISION`
- Translation failures should create admin-visible gaps, not user-facing raw fallback keys. `PROPOSED`

## 10. SEO And Metadata Localization

- Current app has one global title/description only. `CURRENT`
- Public pages need localized title, description, Open Graph, canonical, and alternates. `PROPOSED`
- Do not keyword-stuff localized SEO copy. `PROPOSED`
- Legal pages may need locale-specific review and effective dates. `NEEDS DECISION`

## 11. QA Requirements

- Missing-key check across all 11 catalogs. `PROPOSED`
- Screenshot pass for English, Arabic, Hindi, Chinese/Japanese, and one long Latin language such as Portuguese/French. `PROPOSED`
- RTL keyboard/focus order test. `PROPOSED`
- Content fallback test when translation row is missing. `PROPOSED`
- Admin translation coverage test for questions/answers/remedies. `PROPOSED`

## 12. Acceptance Criteria

- A user can complete the core journey in each supported locale without raw keys. `PROPOSED`
- Arabic pages set RTL and remain usable. `CURRENT` `PROPOSED`
- Admin can identify missing translations before users encounter them. `CURRENT` partial `PROPOSED`
- Admin-English decision is explicit, not accidental. `NEEDS DECISION`
- Date/status/category strings are localized and not raw enums. `CURRENT` `PROPOSED`
