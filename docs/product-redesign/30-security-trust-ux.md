# Security And Trust UX

> User-facing security, privacy, and trust experience for Silence.

---

## 1. Current Security UX State

- Separate admin and user JWT realms exist in the backend. `CURRENT`
- User/admin auth tokens are stored in httpOnly cookies through the frontend proxy. `CURRENT`
- Forgot/reset password exists for user and admin with generic forgot responses. `CURRENT`
- Admin-as-user session is supported and shows a visible user-app banner. `CURRENT`
- Admin audit log model/service records sensitive admin actions. `CURRENT`
- User frontend session helper decodes the JWT payload to identify the user but does not verify the signature client-side; backend API calls still authorize with the token. `CURRENT`
- No Terms/Privacy pages exist despite collecting sensitive birth/profile data. `CURRENT` gap
- No account deletion/export/device session UI exists. `CURRENT` gap

## 2. Trust Principles

- Explain why sensitive data is requested before asking for it. `PROPOSED`
- Keep security language plain and reassuring. `PROPOSED`
- Never expose implementation terms like JWT in user-facing copy. Current homepage does. `CURRENT` gap `PROPOSED`
- Make admin impersonation visible and audited. `CURRENT` `PROPOSED`
- Do not claim compliance/certifications/security standards that are not documented. `PROPOSED`

## 3. Authentication Trust UX

| Flow | Requirement |
|---|---|
| Registration | Link Terms/Privacy near consent; explain birth details. `PROPOSED` |
| Login | Generic error; no account enumeration. `CURRENT` `PROPOSED` |
| Forgot password | Generic sent response; current backend supports this. `CURRENT` |
| Reset password | Clear invalid/expired link recovery. `CURRENT` `PROPOSED` |
| Change password | Confirm success and sign out. `CURRENT` |
| Google OAuth | Do not show until fully implemented. `CURRENT` gap `PROPOSED` |

## 4. Sensitive Data UX

Data collected/stored:
- name, category, language, contact. `CURRENT`
- DOB, time of birth, place city/country, coordinates/timezone when available. `CURRENT`
- responses, charts, remedies, sessions. `CURRENT`
- consent flag. `CURRENT`

Required UX:
- "Why we ask" for birth details. `PROPOSED`
- Privacy page describing data categories and AI processing. `PROPOSED` `NEEDS DECISION`
- Profile privacy section showing consent and data options. `PROPOSED`
- Support/delete/export path. `NEEDS DECISION`

## 5. AI Trust UX

- Gemini is used for answer generation, translation, and chart interpretation. `CURRENT`
- AI-generated answers are stored with source/review status for admin review. `CURRENT`
- Chart interpretation should be labelled as interpretation, not computed fact. `PROPOSED`
- Admin translation/AI review states should be visible. `CURRENT` `PROPOSED`
- User-facing legal/privacy copy for AI processing requires review. `NEEDS DECISION`

## 6. Chart And Remedy Trust UX

- Show chart accuracy state: exact/approximate/uncertain. Current messages exist. `CURRENT`
- Explain incomplete place/time data effects without alarming users. `PROPOSED`
- Remedy match detail should be human-readable and non-technical. Current detail can be technical. `CURRENT` gap `PROPOSED`
- Add disclaimer that remedies are reflective practices, not guaranteed outcomes. `PROPOSED` `NEEDS DECISION`

## 7. Admin Trust UX

- Keep admin-as-user banner visible throughout user app. `CURRENT`
- Audit sensitive admin actions and make audit log searchable/filterable. `CURRENT` `PROPOSED`
- Replace native delete confirms with clear confirmation dialogs. `CURRENT` gap `PROPOSED`
- Show content quality gaps before they affect users. `CURRENT` partial `PROPOSED`
- Permission/session-expired states should redirect or explain without raw API errors. `PROPOSED`

## 8. Account Lifecycle

Current:
- User can edit profile and change password. `CURRENT`
- No self-serve export/delete. `CURRENT`
- No device/session list. `CURRENT`

Proposed:
- Privacy tab with consent and data-management links. `PROPOSED`
- Account deletion flow only after backend/legal retention decisions. `NEEDS DECISION`
- Data export only after schema/export scope is defined. `NEEDS DECISION`
- Device session management only if refresh tokens are persisted/revocable. `NEEDS DECISION`

## 9. Confirmation Patterns

Use confirmation dialogs for:
- deleting admin content. `PROPOSED`
- account deletion/export requests. `PROPOSED` `NEEDS DECISION`
- changing category/birth details if it affects future readings. `PROPOSED`
- admin-as-user entry. `CURRENT` audit `PROPOSED`

Dialogs must state action, object, consequence, and recovery possibility. `PROPOSED`

## 10. Acceptance Criteria

- Users see Terms/Privacy before account creation. `PROPOSED`
- Birth-data collection has plain-language explanation. `PROPOSED`
- No security implementation terms appear in public/user copy. `CURRENT` gap `PROPOSED`
- Admin-as-user is visible and auditable. `CURRENT`
- Sensitive lifecycle gaps are explicitly marked and not implied as available. `NEEDS DECISION`
