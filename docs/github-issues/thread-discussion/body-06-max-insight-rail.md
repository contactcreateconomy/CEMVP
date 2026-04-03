## Goal

**MAX mode** intelligence panel in the right column (desktop sticky; mobile collapsible bottom sheet per Part 5).

## Spec

- US-CORE-007 — MAX Mode: Insight Rail

## Content (static mock)

- Short AI summary of key points.
- **Key agreements** — 2–3 bullets.
- **Open questions** — 2–3 items linking to comment anchors (stubs OK).
- **Top contributor** — one author card + excerpt of their top comment in-thread.

## Acceptance criteria

- [ ] Visible **only in MAX**; standard MIN sidebar from issue 5 is replaced or augmented per product choice (document in PR).
- [ ] Sticky on desktop scroll within thread column layout.
- [ ] Mobile: collapsible bottom sheet (shadcn `Sheet` or equivalent), not a broken narrow rail.

## Dependencies

- MIN/MAX toggle; shell layout; comments exist for anchor stubs.
