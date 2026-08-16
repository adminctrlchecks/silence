# Authentication Flows

> User/admin authentication UX specification, including existing password flows and planned Google OAuth accounting.

---

## 1. Current Auth Architecture

- Backend has separate admin and user auth endpoints under `/api/v1/auth`. `CURRENT`
- User auth supports register, login, refresh, change password, forgot password, and reset password. `CURRENT`
- Admin auth supports login, refresh, change password, admin-as-user session, forgot password, and reset password. `CURRENT`
- Credential endpoints have a tighter throttling rule than general API traffic. `CURRENT`
- Password reset responses are generic and always return `{ sent: true }` for forgot-password requests to avoid account enumeration. `CURRENT`
- Frontend stores auth in httpOnly cookies through Next.js proxy routes. `CURRENT`
- Frontend route protection redirects protected user pages to `/login` and protected admin pages to `/admin/login`. `CURRENT`
- Refresh endpoints exist in the backend, but current frontend session logic primarily reads the access-token cookie and does not implement a visible silent-refresh flow. `CURRENT`
- Google OAuth environment variable names exist (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`), but no inspected auth controller route implements Google OAuth. `CURRENT` gap

## 2. User Registration

- **Purpose:** Create a seeker account and collect details needed for chart generation. `CURRENT`
- **Current fields:** name, category, language, DOB, time of birth, place of birth, contact, password, consent. `CURRENT`
- **Target UX:** Progressive 3-step form. `PROPOSED`

Recommended steps:
1. Identity: name, language, category. `CURRENT` `PROPOSED`
2. Birth details: DOB, time, place autocomplete, accuracy explanation. `CURRENT` `PROPOSED`
3. Account and consent: contact, password, consent, Terms/Privacy links. `CURRENT` `PROPOSED`

Loading: button spinner is current; add section-level disabled state and preserve entered data on errors. `CURRENT` `PROPOSED`

Success: route to `/app` with onboarding/dashboard context. Current implementation routes to localized `/app`. `CURRENT` `PROPOSED`

## 3. User Login

- **Current fields:** contact and password. `CURRENT`
- **Primary CTA:** Sign in. `CURRENT`
- **Secondary actions:** Forgot password, create profile, future Google sign-in. `CURRENT` `PROPOSED`
- **Error:** Generic invalid credentials message; do not reveal whether contact exists. `PROPOSED`
- **Success:** Redirect to requested protected route if present; otherwise `/app`. Route protection already stores redirect param for protected routes. `CURRENT` `PROPOSED`

## 4. Forgot And Reset Password

### Forgot Password

- User enters contact; admin enters email. `CURRENT`
- API always returns success-style response. `CURRENT`
- UX should show neutral confirmation: "If an account matches, a reset link is on its way." Current copy follows this pattern. `CURRENT`

### Reset Password

- Token is read from reset link query param. `CURRENT`
- New password and confirm password are submitted. `CURRENT`
- Backend consumes reset token once and rejects invalid/expired tokens. `CURRENT`
- UX must handle invalid/expired link with a path to request a new one. Current reset copy includes invalid-link messaging. `CURRENT`

## 5. Change Password

- User/admin change password requires current signed-in token. `CURRENT`
- On success, the user is signed out/redirected to login in current components. `CURRENT`
- Move user password change to `/profile/security`; move admin password change to `/admin/settings`. `PROPOSED`

## 6. Admin Login And Admin-As-User

- Admin login is separate from user login. `CURRENT`
- Admin-as-user session endpoint exists and is audited. `CURRENT`
- User layout shows an impersonation banner with exit-to-admin link when `isAdminSession` is present in the decoded user token. `CURRENT`
- Target UX: keep banner persistent, high contrast, and visible above all user app pages. `CURRENT` `PROPOSED`

## 7. Google OAuth

Status: `PROPOSED` / `NEEDS DECISION`

Evidence:
- OAuth-related environment variable names exist. `CURRENT`
- No inspected controller route implements `/auth/user/google` or callback behavior. `CURRENT`

Recommended default:
- Add Google OAuth only for user login/register, not admin, unless admin SSO is explicitly required. `PROPOSED`
- Keep contact/password login as fallback. `PROPOSED`
- On OAuth first sign-in, require completion of category, language, birth details, and consent before `/app`. `PROPOSED`
- Do not imply Google OAuth is available in UI until backend/frontend routes exist. `PROPOSED`

`NEEDS DECISION`: whether Google OAuth should be enabled for production launch and which provider/account owns the OAuth app configuration.

## 8. Session Expiration

- Backend refresh endpoints exist. `CURRENT`
- Frontend should show session-expired state if an API returns unauthorized after page load. `PROPOSED`
- Recommended UX: toast/alert "Your session expired. Please sign in again" with redirect preserving intended route. `PROPOSED`
- Silent refresh can be added later if refresh token cookie storage/exchange is implemented client-side. `PROPOSED`

## 9. Auth Layout And Content

- Auth pages should include the Silence mark, clear page title, concise explanation, and links to Terms/Privacy before collecting data. `PROPOSED`
- Registration must explain why birth time/place are required. `PROPOSED`
- Admin login should visually align with product trust system but remain operational and distinct from user sign-in. `PROPOSED`
- Avoid putting public marketing content inside every auth card; keep forms focused. `PROPOSED`

## 10. Accessibility

- Every field has visible labels. Current `AuthCard` uses `Label`. `CURRENT`
- Errors use `role="alert"` in current auth components. `CURRENT`
- Password visibility toggles require clear labels and keyboard support. `PROPOSED`
- Multi-step registration must expose step count and allow keyboard navigation. `PROPOSED`
- OAuth buttons must clearly identify provider and not rely on icon alone. `PROPOSED`

## 11. Security And Trust UX

- Keep forgot-password responses generic. `CURRENT` `PROPOSED`
- Do not reveal token validity until reset submission or explicit invalid-token state. `PROPOSED`
- Do not expose implementation details such as JWT or hashing in user-facing copy. Current homepage violates this with "JWT". `CURRENT` gap `PROPOSED`
- Sensitive auth actions should have rate-limited backend behavior and calm generic UI errors. `CURRENT` `PROPOSED`

## 12. Acceptance Criteria

- Users can register without seeing one overwhelming long form. `PROPOSED`
- Users understand birth-data collection before consenting. `PROPOSED`
- Forgot/reset flows work for both user and admin and do not enumerate accounts. `CURRENT` `PROPOSED`
- Google OAuth is either fully implemented and tested or absent from visible UI. `PROPOSED`
- Admin-as-user state is always visible to the admin. `CURRENT`
