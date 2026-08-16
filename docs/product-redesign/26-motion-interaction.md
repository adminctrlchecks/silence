# Motion And Interaction

> Motion, interaction feedback, and micro-interaction guidance for Silence.

---

## 1. Current Motion State

- Buttons and admin shell use CSS transitions for color/padding/sidebar movement. `CURRENT`
- Admin sidebar transition duration is 300ms. `CURRENT`
- Roxy variables include `--roxy-motion-duration: 200ms`. `CURRENT`
- Loading buttons use `Loader2` spinning icon in several components. `CURRENT`
- No global reduced-motion strategy is documented. `CURRENT` gap
- No toast system, modal transitions, or page transitions are implemented as a unified system. `CURRENT` gap

## 2. Motion Principles

- Motion should clarify state changes, not create spectacle. `PROPOSED`
- Reading flows should feel calm and stable; avoid flashy astrology effects. `PROPOSED`
- Admin motion should be fast and utilitarian. `PROPOSED`
- All non-essential motion must respect `prefers-reduced-motion`. `PROPOSED`

## 3. Motion Tokens

| Token | Duration | Use |
|---|---:|---|
| `motion.fast` | 120ms | Hover/focus/pressed feedback. `PROPOSED` |
| `motion.base` | 180-200ms | Dropdowns, small reveals, current Roxy alignment. `CURRENT` `PROPOSED` |
| `motion.slow` | 250-300ms | Drawers, sidebars, larger layout movement. `CURRENT` `PROPOSED` |
| `motion.none` | 0-1ms | Reduced motion fallback. `PROPOSED` |

## 4. Interaction Feedback

| Interaction | Behavior |
|---|---|
| Button hover | Subtle background/color change; no scale. `CURRENT` `PROPOSED` |
| Button active | Slightly stronger pressed color or shadow inset. `PROPOSED` |
| Focus | Visible ring; no motion-dependent indication. `CURRENT` `PROPOSED` |
| Save action | Loading icon + disabled state + success confirmation. `CURRENT` `PROPOSED` |
| Delete action | Confirmation dialog, then loading/destructive feedback. `PROPOSED` |
| Language/category selection | Immediate selected state and saved preference confirmation only if needed. `CURRENT` `PROPOSED` |

## 5. Page And Route Transitions

- Do not add animated route transitions in the first implementation pass. `PROPOSED`
- Use skeletons/loading states instead of page fades for data-heavy routes. `PROPOSED`
- If later added, route transitions must not delay navigation or disorient screen reader users. `PROPOSED`

## 6. Loading Motion

- Keep spinner only when paired with text. Current loading state/button patterns do this in many places. `CURRENT`
- Use skeletons for dashboard, questions, chart, history, admin tables. `PROPOSED`
- Chart generation can show a calm progress state with static steps, not an animated cosmic effect. `PROPOSED`
- Avoid infinite shimmer if reduced motion is enabled. `PROPOSED`

## 7. Drawers, Menus, Modals

- Drawer/sidebar open/close: 250-300ms transform, reduced to near-zero for reduced motion. `CURRENT` `PROPOSED`
- Dropdowns/popovers: 120-180ms opacity/translate; must be usable without animation. `PROPOSED`
- Modals: subtle opacity/scale or slide depending on device; focus trap is more important than animation. `PROPOSED`
- Toasts: fade/slide within 180ms; allow manual dismissal and timeout pause on hover/focus. `PROPOSED`

## 8. Reading Journey Interactions

- Step completion should use a calm check/success transition. `PROPOSED`
- Revealed guidance answers can expand below the saved question with focus management. Current answers appear after save. `CURRENT` `PROPOSED`
- Completion moment can be a success panel, not confetti. `PROPOSED`
- Remedy card should feel deliberate through layout/content, not animation. `PROPOSED`

## 9. Admin Interactions

- Sidebar collapse/expand stays current but should add accessible state text. `CURRENT` `PROPOSED`
- Table row actions should show hover/focus affordances. `PROPOSED`
- Bulk/import progress should use clear status states and progress, not only spinner. `PROPOSED`
- AI review approve/reject should update row state immediately with undo only if implementation supports it. `PROPOSED`

## 10. Reduced Motion

Requirements:
- Use CSS media query for `prefers-reduced-motion`. `PROPOSED`
- Disable non-essential transform/opacity transitions. `PROPOSED`
- Replace spinner-only loops with static status text where possible. `PROPOSED`
- Keep focus and state changes visible even when motion is disabled. `PROPOSED`

## 11. Acceptance Criteria

- Motion does not block completing registration, questions, chart, remedy, or admin CRUD. `PROPOSED`
- Reduced-motion users can use the product without continuous animation. `PROPOSED`
- Loading/success/error transitions preserve layout dimensions. `PROPOSED`
- Admin interactions feel immediate and not decorative. `PROPOSED`
- No large-scale decorative animation is introduced without a documented usability purpose. `PROPOSED`
