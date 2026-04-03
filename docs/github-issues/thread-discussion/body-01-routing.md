## Goal

Establish thread discussion **routing**, **TypeScript types**, and a **slug → category** mapper so each of the nine thread shapes is addressable during development.

## Spec

- Source: [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md) (Part 6 — Routing).
- Align with existing forum links: today cards use `/discussions/[slug]`. Either extend that route or add `/discussion/[id]` with redirects—**pick one convention** and document it in the issue closure notes.

## Canonical slugs (mock)

- `news-001`, `review-001`, `compare-001`, `launchpad-001`, `debate-001`, `help-001`, `list-001`, `showcase-001`, `gigs-001`

## Acceptance criteria

- [ ] Helper maps `slug` prefix (or full id) → category key compatible with [`apps/forum/src/lib/mock-data/categories.ts`](../../../apps/forum/src/lib/mock-data/categories.ts) (`launch-pad` vs `launchpad-001` handled explicitly).
- [ ] Thread view model type(s) defined (header fields shared by all categories; category-specific payload as discriminated union or optional blocks).
- [ ] Visiting each canonical slug renders the discussion route (placeholder body OK until later issues land).
- [ ] `pnpm --filter ./apps/forum typecheck` passes.

## Out of scope

Full UI implementation (follow-up issues).
