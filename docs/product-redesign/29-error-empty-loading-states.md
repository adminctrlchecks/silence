# Error, Empty, Loading, And Edge States

> Required state design for every major Silence workflow.

---

## 1. Current State Handling

- Route-level loading/error files exist for several app/admin sections. `CURRENT`
- `ScreenState` provides loading, empty, and error primitives. `CURRENT`
- Question flow preserves local draft answers and shows inline save errors. `CURRENT`
- History/detail pages have simple empty states for no readings/no chart/no remedy. `CURRENT`
- Admin CRUD pages show inline errors but use native confirm dialogs for deletes. `CURRENT` gap
- Offline/partial failure/session-expired state language is not consistently designed. `CURRENT` gap

## 2. State Design Principles

- Every state must tell the user what happened and what they can do next. `PROPOSED`
- Preserve user-entered data wherever possible. `CURRENT` partial `PROPOSED`
- Use skeletons for layout continuity; use spinners only for small inline actions. `PROPOSED`
- Admin states should help operators fix the underlying content/data gap. `PROPOSED`

## 3. Loading States

| Workflow | Loading State |
|---|---|
| Homepage | Static shell first; lazy-load visual below fold. `PROPOSED` |
| Register/login | Button loading with disabled fields only during submit. `CURRENT` `PROPOSED` |
| Dashboard | Skeleton header, journey panel, progress/cards. `PROPOSED` |
| Questions | Skeleton question cards and progress; do not clear local drafts. `PROPOSED` |
| Chart | Reserved chart area, interpretation skeleton, status text. `PROPOSED` |
| Remedy | Practice-card skeleton. `PROPOSED` |
| History | Timeline/card skeleton. `PROPOSED` |
| Admin lists | Table/card row skeleton and toolbar disabled state. `PROPOSED` |

## 4. Empty States

| Workflow | Empty State |
|---|---|
| First dashboard | Explain reading path; Start reading CTA. `PROPOSED` |
| Questions missing | "This layer is waiting for content" plus admin-visible content gap. Current user copy exists. `CURRENT` `PROPOSED` |
| No chart | Explain required birth details or generation step; link to profile/questions. `PROPOSED` |
| No remedy | Explain remedy content is unavailable and route to dashboard/history; alert admin. `PROPOSED` |
| No history | Current "start first reading" CTA; expand with what gets saved. `CURRENT` `PROPOSED` |
| Admin empty list | Explain create/import path. `PROPOSED` |
| Admin no search results | Show clear filters/search reset action. `PROPOSED` |

## 5. Error States

| Error | UX |
|---|---|
| Form validation | Field-level errors plus summary for multi-step forms. `PROPOSED` |
| Auth failure | Generic invalid credentials; no enumeration. `CURRENT` `PROPOSED` |
| Save response failure | Preserve draft, retry, do not advance step. Current draft preservation exists. `CURRENT` `PROPOSED` |
| Chart generation failure | Retry, edit birth details, explain if data is incomplete. `PROPOSED` |
| Remedy selection failure | Retry, show support/dashboard fallback, log/admin surface. `PROPOSED` |
| Admin API failure | Inline alert in table/form; retry and preserve filters/form data. `PROPOSED` |
| Import failure | Row-level errors, downloadable/reportable summary. `CURRENT` partial `PROPOSED` |

## 6. Success States

| Workflow | Success |
|---|---|
| Register | Account created, continue to dashboard/onboarding. `CURRENT` `PROPOSED` |
| Login | Redirect to intended page or dashboard. `CURRENT` |
| Profile save | Inline saved text/toast. Current profile copy has saved state. `CURRENT` |
| Password change | Confirm change and sign out/re-login. `CURRENT` |
| Question layer save | Guidance revealed and next step unlocked. `CURRENT` |
| Chart generated | Show timestamp/accuracy and next CTA to remedy. `PROPOSED` |
| Remedy shown | Reading completion acknowledgement and history CTA. `PROPOSED` |
| Admin save/delete/import | Toast plus updated list state. `PROPOSED` |

## 7. Partial Failure

- If answers save but guidance answers fail to load, keep saved state and show retry for guidance only. `PROPOSED`
- If dashboard profile loads but progress fails, show profile and retry progress section. `PROPOSED`
- If chart computes but AI interpretation fails, show computed chart with interpretation fallback. `CURRENT` concept `PROPOSED`
- If translation fails for one language/entity, record admin gap and keep source language visible with fallback policy. `PROPOSED`
- If import partly succeeds, show created/updated counts and row errors. Current `ImportJob` stores counts/errors. `CURRENT` `PROPOSED`

## 8. Offline/Network Failure

- Detect failed fetches and show retry. `PROPOSED`
- Question drafts should remain local until successfully saved. Current localStorage drafts support this. `CURRENT`
- Do not promise full offline mode; it is not implemented. `CURRENT` `PROPOSED`
- Admin actions should not queue silently offline. `PROPOSED`

## 9. Permission Denied

- Unauthenticated user: redirect to login with return path. `CURRENT`
- Authenticated user requesting another user's session/detail: show not-found/permission state, not raw data. `PROPOSED`
- Unauthenticated admin: redirect to admin login with return path. `CURRENT`
- Admin-as-user: show persistent banner. `CURRENT`

## 10. Session Expired

- Show calm message and sign-in CTA. `PROPOSED`
- Preserve intended route. `CURRENT` route guard pattern `PROPOSED`
- For in-progress form submits, preserve local data before redirect where possible. `PROPOSED`
- Consider silent refresh only after frontend refresh-token flow is designed. `CURRENT` gap `PROPOSED`

## 11. Component Requirements

- `LoadingState`, `EmptyState`, and `ErrorState` should be tokenized and expanded to variants. `CURRENT` `PROPOSED`
- Add `SuccessState`, `Skeleton`, `Toast`, and `ConfirmationDialog`. `PROPOSED`
- All state components need icon, title, body, optional action, and accessibility semantics. `PROPOSED`

## 12. Acceptance Criteria

- No major workflow can fail with only a raw exception or blank page. `PROPOSED`
- User input is preserved across recoverable failures. `PROPOSED`
- Admin missing content becomes visible before users hit empty layers. `PROPOSED`
- Session expiration has a consistent path back to the intended task. `PROPOSED`
- Loading states prevent major layout shift. `PROPOSED`
