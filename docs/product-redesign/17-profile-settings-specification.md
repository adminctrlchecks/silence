# Profile And Settings Specification

> Account, profile, birth details, security, privacy, and settings architecture for authenticated users and admins.

---

## 1. Current Profile State

- `/profile` currently renders `ProfileDetailsCard` and `ChangePasswordCard` on the same page. `CURRENT`
- Profile data includes name, category, language, date of birth, time of birth, place city/country, contact, and consent. `CURRENT`
- Profile edit mode supports updating saved details, including place autocomplete. `CURRENT`
- Password change signs the user out after success. `CURRENT`
- If an admin token is present, `/profile` shows an Admin portal link. `CURRENT`
- There is no separate settings, privacy, sessions/devices, export, deletion, or notification preference page. `CURRENT`

## 2. Target Account Architecture

| Route/Section | Purpose | Status |
|---|---|---|
| `/profile` | Account overview and personal information summary. | `CURRENT` `PROPOSED` |
| `/profile/birth-details` or tab | Date/time/place details that drive chart accuracy. | `PROPOSED` |
| `/profile/security` or tab | Password change and future session/device controls. | `CURRENT` `PROPOSED` |
| `/profile/privacy` or tab | Consent, data handling explanation, export/delete request path. | `PROPOSED` `NEEDS DECISION` |
| `/profile/preferences` or tab | Language, theme, category if editable. | `CURRENT` data `PROPOSED` |
| `/admin/settings` | Admin password/security/settings page. | `PROPOSED` |

Recommended implementation default: ship as tabs within `/profile` first, then split into routes if complexity grows. `PROPOSED`

## 3. Profile Overview

- **Purpose:** Let users confirm who the account belongs to and inspect key saved details. `PROPOSED`
- **Primary content:** Name, contact, category, preferred language, consent status, created/updated dates if available. `CURRENT` data `PROPOSED`
- **Primary CTA:** Edit personal info. `CURRENT` `PROPOSED`
- **Secondary actions:** Change password, view privacy settings, go to reading history. `PROPOSED`
- **Empty state:** If optional data is missing, explain why completion matters for reading quality. `CURRENT` `PROPOSED`
- **Error:** Inline alert and retry; preserve edit data. `PROPOSED`

## 4. Birth Details

- **Purpose:** Manage DOB, birth time, place, coordinates, and timezone that determine chart generation. `DOCUMENTED` `CURRENT`
- **Fields:** date of birth, time of birth, birth place autocomplete, city, country, latitude, longitude, timezone. `CURRENT`
- **Content:** Add "Why we ask" explanation near the section, not hidden in legal copy. `PROPOSED`
- **Accuracy:** Show exact/approximate/uncertain status based on coordinates/timezone availability. Existing chart uses accuracy labels. `CURRENT` `PROPOSED`
- **Change impact:** Warn that changing birth details may affect future charts; completed session snapshots remain historical. `CURRENT` model `PROPOSED`
- **CTA:** Save birth details. `CURRENT` `PROPOSED`

## 5. Preferences

| Preference | Current Support | Recommendation |
|---|---|---|
| Language | Stored on user profile and locale cookie/messages exist. `CURRENT` | Provide profile-level language selector with native names. `PROPOSED` |
| Category | Stored on user and drives content. `CURRENT` | Allow edit carefully; explain it affects future question/remedy category. `PROPOSED` |
| Theme | Global theme toggle exists. `CURRENT` | Optionally expose in preferences plus header toggle. `PROPOSED` |
| Notifications | No notification system. `CURRENT` | Do not add settings until notifications exist. `PROPOSED` |

## 6. Security

- Current password change card should move into a Security section. `CURRENT` `PROPOSED`
- Fields: current password, new password, confirm password. `CURRENT`
- Behavior: on success, user is signed out and must sign in again. `CURRENT`
- Add password strength/help copy without exposing exact backend hashing internals. `PROPOSED`
- Future: device/session list and revoke-all sessions depends on token persistence strategy. `NEEDS DECISION`

## 7. Privacy And Data

Silence collects personal data: contact, birth details, responses, charts, remedies, and consent flag. `CURRENT`

Required privacy settings/spec:
- Consent status and explanation. `CURRENT` `PROPOSED`
- Link to Privacy Policy and Terms. `PROPOSED`
- Explain AI processing at a high level because Gemini is used for answers, translations, and chart interpretation. `CURRENT` `PROPOSED`
- Data export/delete request path. `NEEDS DECISION`
- Account deletion flow. `NEEDS DECISION`

Recommended default: provide a privacy information page and support-request path first; implement self-serve export/delete after legal/backend requirements are decided. `PROPOSED`

## 8. Admin Settings

- Current admin dashboard includes password change; move to `/admin/settings`. `CURRENT` `PROPOSED`
- Include: admin profile summary, password change, future session/device controls, audit-log link. `PROPOSED`
- Keep admin settings English-only until admin i18n decision is made. `NEEDS DECISION`

## 9. Loading, Empty, Error, Success

| State | Specification |
|---|---|
| Loading | Skeleton fields grouped by section. `PROPOSED` |
| Empty | Missing profile/birth data becomes a guided completion state. `PROPOSED` |
| Error | Inline alert near affected section; no full page crash for a failed save. `PROPOSED` |
| Success | Inline saved state plus toast; password change uses redirect/sign-out message. `CURRENT` `PROPOSED` |
| Partial failure | If place lookup fails, allow manual city/country entry and mark accuracy uncertain. `PROPOSED` |

## 10. Mobile Layout

- Use tabs/accordion sections with persistent top account nav. `PROPOSED`
- Forms become single-column with 16px input text. `PROPOSED`
- Save/cancel actions should be sticky or repeated at bottom for long forms. `PROPOSED`
- Sensitive actions like deletion require full-width confirmation screen/dialog with clear consequences. `PROPOSED`

## 11. Accessibility

- All fields have visible labels. Current profile/auth components use `Label`. `CURRENT`
- Group related fields with semantic fieldsets where useful. `PROPOSED`
- Error messages tie to controls with `aria-describedby`. `PROPOSED`
- Password show/hide button requires clear `aria-label`. `PROPOSED`
- Confirmation dialogs trap focus and require explicit action. `PROPOSED`

## 12. Acceptance Criteria

- Users can distinguish personal info, birth details, security, and privacy. `PROPOSED`
- Password change is no longer buried under general profile content. `PROPOSED`
- Users understand why birth details are needed before editing/saving. `PROPOSED`
- Privacy/legal links are available from the account area. `PROPOSED`
- All undecided privacy/account lifecycle features are marked and not silently implied. `NEEDS DECISION`
