## Goal

**Help** category: mock data + structured body + **code block** primitive (OP + comments).

## Spec

- Category 6 — HELP in [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md)

## MIN

- [ ] US-MIN-HELP-001 — Problem block: goal / tried / stuck + environment chips.
- [ ] US-MIN-HELP-002 — Solved vs unsolved banner + jump to solution + comment styling (coordinates with comments issue).
- [ ] US-MIN-HELP-003 — Code blocks: dark surface, monospace, syntax highlight, language label, copy → “Copied ✓” 2s.

## MAX

- [ ] US-MAX-HELP-001 — “I have this too” counter (optimistic).
- [ ] US-MAX-HELP-002 — Troubleshooting path card in insight rail (static mock).

## Shared primitive

- [ ] Extract reusable **code block** component for thread body and comment markdown rendering (or shared renderer).

## Acceptance criteria

- [ ] `/discussions/help-001` demonstrates solved thread with solution comment in mock.
- [ ] Code blocks work in at least one OP paragraph and one comment in mock.

## Dependencies

- Comments + composer; MIN/MAX; insight rail optional for MAX-HELP-002.
