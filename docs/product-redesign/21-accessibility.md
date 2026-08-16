# Accessibility

> Accessibility baseline for Silence. Target: WCAG 2.2 AA where applicable.

---

## 1. Current Accessibility State

- Form fields generally use visible `Label` components in auth/profile flows. `CURRENT`
- Several errors use `role="alert"`. `CURRENT`
- `LoadingState` uses `role="status"` and `aria-live="polite"`. `CURRENT`
- Admin icon buttons in the header include `aria-label` and `title`. `CURRENT`
- Question and history content uses `dir="auto"` in important user/content text areas. `CURRENT`
- Missing custom components include modal/dialog, drawer, tooltip, tabs, table, pagination, and robust form-field abstractions. `CURRENT` gap
- Public/user nav lacks a proper mobile menu and active route states. `CURRENT` gap
- No documented accessibility statement or WCAG QA process exists. `CURRENT`

## 2. Accessibility Principles

- Accessibility is part of the component system, not a final checklist. `PROPOSED`
- Do not use color as the only state indicator. `PROPOSED`
- Every workflow must be keyboard-completable. `PROPOSED`
- Every chart/visual must have a textual equivalent. `PROPOSED`
- Translated and RTL content must be accessible, not merely visually mirrored. `PROPOSED`

## 3. Semantic Structure

- One `<h1>` per page. `PROPOSED`
- Use `<main>`, `<header>`, `<nav>`, `<footer>`, and `<section>` landmarks intentionally. `PROPOSED`
- Multiple nav regions need accessible labels, e.g. public navigation, user app navigation, footer navigation. `PROPOSED`
- Admin tables need captions or section headings that describe the data. `PROPOSED`

## 4. Keyboard Navigation

| Area | Requirement |
|---|---|
| Public/user nav | Tab order follows visual order; drawer opens/closes by keyboard. `PROPOSED` |
| Bottom nav | All items reachable and expose current page. `PROPOSED` |
| Question flow | Step controls, textareas, save/continue, and guidance panels are keyboard usable. `CURRENT` `PROPOSED` |
| Admin sidebar | Current links are keyboard reachable; add `aria-current`. `CURRENT` `PROPOSED` |
| Admin search | Current search is a form; ensure clear button is labelled. `CURRENT` |
| Dialogs/drawers | Trap focus, Escape close, restore focus. `PROPOSED` |

## 5. Focus Visibility

- Keep visible focus rings for all interactive controls. Current button/input classes use `focus-visible:ring-2`. `CURRENT`
- Focus ring color must pass contrast on light/dark surfaces. `PROPOSED`
- Do not remove outlines without replacement. `PROPOSED`
- After saving a question layer, focus should move to the new step heading or success message. `PROPOSED`

## 6. Forms And Validation

- Labels are required; placeholders are supplemental. `CURRENT` `PROPOSED`
- Errors must be tied to controls with `aria-describedby` and summarized for multi-step forms. `PROPOSED`
- Required fields need text/semantic indication, not only color or asterisk. `PROPOSED`
- Consent checkbox must link to Terms/Privacy once pages exist. `PROPOSED`
- Password validation should be plain-language and not expose security internals. `PROPOSED`

## 7. Color And Contrast

- Use the color tokens from [09-color-system.md](09-color-system.md) and verify final contrast ratios. `PROPOSED`
- Define missing destructive/status tokens before relying on `text-destructive` classes. `CURRENT` gap `PROPOSED`
- Secondary/muted text must remain AA where it conveys important information. `PROPOSED`
- Focus/error/success states must include icons/text, not color alone. `PROPOSED`

## 8. Text, Zoom, And Reflow

- Support 200% zoom without clipped controls or horizontal page scroll. `PROPOSED`
- Body text should be at least 16px for long reading/legal/remedy content. `PROPOSED`
- Mobile inputs/textareas should use 16px to avoid forced zoom. `PROPOSED`
- Long translated strings must wrap and not overlap adjacent controls. `PROPOSED`

## 9. Images, Icons, And Charts

- Decorative icons use `aria-hidden`. Current code uses this in several places. `CURRENT`
- Icon-only buttons require labels/tooltips. `CURRENT` `PROPOSED`
- Homepage/product images require meaningful alt text if informative. `PROPOSED`
- Birth chart visual requires a textual summary: ascendant, key placements, accuracy, and interpretation. `CURRENT` data `PROPOSED`
- Planet tables need headers and readable row labels. `PROPOSED`

## 10. Motion And Reduced Motion

- Respect `prefers-reduced-motion`. `PROPOSED`
- Sidebar/drawer transitions should be disabled or shortened for reduced motion. `PROPOSED`
- Loading spinners should have text status and not be the only feedback. `CURRENT` `PROPOSED`
- Avoid decorative animation in reading/remedy flows. `PROPOSED`

## 11. Touch And Pointer

- Minimum mobile target size: 44x44px. `PROPOSED`
- Do not rely on hover-only help text. `PROPOSED`
- Tooltips are supplemental; important "why birth details are needed" content must be visible/tappable. `PROPOSED`

## 12. Internationalization And RTL Accessibility

- Set correct `html lang` and `dir`; root layout already derives both. `CURRENT`
- Use `dir="auto"` for user/admin content from the API. `CURRENT` `PROPOSED`
- Avoid all-caps transformations in translated UI. `PROPOSED`
- RTL keyboard/focus order should follow DOM/logical order, not only visual mirroring. `PROPOSED`

## 13. Page-Specific Priorities

| Page/Area | Priority Fix |
|---|---|
| Homepage | Semantic structure, alt text, visible legal links. `PROPOSED` |
| Registration | Step semantics, error summary, consent links. `PROPOSED` |
| Questions | Focus management after save, draft preservation, accessible progress. `PROPOSED` |
| Chart | Text alternative and accessible table. `PROPOSED` |
| Remedy | Readable structured content, disclaimer text. `PROPOSED` |
| Admin CRUD | Accessible tables, dialogs replacing `window.confirm()`, pagination controls. `CURRENT` gap `PROPOSED` |
| Legal | TOC, headings, readable line length. `PROPOSED` |

## 14. QA Checklist

- Keyboard-only smoke test for public nav, auth, dashboard, questions, chart, remedy, history, admin CRUD. `PROPOSED`
- Screen reader smoke test for registration, question save, chart summary, remedy, and admin delete confirmation. `PROPOSED`
- Contrast audit for light/dark themes. `PROPOSED`
- 200% zoom/reflow test. `PROPOSED`
- RTL Arabic screenshot and keyboard pass. `PROPOSED`
- Reduced-motion pass. `PROPOSED`

## 15. Acceptance Criteria

- Users can complete a reading without a mouse. `PROPOSED`
- All critical form errors are announced and recoverable. `PROPOSED`
- Chart meaning is available without relying on the visual chart. `PROPOSED`
- Admin destructive actions are accessible and no longer use native `window.confirm()`. `CURRENT` gap `PROPOSED`
- Public legal/trust pages are accessible before signup. `PROPOSED`
