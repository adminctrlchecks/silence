# Icon System

> Icon strategy for Silence, standardizing the existing `lucide-react` usage.

---

## 1. Current Icon State

- `lucide-react` is installed in the web app and used across public, auth, user, chart/remedy, and admin components. `CURRENT`
- Current icons include `MoonStar`, `Sparkles`, `ShieldCheck`, `Languages`, `ArrowRight`, `Menu`, `Search`, `Users`, `ClipboardList`, and others. `CURRENT`
- Icons are generally inline React components sized with Tailwind utilities such as `size-4` and `size-5`. `CURRENT`
- Some decorative icons already use `aria-hidden`. `CURRENT`
- No icon usage rules, semantic mapping, or icon-only button tooltip standard exists. `CURRENT` gap

## 2. Library Standard

Use Lucide as the single icon family for UI icons. `CURRENT` `PROPOSED`

Reasoning:
- Already installed and widely used. `CURRENT`
- Consistent line style fits the product's calm SaaS direction. `PROPOSED`
- Official Lucide license is ISC. Source: [Lucide License](https://lucide.dev/license). `CURRENT`

Do not mix Font Awesome, Heroicons, Material Icons, emoji icons, and custom SVG icon sets unless there is a specific product need. `PROPOSED`

## 3. Icon Style

| Rule | Value |
|---|---|
| Stroke | Lucide default stroke; avoid filled custom icons except brand/logo. `PROPOSED` |
| Default size | 16px (`size-4`) inside buttons/nav/table rows. `CURRENT` `PROPOSED` |
| Medium size | 20px (`size-5`) for feature cards/remedy/chart markers. `CURRENT` `PROPOSED` |
| Large size | 24-32px for empty states and step visuals. `PROPOSED` |
| Stroke width | Default 2px unless design token defines otherwise. `PROPOSED` |
| Color | Inherit current text color; use semantic status tokens for status icons. `CURRENT` `PROPOSED` |

## 4. Semantic Icon Map

| Meaning | Recommended Icons | Usage |
|---|---|---|
| Product/celestial | `MoonStar`, `Sparkles` | Brand-adjacent, chart/remedy. `CURRENT` `PROPOSED` |
| Language | `Languages` | Language selector/settings. `CURRENT` |
| Security/trust | `ShieldCheck`, `ShieldAlert`, `Lock` | Consent/privacy/auth/admin-as-user. `CURRENT` `PROPOSED` |
| Questions | `ClipboardList`, `MessageSquareText` | Question flow/admin questions. `CURRENT` `PROPOSED` |
| Chart/data | `BarChart3`, `Orbit`, `Table2` | Chart config/admin/chart detail. `CURRENT` `PROPOSED` |
| Remedy/practice | `Sparkles`, `HeartHandshake` | Remedy card and completion. `CURRENT` `PROPOSED` |
| History | `History`, `Clock` | Reading history/timeline. `CURRENT` |
| User/profile | `UserRound`, `Users` | Profile/admin users. `CURRENT` |
| Import | `FileSpreadsheet`, `Upload` | Admin import. `CURRENT` `PROPOSED` |
| Error/warning | `AlertTriangle`, `CircleAlert` | Error/warning states. `CURRENT` `PROPOSED` |
| Success | `CheckCircle2`, `Check` | Completion/saved states. `CURRENT` |

## 5. Button Icon Rules

- Primary CTAs may include a trailing directional icon only when it clarifies forward movement. `PROPOSED`
- Destructive actions use trash/delete icons only with visible text or confirmation dialog. `PROPOSED`
- Icon-only buttons must have `aria-label` and preferably `title`/tooltip. Current admin header follows this. `CURRENT` `PROPOSED`
- Loading buttons use `Loader2` with text label and `aria-busy` where implemented. `CURRENT` `PROPOSED`
- Do not use icons to compensate for unclear copy. `PROPOSED`

## 6. Navigation Icon Rules

- Public nav links do not need icons except language/menu/profile controls. `PROPOSED`
- User bottom nav should use one icon per destination plus text label. `PROPOSED`
- Admin sidebar keeps icons because dense module navigation benefits from them. `CURRENT` `PROPOSED`
- Active state must include color and background/indicator plus `aria-current`. `PROPOSED`

## 7. Decorative Vs Informative

| Type | Requirement |
|---|---|
| Decorative | `aria-hidden="true"` and no duplicate screen-reader text. `PROPOSED` |
| Informative | Visible label or accessible name. `PROPOSED` |
| Status | Text label plus icon; not color-only. `PROPOSED` |
| Action | Icon button requires accessible name. `PROPOSED` |

## 8. Product-Specific Icon Usage

- Do not overuse stars/sparkles; reserve them for brand/remedy/completion moments. `PROPOSED`
- Use chart/table/data icons for computed astrology information to keep it credible. `PROPOSED`
- Use shield/lock icons for privacy/security rather than mystical symbols. `PROPOSED`
- Use neutral admin icons for CRUD/operations. `CURRENT` `PROPOSED`

## 9. Icon Asset Governance

- Keep all UI icons imported from `lucide-react`. `CURRENT` `PROPOSED`
- Brand logo/mark is a separate brand asset, not a Lucide icon. `PROPOSED`
- If custom astrology glyphs are added later, define their source/license and ensure they do not clash visually with Lucide. `NEEDS DECISION`
- Do not use trademarked third-party brand logos from Lucide; OAuth provider logos require separate asset/licensing review. `NEEDS DECISION`

## 10. Acceptance Criteria

- One coherent icon family across public, user, and admin UI. `PROPOSED`
- Icon-only controls are accessible. `PROPOSED`
- Semantic icons are consistently mapped. `PROPOSED`
- Icons never carry critical meaning without text. `PROPOSED`
- Custom/brand icons have licensing and ownership documented. `NEEDS DECISION`
