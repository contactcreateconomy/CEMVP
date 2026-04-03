## Goal

Cross-cutting **interaction states** (Part 4) and remaining **mobile** polish (Part 5).

## Spec

- Part 4 — Interaction states  
- Part 5 — Mobile behaviour (compose items not covered elsewhere)

## Part 4 checklist

- [ ] Thread upvote toggle + count (optimistic).
- [ ] Bookmark toggle + count (optimistic).
- [ ] Share → clipboard + short toast.
- [ ] Comment upvote/downvote rules (Part 4).
- [ ] Debate vote bar animation when Debate body lands (stub OK here if wired later).
- [ ] Review / Compare sliders: live recalc (when those bodies exist).
- [ ] Showcase thumbnail selection (when Showcase exists).
- [ ] Gigs Apply → modal → toast (when Gigs exists).
- [ ] **Auth-gated** actions open **existing** feed auth modal—no new auth flow.

## Part 5 additions

- [ ] Composer full-width on small screens; markdown toolbar collapses to **···** overflow.

## Acceptance criteria

- [ ] Manual smoke on one thread slug in mobile width.
- [ ] No duplicate auth modals.

## Dependencies

- Header actions; comments; composer.
