# Spacing, Grid, And Layout

> Layout system for a coherent public site, user app, and admin console.

---

## 1. Current Layout State

- Public/user pages primarily use centered containers with `max-w-6xl`, `max-w-7xl`, `max-w-4xl`, `px-4`, `sm:px-6`, and `py-8` or `py-10`. `CURRENT`
- Most page content is placed inside `rounded-md border border-border bg-card p-5 shadow-sm` cards. `CURRENT`
- Current border radius is `--radius: 0.5rem`, with small/large variants computed in Tailwind theme. `CURRENT`
- Admin shell uses fixed/collapsible sidebar widths (`w-72`, `w-20`) and content frame `max-w-7xl px-4 py-5 md:px-6`. `CURRENT`
- Mobile behavior is mostly stacking grids and shrinking containers; there is no complete mobile navigation/layout system yet. `CURRENT`

## 2. Layout Principles

- Use fewer, clearer containers: page, section, cluster, card. `PROPOSED`
- Avoid cards inside cards unless the inner card is a repeated item or true subpanel. `PROPOSED`
- Public pages should use full-width bands with constrained inner content, not floating card-only pages. `PROPOSED`
- User app pages should use stable widths and predictable reading surfaces. `PROPOSED`
- Admin should prioritize scan density and table ergonomics. `PROPOSED`

## 3. Spacing Scale

| Token | Value | Usage |
|---|---:|---|
| `space.0` | 0 | Resets. `PROPOSED` |
| `space.1` | 4px | Tight icon/text gaps. `PROPOSED` |
| `space.2` | 8px | Badge gaps, compact controls. `PROPOSED` |
| `space.3` | 12px | Form field internal gaps, small stacks. `PROPOSED` |
| `space.4` | 16px | Base grid gap, mobile card padding. `CURRENT` `PROPOSED` |
| `space.5` | 20px | Current common card padding (`p-5`). `CURRENT` `PROPOSED` |
| `space.6` | 24px | Standard section/card padding. `PROPOSED` |
| `space.8` | 32px | Page block gaps, desktop form sections. `PROPOSED` |
| `space.10` | 40px | Mobile page vertical padding, hero compact. `CURRENT` `PROPOSED` |
| `space.12` | 48px | Section spacing. `PROPOSED` |
| `space.16` | 64px | Public page band spacing. `PROPOSED` |
| `space.20` | 80px | Desktop homepage section spacing. `PROPOSED` |
| `space.24` | 96px | Large desktop hero/major sections only. `PROPOSED` |

## 4. Containers

| Container | Width | Use |
|---|---:|---|
| `container.narrow` | 720px | Legal, auth explanatory copy, support forms. `PROPOSED` |
| `container.reading` | 880px | Questions, remedy, history content. `CURRENT` `PROPOSED` |
| `container.app` | 1120px | Dashboard, profile, user shell. `CURRENT` `PROPOSED` |
| `container.wide` | 1280px | Chart page, admin dashboard, data-heavy layouts. `CURRENT` `PROPOSED` |
| `container.full` | 100% | Admin tables and mobile full-bleed controls inside safe gutters. `PROPOSED` |

Gutters:
- Mobile: 16px. `CURRENT` `PROPOSED`
- Large mobile/tablet: 24px. `CURRENT` `PROPOSED`
- Desktop: 32px where available. `PROPOSED`
- Admin: 16-24px to preserve density. `CURRENT` `PROPOSED`

## 5. Grid Rules

| Surface | Desktop | Tablet | Mobile |
|---|---|---|---|
| Homepage hero | 12-column grid or 2-column text/product preview | 2-column if space allows | Single column; hint next section below fold. `PROPOSED` |
| Dashboard | Main journey panel + supporting cards | 2-column cards | Single column; primary CTA first. `PROPOSED` |
| Questions | Single reading column; side progress optional | Single column | Single column, sticky bottom action if needed. `PROPOSED` |
| Chart | Summary + chart/data split; advanced details below | Stack summary/chart | Chart responsive with horizontal overflow only if unavoidable. `PROPOSED` |
| Remedy | Single focused column with structured sections | Same | Same, large touch actions. `PROPOSED` |
| Admin lists | Toolbar + table + side/detail drawer where useful | Table with horizontal scroll or card rows | Card/list rows with filters drawer. `PROPOSED` |

## 6. Radius, Border, Elevation

| Token | Value | Usage |
|---|---:|---|
| `radius.xs` | 4px | Badges, tiny controls. `PROPOSED` |
| `radius.sm` | 6px | Inputs, compact cards. `CURRENT` `PROPOSED` |
| `radius.md` | 8px | Standard buttons/cards, matches current `--radius`. `CURRENT` `PROPOSED` |
| `radius.lg` | 10px | Modals/drawers only. `PROPOSED` |
| `radius.full` | 999px | Pills/progress. `PROPOSED` |

Elevation:
- `shadow.none`: flat surfaces and admin tables. `PROPOSED`
- `shadow.sm`: current card default; keep subtle. `CURRENT` `PROPOSED`
- `shadow.md`: popovers, dropdowns, modals. `PROPOSED`
- Avoid heavy/glowy shadows; use border + background contrast first. `PROPOSED`

## 7. Alignment Rules

- Page headings align to container left/start and use logical properties for RTL. `PROPOSED`
- Buttons in forms align start on desktop and stretch only when mobile ergonomics require it. `PROPOSED`
- Data tables align text by content type: text start, numbers end, status center/start depending on density. `PROPOSED`
- Chart and remedy pages should not center long prose; keep readable line length. `PROPOSED`

## 8. Stable Dimensions

- Icon buttons: fixed 40x40 current default; keep stable across states. `CURRENT` `PROPOSED`
- Bottom nav items: fixed height 56-64px and equal columns. `PROPOSED`
- Progress bars: fixed 8px height. Current dashboard uses 8px profile completeness bar. `CURRENT` `PROPOSED`
- Cards in repeated grids should have consistent min-height only when content comparison matters. `PROPOSED`
- Modals/drawers should use max-height with scrollable body and fixed footer actions. `PROPOSED`

## 9. Page-Level Section Order

Recommended default:

1. Global shell/nav
2. Page header with title, subtitle, primary action
3. Primary task region
4. Supporting/secondary information
5. Related navigation or history
6. Footer/legal links where appropriate

`PROPOSED`

## 10. Implementation Notes

- Consolidate container and spacing utilities into shared layout components or utility classes. `PROPOSED`
- Reduce page-local arbitrary layout decisions before adding new pages. `PROPOSED`
- Keep admin shell widths unless there is a strong usability reason to change them. `CURRENT` `PROPOSED`
- Test at small mobile, large mobile, tablet, desktop, and large desktop before final implementation. `PROPOSED`
