## Goal

Implement **MIN / MAX mode** as global UI state for the thread page.

## Spec

- US-CORE-003 — MIN / MAX Mode Toggle

## Rules

- MIN is default on load.
- MAX reveals extra panels/features **without** navigation, reload, or scroll jump.
- MAX-only UI is **fully hidden** in MIN (no empty placeholders).
- Transition: smooth (CSS transition on opacity/transform), no pop-in flash.

## Acceptance criteria

- [ ] Toggle is visible in header, clearly shows active mode.
- [ ] Toggling preserves scroll position.
- [ ] React state (or URL query—prefer state unless product asks otherwise) is documented for child components (`isMaxMode`).

## Dependencies

- Thread header layout issue (toggle placement).
