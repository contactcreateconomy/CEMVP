## Goal

**Threaded comment section** with sorting, voting, reply, nesting depth rules, and Help-thread solution affordances.

## Spec

- US-CORE-005 — Comment Section

## Behavior

- Sort bar: count on left; **Best / New / Top** pills (match feed tab styling).
- Per comment: avatar, name, handle, reputation, **OP** badge, timestamp.
- Upvote / downvote: optimistic UI; up and down mutually exclusive.
- Reply expands **inline composer** under that comment.
- Overflow: Report, Copy link.
- Nesting: **depth 3** in MIN; **depth 5** in MAX; level-3 **“Continue this thread →”** expands deeper inline.
- Empty state: “Be the first to reply…” + CTA.

## Help category (hook)

- When mock marks a comment as solution: green left border + **Solution** badge.
- Banner at top of comment section: link **Jump to solution** (scroll).

## Acceptance criteria

- [ ] Mock comments include nested examples + optional `isSolution` for `help-001`.
- [ ] Auth-gated actions defer to existing auth modal (Part 4—can pair with issue 10).

## Dependencies

- Shell layout; MIN/MAX state for depth.
