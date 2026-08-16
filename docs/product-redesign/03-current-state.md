# Current State Audit

> What exists today — every screen, every workflow, every gap.

---

## 1. Current Route Inventory

### User-Facing Routes

#### `/` — Landing Page `CURRENT`
- **Purpose:** First impression; language/category selection
- **User type:** Anonymous visitor
- **Entry point:** Direct URL, search engine
- **Current components:** SessionPicker, Button links
- **Current functionality:** Language button grid (11 languages), category buttons (Male/Female/Other), CTA links to register/login/admin
- **Data used:** Cookies for saved language/category preference
- **Actions:** Select language, select category, navigate to register/login
- **Navigation:** Links to `/register`, `/login`, `/admin/login`
- **Desktop:** Two-column — left: hero area with CTA buttons + session picker; right: feature highlight cards
- **Mobile:** Single column, all elements stack vertically
- **UX problems:**
  - No explanation of what Silence does — a first-time visitor sees "Silence" heading, "Astrology Q&A" eyebrow, and a language picker. Zero value proposition
  - Feature highlight cards show technical labels: "Language: 11", "Chart: Astrology", "Saved profile: JWT" — "JWT" means nothing to a user
  - Three identical "Sign in as admin" links on the same page (header, hero, sidebar)
  - No imagery, no illustration, no visual interest beyond the color palette
  - No footer
  - Session picker dominates the page but isn't the primary user action
- **Recommended disposition:** **Replace** — This needs to become a proper product homepage

#### `/register` — User Registration `CURRENT`
- **Purpose:** Create a new user account
- **Components:** AuthCard (mode='register')
- **Current functionality:** Multi-field form: name, category, language, DOB, time of birth, place of birth (with autocomplete), contact (email/phone), password, consent checkbox
- **Desktop:** Centered card, max-width 448px
- **Mobile:** Full-width card with padding
- **UX problems:**
  - Long form with 9+ fields shown at once — overwhelming for a signup
  - No progress indicator
  - No explanation of why birth details are needed
  - Place autocomplete works but feedback on timezone detection is invisible to the user
  - Error messages are generic red text below the form
- **Recommended disposition:** **Improve** — Consider progressive disclosure or step-based registration

#### `/login` — User Login `CURRENT`
- **Purpose:** Sign in an existing user
- **Components:** AuthCard (mode='login')
- **Desktop/Mobile:** Same card layout as register
- **UX problems:**
  - Functional but plain — no social login, no remember-me
  - No Google OAuth (being added)
  - Forgot password link is small and easy to miss
- **Recommended disposition:** **Improve** — Add Google OAuth, improve visual hierarchy

#### `/forgot-password` — Password Reset Request `CURRENT`
- **Purpose:** Request a password reset link
- **Components:** ForgotPasswordCard
- **UX problems:** Minimal — functional but could benefit from better visual treatment
- **Recommended disposition:** **Improve** — Minor styling refinements

#### `/reset-password` — Password Reset Form `CURRENT`
- **Purpose:** Set a new password using a reset token
- **Components:** ResetPasswordCard
- **Recommended disposition:** **Improve** — Minor styling refinements

#### `/app` — User Dashboard `CURRENT`
- **Purpose:** Central hub after login; shows reading progress
- **Components:** Custom dashboard with 3 metric cards + quick links grid
- **Current functionality:**
  - Profile completeness bar (0-100%) with missing field list
  - Active reading status card with per-level question progress (answered/total)
  - Chart & remedy status card with ready/pending indicators
  - Primary CTA button that changes based on `nextStep` (start/continue/view chart/view remedy/view history)
  - Quick links grid: Questions, Chart, Remedy, Profile, History
- **UX problems:**
  - Cards are informational but not motivational — no emotional connection to the reading journey
  - Quick links section feels like a navigation list, not a product experience
  - No personalized greeting or welcome message
  - No visual representation of the reading journey/funnel
  - First-time user sees mostly empty states
  - No recent activity or last reading summary
- **Recommended disposition:** **Restructure** — Redesign as a guided journey workspace

#### `/app/questions` — Question Flow `CURRENT`
- **Purpose:** Answer questions across three layers (Common → Level 1 → Level 2)
- **Components:** QuestionFlow stepper
- **Current functionality:**
  - Three-layer stepper: Common → Level 1 → Level 2
  - Each layer shows questions with textarea inputs
  - Draft answers auto-save locally
  - "Save and continue" submits current layer and reveals approved answers
  - Progress indicator shows current layer and question counts
  - After Level 2, CTA to open chart
- **UX problems:**
  - Feels like a survey form, not a reflective experience
  - No context about why these questions matter
  - Help text exists in the model but isn't prominently displayed
  - Answer display after saving is plain text — no visual distinction
  - No indication of which questions are required vs optional
  - Loading state is a generic spinner
- **Recommended disposition:** **Improve** — Better UX flow, more guidance, richer answer display

#### `/app/chart` — Birth Chart `CURRENT`
- **Purpose:** Display the user's computed astrology chart
- **Components:** BirthChartView, VedicKundli, VedicPlanetsTable
- **Current functionality:**
  - Vedic Kundli diamond/square chart visualization (via @roxyapi/ui)
  - Planets table with longitude, sign, degree, house, retrograde status
  - Ascendant display
  - Chart accuracy indicator (exact/approximate/uncertain)
  - Gemini-written interpretation text
  - Key placements summary
- **UX problems:**
  - Dense information without educational context — users who don't know astrology won't understand the chart
  - No "what does this mean for you" summary in plain language
  - No visual connection between chart elements and the interpretation
  - Interpretation text is a single block — no structure or headings
- **Recommended disposition:** **Improve** — Add educational context, structure the interpretation

#### `/app/remedy` — Remedy `CURRENT`
- **Purpose:** Display the personalized remedy for the current reading
- **Components:** Custom remedy display
- **Current functionality:**
  - Title and text of the selected remedy
  - Category label
  - Linked level indicator
  - "Why this practice" section showing match detail (rule reason)
  - Closing encouragement text
- **UX problems:**
  - Single text block — feels like reading a paragraph, not receiving guidance
  - No actionable structure (daily practice steps, reminders, etc.)
  - No visual treatment to make the remedy feel special/personal
  - Match detail is technical ("chart placement: Saturn; response mentions 'burnout'")
- **Recommended disposition:** **Improve** — Make it feel like a personal prescription

#### `/profile` — User Profile `CURRENT`
- **Purpose:** View and edit user profile / birth details
- **Components:** ProfileDetailsCard, ChangePasswordCard, PlacesAutocomplete
- **Current functionality:**
  - Display mode: shows all profile fields (name, category, DOB, time, place, contact, consent)
  - Edit mode: inline editing with save/cancel
  - Password change card with current/new/confirm fields
  - Link to admin portal (if the user has admin access)
- **UX problems:**
  - No visual separation between identity info, birth details, and account settings
  - All fields shown in a single card — no organized sections
  - Password change is on the same page as profile — should be separate
- **Recommended disposition:** **Restructure** — Split into organized sections (Personal, Birth Details, Security)

#### `/history` — Reading History `CURRENT`
- **Purpose:** List all past reading sessions
- **Components:** Custom session list with cards
- **Current functionality:**
  - List of reading sessions with status badge, date, question progress, chart/remedy indicators
  - "View details" link per session
  - Empty state with CTA to start first reading
- **UX problems:**
  - Cards are functional but plain
  - Status badges use the enum value as display text
  - No visual timeline or journey representation
- **Recommended disposition:** **Improve** — Better card design, visual timeline

#### `/history/[id]` — Reading Detail `CURRENT`
- **Purpose:** View a completed reading's responses, chart, and remedy
- **Components:** Custom detail view
- **Current functionality:**
  - Responses list with question text and user answer
  - Answer text shown (if available)
  - Chart section (if generated)
  - Remedy section with match detail
- **Recommended disposition:** **Improve** — Better visual treatment, structured layout

### Admin Routes

#### `/admin/login` — Admin Login `CURRENT`
- **Components:** AdminLoginCard
- **Recommended disposition:** **Improve** — Align with user auth styling

#### `/admin` — Admin Dashboard `CURRENT`
- **Components:** DashboardOverview, ChangePasswordCard, module link grid
- **Current functionality:**
  - Live metrics from `/admin/dashboard/metrics`: user counts, session counts, question/answer/remedy totals, unreviewed AI count, translation coverage, chart errors, import failures
  - Content modules grid linking to each admin section
  - Password change card
- **UX problems:**
  - Metrics are shown as plain numbers in cards — no charts, no trends, no visual intelligence
  - Content modules grid is functional but doesn't prioritize by urgency
  - Password change is on the dashboard — should be in settings
- **Recommended disposition:** **Improve** — Add data visualization, action-oriented layout

#### `/admin/questions` — Question Management `CURRENT`
- **Components:** QuestionsAdmin
- **Recommended disposition:** **Improve** — Better table/filter UX

#### `/admin/answers` — Answer Management `CURRENT`
- **Components:** AnswersAdmin
- **Recommended disposition:** **Improve** — Better review queue UX

#### `/admin/remedies` — Remedy Management `CURRENT`
- **Components:** RemediesAdmin
- **Recommended disposition:** **Improve** — Better rule visualization

#### `/admin/chart-config` — Chart Configuration `CURRENT`
- **Components:** ChartConfigAdmin
- **Recommended disposition:** **Keep** — Functional, low-traffic page

#### `/admin/import` — Excel Import `CURRENT`
- **Components:** ImportAdmin (react-dropzone)
- **Recommended disposition:** **Keep** — Functional

#### `/admin/languages` — Language Management `CURRENT`
- **Components:** LanguagesAdmin
- **Recommended disposition:** **Keep** — Functional

#### `/admin/users` — User Management `CURRENT`
- **Components:** UsersAdmin
- **Recommended disposition:** **Improve** — Better user detail view

#### `/admin/audit-log` — Audit Trail `CURRENT`
- **Components:** AuditLogAdmin
- **Recommended disposition:** **Keep** — Functional

---

## 2. Missing Pages `PROPOSED`

| Page | Priority | Rationale |
|------|----------|-----------|
| Homepage (proper) | P0 | Current landing is a session picker — no value proposition, no product explanation |
| About / How It Works | P1 | Users need to understand what Silence does before signing up |
| Terms & Conditions | P0 | Collecting personal birth data requires legal terms |
| Privacy Policy | P0 | Required by data protection regulations |
| 404 Not Found | P1 | Currently shows a generic Next.js error |
| Settings page (separate from profile) | P2 | Security, preferences, language should have dedicated space |
| Onboarding flow | P2 | First-time users need guidance after registration |
| Contact / Support | P2 | Users need a way to get help |

---

## 3. Current UX State Summary

### What works `CURRENT`
- Core reading flow is complete end-to-end
- Session model properly tracks reading progress
- Dashboard correctly guides the user to their next action
- Auth is complete (login, register, forgot/reset password, admin-as-user)
- Admin has comprehensive content management tools
- i18n is properly implemented across 11 languages including RTL
- Dark mode works throughout

### Critical gaps
1. **No product story** — Users arrive and see a form, not a product
2. **No visual identity** — Every page looks the same (white card, text, buttons)
3. **No footer** — No navigation, legal links, or brand presence at page bottom
4. **No mobile menu** — Navigation is a row of text links that overflow on small screens
5. **No legal pages** — Collecting birth data without Terms/Privacy is a liability
6. **No loading skeletons** — Generic spinners everywhere
7. **No success celebrations** — Completing a reading gets no fanfare
8. **No onboarding** — First-time users are dropped into a dashboard with no guidance

### Known technical issues `CURRENT`
1. **`remedy_ready` status may be unused** — Code appears to jump from `chart_ready` directly to `complete`
2. **Geocode service disabled by default** — Checks for `GEOCODE_API_KEY` but Open-Meteo is free; the env var check prevents the service from running
3. **README is stale** — Says "design/documentation stage" but the product is deployed and live
