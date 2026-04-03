## Goal

**News** category: typed mock data + body between header and comments.

## Spec

- Category 1 — NEWS in [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md)

## MIN

- [ ] US-MIN-NEWS-001 — Source identity block (favicon, name, published, Read original / original reporting).
- [ ] US-MIN-NEWS-002 — Recency: published + updated lines; “older content” muted treatment past threshold.
- [ ] US-MIN-NEWS-003 — Corroboration strip (2–4 sources, stance chips Confirms / Skeptical / Contradicts + empty state).

## MAX

- [ ] US-MAX-NEWS-001 — Credibility badges + tooltip “why this matters” (hidden in MIN).
- [ ] US-MAX-NEWS-002 — Event timeline in insight rail (or agreed placement with issue 6).
- [ ] US-MAX-NEWS-003 — Conflicting reports card when any Contradicts exists.

## Data

- New file under `apps/forum/src/lib/mock-data/` (e.g. `thread-news.ts`) with **min + max** fields populated for demo.

## Acceptance criteria

- [ ] `/discussions/news-001` renders full News body + passes typecheck.
- [ ] Stance colors use semantic feedback tokens where possible.

## Dependencies

- Thread shell, header, MIN/MAX.
