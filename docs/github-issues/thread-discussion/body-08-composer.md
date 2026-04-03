## Goal

**Comment composer** (top-level + inline reply) with lightweight markdown toolbar and **category-specific AI nudge**.

## Spec

- US-CORE-006 — Comment Composer

## UI

- Avatar left of input.
- Auto-growing textarea (`Textarea` or textarea + min-height).
- Toolbar: Bold, Italic, Inline code, Code block, Link (formatting can insert markers; no backend).
- Submit disabled when empty / whitespace only.
- **Nudge**: after **≥20 characters**, show dismissible tip card (✕). Message depends on **thread category** (static strings from spec).

## Acceptance criteria

- [ ] Top composer above comment list; inline composer under reply target.
- [ ] Nudge text matches doc examples per category (central map in code).
- [ ] Dismiss state per session or per compose session (either is fine; document).

## Dependencies

- Comments section structure (anchors / reply parent id).
