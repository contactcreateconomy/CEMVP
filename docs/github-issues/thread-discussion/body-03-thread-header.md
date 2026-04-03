## Goal

Build the **thread header** for all categories: trust, actions, and metadata in one compact block.

## Spec

- US-CORE-002 — Thread Header

## UI checklist

- [ ] Category badge (icon + color from `categories` mock).
- [ ] Title (prominent).
- [ ] Author: avatar, display name, @handle, reputation badge.
- [ ] Posted time + view count.
- [ ] Topic tags as clickable chips (mock handlers OK).
- [ ] **AI Summary**: distinct surface (border + subtle bg + bot icon + label); **collapsed default on mobile**, **expanded default on desktop**.
- [ ] Action bar: upvote + count, comment count (scroll to comments), bookmark + count, share (clipboard + brief toast), overflow (Report, Copy link).
- [ ] Use shadcn-style components under `@/components/ui/*` where they exist (`Button`, `Badge`, `DropdownMenu`, `Tooltip`, etc.).

## Acceptance criteria

- [ ] Header renders from mock thread data adapter.
- [ ] Share copies current thread URL and shows user-visible confirmation (toast or inline).
- [ ] Comment count control scrolls to comment section (`id` anchor or `scrollIntoView`).

## Note

MIN/MAX toggle is a separate issue; leave a clear slot in the header layout (e.g. top-right).
