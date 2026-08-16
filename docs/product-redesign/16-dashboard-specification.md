# Dashboard Specification

> Dedicated specification for the authenticated user dashboard at `/app`.

---

## 1. Current Dashboard Audit

- Current dashboard fetches user profile and dashboard summary from the API. `CURRENT`
- It displays a profile completeness card, active reading status with per-level progress, chart/remedy status, a primary CTA derived from `nextStep`, and quick links. `CURRENT`
- It redirects unauthenticated users to `/login`. `CURRENT`
- It is functionally useful but visually reads as a cluster of cards and links rather than a guided reading workspace. `CURRENT`

## 2. Purpose

The dashboard should be the user's home base: it tells them where they are in the reading journey, what to do next, what has already been saved, and how to return to past readings. `PROPOSED`

## 3. Primary User

Authenticated seeker. `CURRENT`

Secondary user: admin viewing as user through admin-as-user mode, with visible impersonation banner from the user layout. `CURRENT`

## 4. User Intent

- Start or continue a reading. `CURRENT`
- Understand profile completeness and chart readiness. `CURRENT`
- Return to chart/remedy/history. `CURRENT`
- Know whether any action is required before receiving a chart/remedy. `PROPOSED`

## 5. Entry And Exit Points

| Type | Paths |
|---|---|
| Entry | After registration/login, protected redirect, header/app nav, completion return. `CURRENT` |
| Primary exit | `nextStep` CTA to questions/chart/remedy/history. `CURRENT` |
| Secondary exits | Profile, history, chart, remedy, sign out. `CURRENT` |

## 6. Page Hierarchy

1. Personalized header with greeting and current journey status. `PROPOSED`
2. Primary next-action panel. `PROPOSED`
3. Reading journey tracker: Profile -> Questions -> Chart -> Remedy -> Complete. `PROPOSED`
4. Active reading summary: status, question progress, chart/remedy readiness. `CURRENT` `PROPOSED`
5. Profile completeness and birth-data accuracy card. `CURRENT` `PROPOSED`
6. Recent readings/history preview. `PROPOSED`
7. Secondary navigation shortcuts. `CURRENT` `PROPOSED`

## 7. Layout

- Container: `container.app` around 1120px. `CURRENT` `PROPOSED`
- Desktop: main journey panel spans full width; supporting cards in 2-3 columns. `PROPOSED`
- Mobile: primary CTA and journey tracker first; supporting details collapse below. `PROPOSED`
- Avoid putting every section in equal-weight cards; the next action should visually dominate. `PROPOSED`

## 8. Header

Content:
- "Welcome, {name}" if profile name exists. `CURRENT` data `PROPOSED`
- Subtitle based on session state: not started, in progress, chart ready, remedy ready, complete. `CURRENT` `PROPOSED`
- Optional admin-as-user notice remains in global layout. `CURRENT`

No marketing hero styling inside the dashboard. `PROPOSED`

## 9. Primary CTA Logic

Use current `nextStep` values from the dashboard API. `CURRENT`

| `nextStep` | CTA Label | Target |
|---|---|---|
| `start_reading` | Start your reading / Start a new reading | `/app/questions` |
| `continue_questions` | Continue your reading | `/app/questions` |
| `view_chart` | View your chart | `/app/chart` |
| `view_remedy` | View your remedy | `/app/remedy` |
| `view_history` | View your history | `/history` |

The current route map already implements these targets. `CURRENT`

## 10. Main Content Components

| Component | Content | Status |
|---|---|---|
| Journey tracker | Profile complete, Common/Level 1/Level 2 progress, Chart, Remedy | `CURRENT` data `PROPOSED` component |
| Next action panel | State-specific headline, CTA, short explanation | `PROPOSED` |
| Profile completeness | Percent, missing fields, link to profile | `CURRENT` |
| Reading progress | Answered/total per level | `CURRENT` |
| Artifact status | Chart generated, remedy shown | `CURRENT` |
| Recent reading preview | Latest completed session/date/status | `PROPOSED` |
| Support/trust cue | Link to privacy/profile data explanation | `PROPOSED` |

## 11. First-Time User State

If no active session and no completed sessions:

- Header: "Your first reading is ready to begin." `PROPOSED`
- Explain the 3-step path: questions -> chart -> remedy. `PROPOSED`
- Show profile completeness prominently if required fields/coordinates/timezone are missing. `CURRENT` `PROPOSED`
- Primary CTA: "Start your reading." `CURRENT` `PROPOSED`
- Do not show a large empty quick-link grid as the main content. `PROPOSED`

## 12. Returning User State

If active session exists:

- Show exact current step and progress. `CURRENT` `PROPOSED`
- Primary CTA resumes the next step. `CURRENT`
- Recent saved answers/history preview can be secondary. `PROPOSED`

If no active session but completed history exists:

- Show latest reading card and "Start a new reading" CTA. `CURRENT` data `PROPOSED`
- Make history easy to access. `CURRENT`

## 13. Loading, Empty, Error, Success

| State | Specification |
|---|---|
| Loading | Skeleton for header, primary panel, progress tracker, and cards; no spinner-only full page. `PROPOSED` |
| Empty | First-time state above; avoid saying "no data" without a next action. `PROPOSED` |
| Error | Inline page alert with retry and sign-in fallback if session expired. `PROPOSED` |
| Partial failure | If profile loads but dashboard summary fails, show profile plus retry for reading status. `PROPOSED` |
| Success | After completing a reading, dashboard should acknowledge completion and route to history/remedy. `PROPOSED` |

## 14. Mobile Behavior

- Primary CTA fixed in normal flow near top, not hidden below cards. `PROPOSED`
- Progress tracker becomes vertical or horizontally scrollable with labels. `PROPOSED`
- Quick links move into bottom nav/app nav, not duplicated as large cards. `PROPOSED`
- Text and buttons must wrap for translated strings. `PROPOSED`

## 15. Accessibility

- Use a single `<h1>` and semantic sections. `PROPOSED`
- Progress tracker needs text labels and not color-only completion. `PROPOSED`
- Focus order: header -> primary CTA -> journey tracker -> supporting cards. `PROPOSED`
- The profile completeness progress bar must expose `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`. `PROPOSED`
- Loading state uses `aria-live="polite"`; current `LoadingState` does this. `CURRENT`

## 16. Content Rules

- Use human labels, not enum raw values, for statuses. Current messages already map statuses in `UserApp.status`. `CURRENT`
- Explain missing fields as "needed for chart accuracy" where true. `PROPOSED`
- Avoid spiritual overpromising; the dashboard should guide, not sell. `PROPOSED`

## 17. Acceptance Criteria

- User can identify the next best action within 5 seconds. `PROPOSED`
- First-time, in-progress, chart-ready, remedy-ready, and complete states are distinct. `PROPOSED`
- Dashboard works for all 11 locales and RTL. `DOCUMENTED` `PROPOSED`
- Admin-as-user banner remains visible above dashboard when applicable. `CURRENT`
- Quick links are secondary to the journey, not the primary dashboard experience. `PROPOSED`
