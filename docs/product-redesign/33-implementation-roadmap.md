# Implementation Roadmap

> Phased implementation plan for turning the Phase 1 documentation into product work.

---

## Phase 0 - Decisions And Setup

Goal: confirm blocking decisions and prepare implementation. `PROPOSED`

Tasks:
- Confirm legal owner, Terms/Privacy review path, support contact, and data lifecycle decisions. `NEEDS DECISION`
- Confirm brand/logo direction. `NEEDS DECISION`
- Decide whether admin UI must be localized. `NEEDS DECISION`
- Decide whether Google OAuth is in first implementation scope. `NEEDS DECISION`
- Create issue/task breakdown from this documentation set. `PROPOSED`

## Phase 1 - Design System

Goal: create reusable foundations before page redesigns. `PROPOSED`

Tasks:
- Implement color/status/destructive tokens. `PROPOSED`
- Implement typography/spacing/container/radius/shadow tokens. `PROPOSED`
- Expand primitives: Button, Link, FormField, Input, Textarea, Select, Checkbox, Alert, Skeleton. `PROPOSED`
- Add Dialog/Drawer/Toast if page work needs them. `PROPOSED`
- Verify light/dark contrast and RTL basics. `PROPOSED`

## Phase 2 - Global Shell

Goal: fix navigation and page scaffolding. `PROPOSED`

Tasks:
- Public navbar and footer. `PROPOSED`
- User app navigation/mobile bottom nav/profile menu. `PROPOSED`
- Mobile drawer/menu with accessibility. `PROPOSED`
- Custom 404. `PROPOSED`
- Shared page container/layout components. `PROPOSED`

## Phase 3 - Public Experience

Goal: make anonymous users understand and trust the product. `PROPOSED`

Tasks:
- Replace current homepage/session-picker experience. `CURRENT` `PROPOSED`
- Add product visual/hero asset, start panel, how-it-works section, FAQ. `PROPOSED`
- Add `/how-it-works` if not fully covered by homepage. `PROPOSED`
- Add metadata/SEO for public pages. `PROPOSED`
- Add favicon/app icon/OG image. `PROPOSED`

## Phase 4 - Authentication

Goal: make account entry calm, clear, and privacy-aware. `PROPOSED`

Tasks:
- Restructure registration into progressive steps. `PROPOSED`
- Add Terms/Privacy links and birth-data explanation. `PROPOSED`
- Improve login/forgot/reset visual hierarchy and states. `PROPOSED`
- Move password-change UX into settings/profile security. `PROPOSED`
- Implement or hide Google OAuth depending on decision. `NEEDS DECISION`

## Phase 5 - Application Shell And Dashboard

Goal: turn the app into a guided reading workspace. `PROPOSED`

Tasks:
- Redesign `/app` around next action and journey tracker. `CURRENT` `PROPOSED`
- Add first-time/returning/complete dashboard states. `PROPOSED`
- Move quick links into nav/secondary region. `PROPOSED`
- Add mobile-first dashboard layout. `PROPOSED`

## Phase 6 - Core Product Pages

Goal: improve the reading journey end-to-end. `PROPOSED`

Tasks:
- Question flow: better stepper, cards, save states, focus management. `CURRENT` `PROPOSED`
- Chart: summary first, accuracy badge, accessible chart/table, next CTA. `CURRENT` `PROPOSED`
- Remedy: structured practice card, why-selected copy, completion state. `CURRENT` `PROPOSED`
- History/detail: timeline, better partial states, pagination/load more. `CURRENT` `PROPOSED`

## Phase 7 - Profile And Settings

Goal: organize account, birth, security, and privacy. `PROPOSED`

Tasks:
- Split profile into sections/tabs. `PROPOSED`
- Move password change into security. `PROPOSED`
- Add privacy/consent/data handling section with legal-reviewed links. `PROPOSED`
- Add admin settings route for admin password/security. `PROPOSED`

## Phase 8 - Legal And Trust

Goal: ship required trust surfaces. `PROPOSED`

Tasks:
- Implement Terms and Privacy page layout. `PROPOSED`
- Insert legal-reviewed content. `NEEDS DECISION`
- Add cookie section/page depending on final cookie/tracking scope. `NEEDS DECISION`
- Add disclaimer copy on chart/remedy/auth/home as reviewed. `NEEDS DECISION`

## Phase 9 - Admin Quality And Operations

Goal: polish admin workflows after core user trust is addressed. `PROPOSED`

Tasks:
- Add pagination to admin lists and lookup fetches. `CURRENT` gap `PROPOSED`
- Replace `window.confirm()` with confirmation dialog. `CURRENT` gap `PROPOSED`
- Improve content completeness, AI review, import failure, user timeline views. `CURRENT` `PROPOSED`
- Add mobile filter/search patterns. `PROPOSED`
- Resolve admin localization decision. `NEEDS DECISION`

## Phase 10 - Accessibility, Responsive, Performance, SEO QA

Goal: harden before production rollout. `PROPOSED`

Tasks:
- WCAG 2.2 AA audit pass. `PROPOSED`
- Mobile/RTL screenshot pass. `PROPOSED`
- Lighthouse/Core Web Vitals pass. `PROPOSED`
- Sitemap/robots/canonical/hreflang verification. `PROPOSED`
- Playwright coverage for mobile and key flows. `PROPOSED`
- QA against [34-qa-acceptance-criteria.md](34-qa-acceptance-criteria.md). `PROPOSED`

## Implementation Guardrails

- Do not change core business logic just for visual polish. `PROPOSED`
- Preserve current working routes while improving UI/IA. `CURRENT` `PROPOSED`
- Keep recommendations consistent with the API and Prisma model. `CURRENT`
- Avoid adding billing/social/notifications/mobile app until decisions exist. `NEEDS DECISION`

## Definition Of Done For Redesign Implementation

- P0 items from [32-priority-matrix.md](32-priority-matrix.md) are complete. `PROPOSED`
- Legal pages are live with reviewed content. `NEEDS DECISION`
- Core user journey works on mobile/desktop/RTL. `PROPOSED`
- Admin can operate content without truncation/native confirm issues. `PROPOSED`
- SEO/performance/accessibility checks pass. `PROPOSED`
