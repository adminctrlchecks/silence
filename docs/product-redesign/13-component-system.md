# Component System

> Reusable component architecture for Silence. Current primitives are small; the redesign should expand them deliberately without inventing unnecessary product functionality.

---

## 1. Current Component Inventory

| Component/Area | Current State |
|---|---|
| `Button` | Variant/size primitive using `class-variance-authority`, Radix `Slot`, focus ring, disabled opacity. `CURRENT` |
| `Input` | Basic input primitive. `CURRENT` |
| `Label` | Basic label primitive. `CURRENT` |
| `ScreenState` | Loading, empty, error components with icons and `role` usage for error/loading. `CURRENT` |
| Auth cards | Login/register/forgot/reset/change-password cards. `CURRENT` |
| User feature components | Session picker, question flow, chart view, profile card. `CURRENT` |
| Admin shell/components | Sidebar, header, dashboard overview, CRUD modules, import/languages/users/audit. `CURRENT` |
| Missing primitives | Select, textarea, checkbox, radio, switch, modal/dialog, drawer, dropdown, tabs, toast, tooltip, table, pagination, form-field abstraction. `CURRENT` gap |

## 2. Component Design Rules

- Components should consume semantic tokens from [12-design-tokens.md](12-design-tokens.md). `PROPOSED`
- Form controls must have visible labels and error text relationships. `PROPOSED`
- Use `lucide-react` for icons because it is already installed and used. `CURRENT` `PROPOSED`
- Use icons in icon buttons instead of text-only tool controls when the meaning is familiar; add labels/tooltips for clarity. `PROPOSED`
- Avoid nested cards except repeated subitems and modals. `PROPOSED`
- Build admin components for density; build user components for guidance and reflection. `PROPOSED`

## 3. Core Primitives

| Component | Purpose | Variants/States | Accessibility |
|---|---|---|---|
| Button | Primary/secondary commands and links | primary, secondary, outline, ghost, destructive; sizes sm/md/lg/icon; loading/disabled | Native button/link semantics, focus ring, icon labels for icon-only. `CURRENT` `PROPOSED` |
| IconButton | Compact toolbar/menu action | default, ghost, danger; sizes 36/40/44 | Required `aria-label`, tooltip recommended. `PROPOSED` |
| Link | Inline/nav links | default, nav, subdued, external | Underline/focus visible for body links; `aria-current` in nav. `PROPOSED` |
| Badge/Tag | Status/category/source labels | neutral, primary, success, warning, error, info | Text + color; no color-only state. `PROPOSED` |
| Avatar/Identity | User/admin initials or profile marker | user, admin, placeholder | Alt text or decorative hidden if redundant. `PROPOSED` |
| Divider | Separate content groups | horizontal/vertical | Use semantic sectioning first. `PROPOSED` |

## 4. Form Components

| Component | Purpose | Required Behavior |
|---|---|---|
| FormField | Label, control, help, error, required marker | `aria-describedby`, stable error slot, supports translated expansion. `PROPOSED` |
| Input | Text/date/time/contact/password base | Current primitive remains; add invalid/success/disabled states. `CURRENT` `PROPOSED` |
| Textarea | Reflective answers and remedy/admin content | Auto/min height, character count optional, `dir="auto"`. `PROPOSED` |
| Select | Category, language, level, source filters | Native select first; custom only if accessibility is preserved. `CURRENT` `PROPOSED` |
| Combobox | Place search, admin content lookup | Keyboard navigation, loading/empty/error states, selected item summary. `PROPOSED` |
| Checkbox | Consent, reviewed/enabled flags | Clear label, error state, 44px touch target on mobile. `CURRENT` `PROPOSED` |
| Radio/SegmentedControl | Mutually exclusive categories/levels | Use for short option sets such as category/language preferences. `PROPOSED` |
| Switch | Boolean settings/enabled flags | Use for persistent on/off settings, not one-time actions. `PROPOSED` |
| PasswordField | Show/hide password | Current separate component should standardize icon button labels. `CURRENT` `PROPOSED` |

## 5. Feedback Components

| Component | Purpose | Rules |
|---|---|---|
| Alert | Inline feedback/warnings/errors | Status token, icon, title, message, optional action. `PROPOSED` |
| Toast | Non-blocking success/failure | Use for save/import actions; must not replace inline errors. `PROPOSED` |
| LoadingState | Page/section loading | Current spinner exists; add skeleton variants by page. `CURRENT` `PROPOSED` |
| Skeleton | Perceived performance | Cards, tables, chart panels; no layout shift. `PROPOSED` |
| EmptyState | No data/content | Title, explanation, primary action, optional admin guidance. `CURRENT` `PROPOSED` |
| ErrorState | Recoverable failure | Title, plain-language message, retry/back/support action. `CURRENT` `PROPOSED` |
| SuccessState | Completion moments | Reading completion, password updated, import success. `PROPOSED` |
| ConfirmationState | Destructive confirmation | Replace `window.confirm()` in admin delete actions. `CURRENT` gap `PROPOSED` |

## 6. Overlay Components

| Component | Use | Accessibility |
|---|---|---|
| Modal/Dialog | Confirm delete, account deletion, important decisions | Focus trap, Escape/backdrop handling, labelled title/description. `PROPOSED` |
| Drawer | Mobile nav, admin filters, detail preview | Focus trap, logical RTL side, safe-area padding. `PROPOSED` |
| Dropdown/Menu | Profile menu, language selector | Keyboard navigation, typeahead where useful. `PROPOSED` |
| Popover | Lightweight contextual controls | Dismissible, labelled trigger, no critical content hidden only on hover. `PROPOSED` |
| Tooltip | Icon explanations | Supplemental only; never required to complete a task. `PROPOSED` |

## 7. Navigation Components

| Component | Purpose |
|---|---|
| PublicNavbar | Logo, public links, language, auth CTA, mobile menu. `PROPOSED` |
| UserAppNav | Dashboard/questions/chart/remedy/history/profile controls. `PROPOSED` |
| MobileBottomNav | Core app destinations on small screens. `PROPOSED` |
| AdminSidebar | Current component retained and refined. `CURRENT` `PROPOSED` |
| AdminHeader | Current component retained with improved mobile search/profile/settings. `CURRENT` `PROPOSED` |
| Footer | Public/user legal and support links. `PROPOSED` |
| Breadcrumb | Detail/admin nested routes only. `PROPOSED` |
| Tabs | Profile sections, chart details, admin subviews. `PROPOSED` |

## 8. Data Display Components

| Component | Use | Notes |
|---|---|---|
| Card | Individual repeated item or distinct section | Avoid page sections as decorative nested cards. `CURRENT` `PROPOSED` |
| StatCard | Dashboard/admin metrics | Include label, value, trend/status, explanation. `CURRENT` `PROPOSED` |
| Table | Admin data and chart planets table | Sticky header optional, responsive card fallback. `CURRENT` `PROPOSED` |
| Pagination | Admin lists/history | Required because several current admin fetches use `limit=100`. `CURRENT` gap `PROPOSED` |
| FilterBar | Admin questions/answers/remedies/users | Search, category, level, source, reviewed, language. `PROPOSED` |
| Timeline | Reading history and admin user journey | Sessions, responses, chart, remedy, admin events. `PROPOSED` |
| ProgressIndicator | Reading layers/profile completeness | Current dashboard progress bar exists; expand to journey tracker. `CURRENT` `PROPOSED` |
| Stepper | Registration and question layers | Use for multi-step profile creation and reading flow. `CURRENT` partial `PROPOSED` |

## 9. Product-Specific Components

| Component | Purpose | Notes |
|---|---|---|
| ReadingJourneyTracker | Show Common -> Level 1 -> Level 2 -> Chart -> Remedy status | Dashboard and questions. `PROPOSED` |
| QuestionCard | One question + help + response control + guidance answer | Extract from current `QuestionFlow`. `CURRENT` `PROPOSED` |
| AnswerGuidancePanel | Shows admin/AI answer after save | Include source/review status only for admin, not user unless useful. `PROPOSED` |
| ChartSummary | Plain-language chart overview | Distinguish computed data from Gemini interpretation. `PROPOSED` |
| ChartAccuracyBadge | exact/approximate/uncertain | Current chart messages exist; make reusable. `CURRENT` `PROPOSED` |
| RemedyPracticeCard | Structured title, steps, why selected, cadence | Replaces single paragraph remedy display. `PROPOSED` |
| TranslationCoverageCell | Admin completeness matrix | Current dashboard has content matrix; standardize component. `CURRENT` `PROPOSED` |
| AIReviewItem | Admin AI answer queue row/card | Improve review workflow. `CURRENT` `PROPOSED` |

## 10. When Not To Use Components

- Do not use a modal for simple navigation. `PROPOSED`
- Do not use a toast for form validation that needs correction. `PROPOSED`
- Do not use cards for every section of every page; use layout sections. `PROPOSED`
- Do not use custom selects/comboboxes where native controls are sufficient. `PROPOSED`
- Do not add charts to admin metrics unless the metric supports a real decision. `PROPOSED`

## 11. Implementation Order

1. Token-backed primitives: Button, Link, FormField, Input, Textarea, Select, Checkbox, Alert. `PROPOSED`
2. Feedback/overlay system: Toast, Dialog, Drawer, Empty/Loading/Error/Skeleton. `PROPOSED`
3. Navigation shell: PublicNavbar, UserAppNav, Footer, MobileBottomNav. `PROPOSED`
4. Product components: JourneyTracker, QuestionCard, ChartSummary, RemedyPracticeCard. `PROPOSED`
5. Admin data components: Table, Pagination, FilterBar, ConfirmationDialog. `PROPOSED`

## 12. QA Requirements

- Keyboard-only operation for menus, dialogs, drawers, forms, tabs, and tables. `PROPOSED`
- Screen reader labels for all icon-only controls. `PROPOSED`
- No layout shift between loading, empty, error, and loaded states. `PROPOSED`
- RTL screenshot review for nav, form fields, drawers, and chart text wrappers. `PROPOSED`
