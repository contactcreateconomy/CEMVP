## Goal

Implement the **invariant 3-column shell** for thread pages, matching the **home feed** grid and tokens (no new visual language).

## Spec

- US-CORE-001 — Consistent Thread Shell
- Part 5 — Mobile: `<768px` left nav via existing hamburger/overlay; **right column below comments**; comparison table scroll hint wired when Compare body exists.

## Design constraints

- Reuse semantic colors from [`apps/forum/src/app/globals.css`](../../../apps/forum/src/app/globals.css) (`--bg-canvas`, `--bg-surface`, `--border-*`, `--text-*`).
- Compose with existing layout primitives / `AppShell` patterns from the feed.

## Acceptance criteria

- [ ] Center column stack: reserved slots for **Header → Category body → Comments → Composer** (body may be empty placeholder).
- [ ] Desktop: left nav + main + right rail grid matches feed proportions.
- [ ] Mobile: sidebar column content order per doc (context below comments when implemented).
- [ ] No layout shift flash on navigation (use existing `animate-route-emerge` or equivalent).

## Dependencies

- Routing/types issue (loader knows which page we are on).
