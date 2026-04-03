## Goal

**MAX-only** comment contribution filters above the comment list.

## Spec

- US-CORE-008 — MAX Mode: Advanced Comment Filtering

## UI

- Multi-select chips: Evidence, Counterpoint, Question, Resource, Solution (include Solution for Help threads or hide when N/A—document choice).
- Show active filter count; **Clear all**.
- Comment list filters client-side from mock `contributionType` (or similar) on comments.

## Acceptance criteria

- [ ] Hidden entirely in MIN.
- [ ] Filtering updates list without remount flash.
- [ ] Clear all resets to full list.

## Dependencies

- Comments list; MIN/MAX state; mock data extended with filter tags.
