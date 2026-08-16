# Route And Page Inventory

> Detailed route inventory for the current and proposed Silence experience. Builds on [03-current-state.md](03-current-state.md) and the inspected Next.js route tree under `apps/web/src/app`.

---

## 1. Inventory Rules

- `CURRENT` means the route exists in the repository today.
- `PROPOSED` means the route should be added during the redesign.
- `NEEDS DECISION` means the route depends on product/legal/business confirmation.
- Locale-prefixed user routes also exist through `next-intl` routing as `/{locale}/...` for all 11 supported languages. `CURRENT`
- Admin routes are not locale-prefixed today. `CURRENT`

## 2. Current Public And User Routes

| Route | Page | User | Entry Point | Components/Data | Current Actions | UX Issues | Disposition |
|---|---|---|---|---|---|---|---|
| `/` and `/{locale}` | Landing/session picker | Anonymous | Direct URL, locale middleware | `SessionPicker`, cookies for language/category, `Home` messages | Choose language/category, register, login, admin login | Product story absent; "JWT" appears as user-facing value; no footer; repeated admin CTA | Replace with proper homepage |
| `/register` and `/{locale}/register` | Registration | Anonymous | Homepage/login | `AuthCard`, `PlacesAutocomplete`, user auth proxy | Create profile with name, category, language, DOB, birth time/place, contact, password, consent | Long single-step form; weak explanation for sensitive birth data | Restructure |
| `/login` and `/{locale}/login` | User login | Anonymous | Homepage/protected redirect | `AuthCard` | Sign in by contact/password, go to `/app` | Functional but plain; Google OAuth not implemented | Improve |
| `/forgot-password` and `/{locale}/forgot-password` | Reset request | Anonymous | Login | `ForgotPasswordCard`, auth proxy | Request reset link | Good generic anti-enumeration copy; minimal state design | Improve |
| `/reset-password` and `/{locale}/reset-password` | Reset form | Anonymous | Email link | `ResetPasswordCard`, token query param | Set new password | Functional but visually basic | Improve |
| `/app` and `/{locale}/app` | Dashboard | Authenticated user | Login/register/protected redirect | `publicApi.dashboard`, `profile`, active session, progress cards | Continue next step, navigate to questions/chart/remedy/profile/history | Useful data but reads as cards + quick links rather than a guided workspace | Restructure |
| `/app/questions` and `/{locale}/app/questions` | Question flow | Authenticated user | Dashboard | `QuestionFlow`, `/api/questions`, `/api/responses`, `/api/answers`, localStorage drafts | Answer Common/Level 1/Level 2, save layer, view chart | Survey-like; weak guidance; no global progress bar across full reading | Improve |
| `/app/chart` and `/{locale}/app/chart` | Birth chart | Authenticated user | Dashboard/questions | `BirthChartView`, `@roxyapi/ui`, chart API | Generate/view chart | Dense astrology data; limited education and summary | Improve |
| `/app/remedy` and `/{locale}/app/remedy` | Remedy | Authenticated user | Dashboard/chart | Remedy API, selected `RemedyResult` | View selected practice | Single text block; technical match details | Improve |
| `/profile` and `/{locale}/profile` | Profile + password | Authenticated user | Header/dashboard | `ProfileDetailsCard`, `ChangePasswordCard`, profile API | Edit profile, change password, admin portal link if applicable | Identity, birth details, consent, and security mixed together | Restructure |
| `/history` and `/{locale}/history` | Reading history | Authenticated user | Dashboard/profile | `publicApi.listSessions(limit: 50)` | View sessions, start first reading if empty | Plain cards; no timeline; no pagination UI | Improve |
| `/history/[id]` and `/{locale}/history/[id]` | Reading detail | Authenticated user | History | Session detail API, responses, chart, remedy | Review saved reading | Useful but visually dense; chart/remedy/response hierarchy needs stronger structure | Improve |

## 3. Current Admin Routes

| Route | Page | User | Navigation | Components/Data | Current Actions | UX Issues | Disposition |
|---|---|---|---|---|---|---|---|
| `/admin/login` | Admin login | Admin | Direct/admin redirect | `AdminLoginCard` | Sign in | English-only; separate visual language from user auth | Improve |
| `/admin/forgot-password` | Admin reset request | Admin | Login | `ForgotPasswordCard` copy variant | Request reset | Functional but minimal | Improve |
| `/admin/reset-password` | Admin reset form | Admin | Email link | `ResetPasswordCard` copy variant | Set new password | Functional but minimal | Improve |
| `/admin` | Admin dashboard | Admin | Sidebar | `DashboardOverview`, metrics, content matrix, import failures | Review metrics, change password, open modules | More operational than before, but still needs trend/priority hierarchy; password belongs in settings | Improve |
| `/admin/questions` | Questions CRUD | Admin | Sidebar | `QuestionsAdmin` | Search, create, edit, delete | Uses `window.confirm`; table/list ergonomics limited | Improve |
| `/admin/answers` | Answers CRUD + AI review | Admin | Sidebar, AI review query link | `AnswersAdmin`, AI generate route | Search/filter, create/edit/delete, generate/review AI | `limit=100` question fetch; delete confirmation native; review queue needs stronger workflow | Improve |
| `/admin/remedies` | Remedy CRUD | Admin | Sidebar | `RemediesAdmin`, question lookup | Create/edit/delete remedies and rule filters | Rule matching hard to scan; `limit=100` question fetch; native confirm | Improve |
| `/admin/chart-config` | Chart configuration | Admin | Sidebar | `ChartConfigAdmin` | Edit per-category config | Low-frequency page; adequate current structure | Keep/improve lightly |
| `/admin/import` | Excel import | Admin | Sidebar | `ImportAdmin`, `react-dropzone` | Download template, upload, inspect status/errors | Good functional base; add preview/row review later | Keep/improve |
| `/admin/languages` | Languages/translations | Admin | Sidebar | `LanguagesAdmin`, translation endpoints | Add language, auto-translate entities | Fetches entity lists with `limit=100`; admin UI itself English-only | Improve |
| `/admin/users` | User management | Admin | Sidebar | `UsersAdmin` | Search users, inspect sessions, enter user app | Needs timeline and support-oriented detail layout | Improve |
| `/admin/audit-log` | Audit log | Admin | Sidebar | `AuditLogAdmin` | Review sensitive admin actions | Functional; needs filtering/export later | Keep/improve |

## 4. Current Utility And System Routes

| Route | Status | Notes |
|---|---|---|
| Route-level `loading.tsx` | `CURRENT` | Present for admin, app, chart, history, profile. Uses generic loading states rather than page-specific skeletons. |
| Route-level `error.tsx` | `CURRENT` | Present for admin, app, chart, history, profile. Useful recovery base, but not a full error-state system. |
| `not-found.tsx` | `PROPOSED` | No custom not-found route exists. Add locale-aware 404 with homepage/help links. |
| `/api/*` proxy routes | `CURRENT` | Next.js route handlers proxy user/admin/API calls to the NestJS API. They are implementation routes, not product pages. |

## 5. Proposed Public Routes

| Route | Priority | Why | Notes |
|---|---:|---|---|
| `/` | P0 | Replace current session picker with a real product homepage. | Keep language/category selection, but move it into the start-reading flow. |
| `/how-it-works` | P1 | Explain the three question layers, chart, and remedy before users share birth data. | Can be a standalone page or homepage section first. |
| `/about` | P2 | Give product/team context once available. | `NEEDS DECISION`: only include factual operator/company content. |
| `/terms` | P0 | Required trust/legal surface for account and birth-data collection. | Content requires legal review. |
| `/privacy` | P0 | Required trust/legal surface for contact, birth, chart, answers, and AI processing. | Content requires legal review. |
| `/contact` or `/support` | P2 | Users need a support path for account/content/privacy issues. | `NEEDS DECISION`: support ownership and channel. |

## 6. Proposed Auth And Account Routes

| Route | Priority | Why | Notes |
|---|---:|---|---|
| `/profile/birth-details` | P2 | Birth data is central to chart accuracy and deserves focused editing. | Could ship as tabs inside `/profile` before route split. |
| `/profile/security` | P1 | Password change should leave the general profile card. | Aligns with current `ChangePasswordCard` behavior. |
| `/profile/privacy` | P1 | Consent, data export/delete requests, and AI-processing explanation need a home. | `NEEDS DECISION`: export/delete backend scope. |
| `/admin/settings` | P2 | Move admin password/security controls out of dashboard. | Keep admin dashboard operational. |

## 7. Navigation Relationships

- Public users should move `Homepage -> Start reading -> Register/Login -> Dashboard -> Questions -> Chart -> Remedy -> History`. `PROPOSED`
- Returning users should land on `/app` and see one dominant next action derived from `nextStep`. `CURRENT` `PROPOSED`
- Admin users should keep the sidebar structure because the current module grouping maps well to the content model. `CURRENT` `PROPOSED`
- Legal/support links should live in a global footer on public and user pages. `PROPOSED`

## 8. Verification Notes

- `CURRENT` route claims were checked against `apps/web/src/app`.
- Component claims were checked against `apps/web/src/components`.
- Data model claims were checked against `apps/api/prisma/schema.prisma`.
- Known route duplication is intentional because locale route files mirror base user/auth routes for `next-intl`. `CURRENT`
