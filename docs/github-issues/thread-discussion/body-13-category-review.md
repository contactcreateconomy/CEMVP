## Goal

**Review** category: mock data + product / verdict / scorecard + MAX interactions.

## Spec

- Category 2 — REVIEW in [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md)

## MIN

- [ ] US-MIN-REVIEW-001 — Product card (sticky on desktop).
- [ ] US-MIN-REVIEW-002 — Verdict strip: stars, label (Recommended / With caveats / Not recommended), rationale.
- [ ] US-MIN-REVIEW-003 — Criteria scorecard with weighted %, animated bars on mount, weighted total.

## MAX

- [ ] US-MAX-REVIEW-001 — Adjustable weights → live recalculated score + reset.
- [ ] US-MAX-REVIEW-002 — Reviewer context card as chips (hidden in MIN).
- [ ] US-MAX-REVIEW-003 — Community sentiment card in insight rail (mock % + quotes).

## Acceptance criteria

- [ ] `/discussions/review-001` complete.
- [ ] Sliders use `@/components/ui/slider` (or equivalent) and match forum tokens.

## Dependencies

- MIN/MAX; insight rail for MAX-REVIEW-003.
