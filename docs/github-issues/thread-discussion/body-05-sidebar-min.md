## Goal

**MIN mode** right sidebar: author context + discovery.

## Spec

- US-CORE-004 — Right Sidebar (Thread Context)

## Sections

1. **About the author** — avatar, name, handle, reputation, Follow button (UI only).
2. **Related threads** — 3–4 compact cards (title, author, engagement); link to `/discussions/...`.
3. **Trending in [category]** — 3 compact cards, same compact variant.

## Design

- `Card` / borders using existing forum tokens; compact list items consistent with feed cards (no hero images).

## Acceptance criteria

- [ ] Data from mock adapter for the active thread’s category.
- [ ] Follow button toggles visual state only (no persistence).
- [ ] On viewports where sidebar moves below comments (Part 5), layout still reads clearly.

## Dependencies

- Shell layout; routing; MIN/MAX state for hiding when MAX rail replaces/augments (coordinate with issue 6).
