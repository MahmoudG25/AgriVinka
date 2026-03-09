# Animation Guidelines — AgriVinka

## Tokens (defined in `src/utils/motion.js`)

| Token       | Value                        | When to use              |
|-------------|------------------------------|--------------------------|
| `fast`      | 200ms                        | Hover, tap, micro states |
| `normal`    | 350ms                        | Cards, reveals           |
| `slow`      | 500ms                        | Hero sections, big elements |
| `page`      | 400ms                        | Page-level enter         |
| Ease out    | `[0.22, 1, 0.36, 1]`        | Default for all reveals  |
| Distance sm | 8px                          | Subtle nudge             |
| Distance md | 16px                         | Default card/section     |
| Distance lg | 28px                         | Hero-level entrance      |

## Wrapper Components

| Component        | Use case                                           |
|------------------|----------------------------------------------------|
| `FadeIn`         | Viewport-enter fade + translateY for sections/cards |
| `SlideUp`        | Stronger vertical entrance for headings/heroes      |
| `ScaleCard`      | Card with hover lift + tap press + viewport reveal  |
| `StaggerList`    | Parent container for staggered children             |
| `StaggerItem`    | Child item inside `StaggerList`                     |
| `PageTransition` | Wrap page content for enter animation               |

## Rules

1. **Don't animate everything** — only elements the user's eye lands on.
2. **One animation per element** — don't stack whileInView + whileHover + layout.
3. **Always use `viewport={{ once: true }}`** — never replay on scroll-up.
4. **Reduced motion** — all wrappers auto-degrade. For custom animations, check `useReducedMotion()`.
5. **No GSAP** — Framer Motion is sufficient for this project.
6. **Skeleton shimmer** — use `className="skeleton-shimmer"` for loading placeholders (CSS-only, no JS).
7. **Duration ceiling** — never exceed 500ms. Users notice delays above that.
8. **Stagger ceiling** — max 0.08s between children. More than 6-8 items shouldn't stagger (too slow).

## Import Example

```jsx
import { FadeIn, ScaleCard, StaggerList, StaggerItem } from '../../utils/motion';

// Viewport reveal
<FadeIn delay={0.1}><MyComponent /></FadeIn>

// Card with hover
<ScaleCard className="..."><CardContent /></ScaleCard>

// Staggered grid
<StaggerList className="grid grid-cols-3 gap-6">
  {items.map(item => (
    <StaggerItem key={item.id}><Card {...item} /></StaggerItem>
  ))}
</StaggerList>
```
