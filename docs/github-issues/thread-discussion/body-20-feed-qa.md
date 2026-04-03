## Goal

Wire **feed → thread** navigation for all nine mock threads and run an **acceptance pass** against the user-stories doc.

## Spec

- [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md) — Parts 4–6

## Tasks

- [ ] Ensure feed / post cards / hero carousel link to the correct **discussion slugs** (`news-001`, …) or the chosen canonical route.
- [ ] Add dev-only index or Storybook-style list (optional) linking to all nine URLs for QA.
- [ ] Checklist walk: MIN default, MAX toggles, mobile breakpoints (768px), auth-gated actions, share toast, Help solution jump, Compare table scroll, Showcase swipe.

## Acceptance criteria

- [ ] Every category reachable in ≤2 clicks from `/feed`.
- [ ] `pnpm --filter ./apps/forum lint` and `typecheck` pass.
- [ ] Short QA notes in PR description (what was manually verified).

## Dependencies

- All category issues merged or feature-complete on branch.
