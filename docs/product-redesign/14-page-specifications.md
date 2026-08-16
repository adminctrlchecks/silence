# Page Specifications

> Page-by-page UX specification for important pages not covered by dedicated files 15-19. See [15-homepage-specification.md](15-homepage-specification.md), [16-dashboard-specification.md](16-dashboard-specification.md), [17-profile-settings-specification.md](17-profile-settings-specification.md), [18-authentication-flows.md](18-authentication-flows.md), and [19-legal-pages.md](19-legal-pages.md) for deeper specs.

---

## 1. Shared Page Template

Every page implementation should define: purpose, primary user, intent, entry/exit points, hierarchy, layout, header, primary CTA, secondary actions, loading/empty/error/success/permission states, mobile behavior, accessibility, SEO if public, and content rules. `PROPOSED`

## 2. How It Works

- **Purpose:** Explain the Silence reading model before registration. `PROPOSED`
- **Primary user:** Anonymous seeker. `ASSUMPTION`
- **Entry points:** Homepage nav, footer, auth support copy. `PROPOSED`
- **Exit points:** Start reading, Sign in, Privacy. `PROPOSED`
- **Hierarchy:** Hero explanation -> 3-step overview -> detailed flow (profile, questions, chart, remedy, history) -> trust/privacy note -> FAQ preview -> CTA. `PROPOSED`
- **Layout:** Public `container.app`, full-width sections, no nested cards. `PROPOSED`
- **Images/icons:** Use sequence icons from `lucide-react`; optional product screenshots once implemented. `PROPOSED`
- **Loading:** Static page; no loading beyond route shell. `PROPOSED`
- **Empty/error:** Not applicable except global errors. `PROPOSED`
- **Mobile:** Single-column timeline. `PROPOSED`
- **A11y:** Ordered list for steps, meaningful headings. `PROPOSED`
- **SEO:** Title "How Silence Works"; meta describes profile -> questions -> chart -> remedy. `PROPOSED`
- **Content:** Do not claim medical, psychological, financial, or guaranteed outcomes. `PROPOSED`

## 3. About

- **Purpose:** Explain product/operator background if factual content exists. `PROPOSED`
- **Status:** `NEEDS DECISION` because the repository does not contain verified company/team/operator story.
- **Recommended default:** Ship later or keep minimal: product mission, how content is administered, support/legal links. `PROPOSED`
- **SEO/content:** Avoid invented founder story, testimonials, user counts, certifications, or awards. `PROPOSED`

## 4. Contact / Support

- **Purpose:** Give users a way to request account, privacy, content, or technical help. `PROPOSED`
- **Status:** `NEEDS DECISION` because no support channel/owner is documented.
- **Hierarchy:** Help categories -> contact method -> privacy/legal links -> response-time expectations if verified. `PROPOSED`
- **Form:** Only collect name/contact/message/category; do not collect birth data again unless needed for support and disclosed. `PROPOSED`
- **Success:** Confirmation that request was sent or instructions for email. `PROPOSED`
- **Error/offline:** Preserve typed message, retry, alternative contact if available. `PROPOSED`

## 5. Question Flow (`/app/questions`)

- **Purpose:** Collect user reflections across Common, Level 1, and Level 2 layers. `DOCUMENTED` `CURRENT`
- **Primary user:** Authenticated seeker. `CURRENT`
- **Intent:** Answer questions honestly, save progress, receive guidance, continue to chart. `CURRENT` `PROPOSED`
- **Entry points:** Dashboard primary CTA, app nav, history start action. `CURRENT` `PROPOSED`
- **Exit points:** Dashboard, Chart after final layer, Profile if birth details missing. `PROPOSED`
- **Hierarchy:** Page intro -> full journey tracker -> current layer tabs/stepper -> question cards -> sticky save/continue action -> guidance answers after save. `PROPOSED`
- **Layout:** `container.reading`; optional desktop side progress; single column on mobile. `PROPOSED`
- **Primary CTA:** "Save and continue" or "Open your chart" after final save. `CURRENT` `PROPOSED`
- **Secondary actions:** Save draft, back to dashboard, switch layer if unlocked. `PROPOSED`
- **Loading:** Skeleton for intro, progress, 2-3 question cards. `PROPOSED`
- **Empty:** If no questions exist for category/level, explain that content is being prepared; admin should see this as content gap. Current empty copy exists. `CURRENT` `PROPOSED`
- **Error:** Inline alert with retry; preserve local draft. Current localStorage draft exists. `CURRENT` `PROPOSED`
- **Success:** Layer saved, guidance revealed, next layer unlocked. `CURRENT` `PROPOSED`
- **Permission:** Redirect unauthenticated users to login with return path. `CURRENT` `PROPOSED`
- **Mobile:** Large textareas, 16px text, sticky bottom action, horizontal layer controls scroll/wrap safely. `PROPOSED`
- **A11y:** Labels tied to inputs, `dir="auto"` for questions/answers, focus moves to next step heading after save. `CURRENT` `PROPOSED`

## 6. Chart (`/app/chart`)

- **Purpose:** Display computed astrology chart, key placements, accuracy, and interpretation. `CURRENT`
- **Primary user:** Authenticated seeker. `CURRENT`
- **Entry points:** Dashboard, questions final CTA, history detail. `CURRENT`
- **Exit points:** Remedy, dashboard, profile/birth details. `PROPOSED`
- **Hierarchy:** Header -> plain-language summary -> accuracy badge -> chart visual -> key placements -> interpretation -> technical table -> next CTA. `PROPOSED`
- **Layout:** `container.wide`; two-column summary/chart on desktop; stack on mobile. `PROPOSED`
- **Primary CTA:** "View your remedy" once chart exists. `PROPOSED`
- **Images/icons:** Actual chart visualization through `BirthChartView`/`@roxyapi/ui`, not decorative zodiac images. `CURRENT` `PROPOSED`
- **Loading:** Chart skeleton with reserved aspect ratio and interpretation skeleton. `PROPOSED`
- **Empty:** If birth details are insufficient, show required fields and link to profile. `PROPOSED`
- **Error:** Explain chart generation failed; retry and profile-edit option. `PROPOSED`
- **Success:** Chart generated, timestamp and accuracy shown. `CURRENT` `PROPOSED`
- **Mobile:** Chart must not overflow the viewport silently; allow controlled horizontal scroll only for technical tables. `PROPOSED`
- **A11y:** Provide textual summary for chart visual; tables need headers. `PROPOSED`

## 7. Remedy (`/app/remedy`)

- **Purpose:** Present the selected remedy for the current reading. `CURRENT`
- **Primary user:** Authenticated seeker. `CURRENT`
- **Hierarchy:** Header -> personal practice card -> steps/cadence -> why selected -> gentle disclaimer/support -> completion/history CTA. `PROPOSED`
- **Primary CTA:** "View reading history" or "Finish reading" depending on session state. `PROPOSED`
- **Secondary actions:** Back to chart, start new reading if complete. `PROPOSED`
- **Loading:** Skeleton practice card. `PROPOSED`
- **Empty:** If no remedy is available, say content is being prepared and let user return to dashboard; admin should see missing remedy gap. `PROPOSED`
- **Error:** Retry, back to chart/dashboard. `PROPOSED`
- **Success:** Completion confirmation when remedy snapshot is saved. `CURRENT` `PROPOSED`
- **Content:** Separate `what to do`, `why this practice`, and `how to repeat`; avoid medical promises. `PROPOSED`
- **A11y:** Icon decorative unless conveying status; prose uses readable line length and `dir="auto"`. `CURRENT` `PROPOSED`

## 8. Reading History (`/history`)

- **Purpose:** List past and active reading sessions. `CURRENT`
- **Hierarchy:** Header/count -> filters if needed -> session timeline/list -> empty state -> pagination. `PROPOSED`
- **Cards/list:** Each item shows status, dates, layer progress, chart/remedy readiness, primary action. `CURRENT` `PROPOSED`
- **Primary CTA:** For empty state, "Start your first reading"; for active item, "Continue"; for complete item, "View details". `CURRENT` `PROPOSED`
- **Loading:** Timeline skeleton. `PROPOSED`
- **Empty:** Current empty CTA exists; improve with explanation of what history stores. `CURRENT` `PROPOSED`
- **Pagination:** Current API call requests `limit: 50`; add pagination/load more when total exceeds shown count. `CURRENT` `PROPOSED`
- **Mobile:** Timeline cards full width; dates wrap cleanly. `PROPOSED`
- **A11y:** Status badges include text; list uses semantic article/list structure. `CURRENT` `PROPOSED`

## 9. Reading Detail (`/history/[id]`)

- **Purpose:** Review one saved reading with responses, chart, and remedy. `CURRENT`
- **Hierarchy:** Back link -> status/date summary -> insight summary -> responses -> remedy -> chart -> technical details. `PROPOSED`
- **Primary CTA:** Back to history; optional start new reading. `PROPOSED`
- **Loading:** Detail skeleton with reserved chart area. `PROPOSED`
- **Empty/partial:** If chart/remedy absent, show section-level empty copy; current page already handles no chart/no remedy. `CURRENT` `PROPOSED`
- **Error:** If session not found/unauthorized, show not-found or permission state, not raw API error. `PROPOSED`
- **Mobile:** Single column; chart after summary, responses collapsible if long. `PROPOSED`
- **A11y:** Back link first, headings per section, chart textual summary. `PROPOSED`

## 10. Admin Dashboard (`/admin`)

- **Purpose:** Operational command center for content/user/product health. `CURRENT` `PROPOSED`
- **Hierarchy:** Urgent actions -> key metrics -> content completeness -> AI review/import failures -> module links. `PROPOSED`
- **Primary CTA:** Resolve highest-priority operational issue, e.g. review AI answers or fix missing content. `PROPOSED`
- **Loading/error:** Current dashboard overview has error alerts; add metric skeletons. `CURRENT` `PROPOSED`
- **Mobile:** Metrics stack, tables become scroll/card summaries. `PROPOSED`
- **A11y:** Tables need captions/headers; charts need text equivalents. `PROPOSED`

## 11. Admin Content Pages

Applies to Questions, Answers, Remedies, Languages, Chart Config, Import, Users, and Audit Log. `CURRENT`

| Requirement | Specification |
|---|---|
| Header | Title, short description, primary action, filters/search where relevant. `PROPOSED` |
| Tables/lists | Use reusable table/list with loading, empty, error, pagination, and responsive card fallback. `PROPOSED` |
| Forms | Use `FormField`, clear validation, save/cancel, dirty-state handling. `PROPOSED` |
| Delete | Replace `window.confirm()` with confirmation dialog. `CURRENT` gap `PROPOSED` |
| Pagination | Required where current components fetch `limit=100` or other fixed limits. `CURRENT` `PROPOSED` |
| Success | Toast plus updated row state. `PROPOSED` |
| Errors | Inline alert near affected toolbar/form; preserve unsaved data. `PROPOSED` |
| Permission | Protected by admin route guard; show session-expired redirect path. `CURRENT` `PROPOSED` |
| i18n | Admin UI language support is `NEEDS DECISION`; content translation management remains required. `CURRENT` `PROPOSED` |

## 12. Not Found (`404`)

- **Purpose:** Recover from invalid routes. `PROPOSED`
- **Hierarchy:** Short title -> explanation -> primary link to homepage/dashboard based on session -> secondary support/privacy links. `PROPOSED`
- **SEO:** Noindex. `PROPOSED`
- **A11y:** Clear `<h1>`, focus lands on main content. `PROPOSED`
- **Mobile:** Centered but not full-height if footer exists. `PROPOSED`

## 13. Page Spec Verification

- Current route/page claims were checked against `apps/web/src/app` and `apps/web/src/components`. `CURRENT`
- Proposed pages align with [05-information-architecture.md](05-information-architecture.md). `PROPOSED`
- Legal/auth/home/dashboard/profile details are intentionally deferred to dedicated files. `PROPOSED`
