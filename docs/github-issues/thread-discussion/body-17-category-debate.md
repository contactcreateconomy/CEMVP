## Goal

**Debate** category: mock data + proposition + voting + argument summaries + MAX structure.

## Spec

- Category 5 — DEBATE in [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md)

## MIN

- [ ] US-MIN-DEBATE-001 — Proposition block + status Open/Closed/Resolved.
- [ ] US-MIN-DEBATE-002 — Vote bar + Agree/Disagree/Abstain; disabled when closed; radio-style single choice.
- [ ] US-MIN-DEBATE-003 — For/Against columns with 2 cards each; strength via border weight; upvotes; Add argument CTA (auth-gated).

## MAX

- [ ] US-MAX-DEBATE-001 — Argument tree, 2 levels default, expand, scroll to comment on node click.
- [ ] US-MAX-DEBATE-002 — Fallacy chips on comments (MAX only).
- [ ] US-MAX-DEBATE-003 — Common ground card in insight rail.

## Acceptance criteria

- [ ] `/discussions/debate-001` complete.
- [ ] Vote bar animates on vote (CSS transition).

## Dependencies

- Comments; auth modal; MIN/MAX; insight rail.
