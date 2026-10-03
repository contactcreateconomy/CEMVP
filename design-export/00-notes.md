# Export notes

## Skipped — logic-only, no meaningful visual markup

- **`FeedClient`** (`apps/forum/src/components/feed/feed-client.tsx`) — state/mutation orchestration (favorite/upvote toggles, hide/undo, share, report submit). It renders `PostCard` in a loop plus `EmptyState`/`ReportPostDialog`/`FeedUndoToast`, but contributes no styling of its own beyond a `space-y-4` wrapper div. Skipped per scope.
- **`apps/forum/src/lib/utils.ts`** (`cn()` — clsx + tailwind-merge helper) — pure utility, no markup.
- **`apps/forum/src/components/ui/use-scroll.ts`** — scroll-position hook, no markup.
- **`apps/forum/src/lib/format.ts`** — number/date formatting helpers, no markup.

## Included despite not being explicitly named — has real visual styling

- **`TrendSorter`** (`apps/forum/src/components/feed/trend-sorter.tsx`) — the Top/Hot/New/Fav pill switcher rendered directly above the feed. It's not "FeedClient" but it's adjacent and was flagged in the original instructions as "skip only if logic-only" — this one has a sliding-indicator pill design worth keeping. Full source below since it didn't fit neatly into one of the 6 requested files.

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Flame, Bookmark, TrendingUp, Clock3 } from "lucide-react";

const sortItems = [
  { key: "top", label: "Top", Icon: TrendingUp },
  { key: "hot", label: "Hot", Icon: Flame },
  { key: "new", label: "New", Icon: Clock3 },
  { key: "fav", label: "Fav", Icon: Bookmark },
] as const;

export function TrendSorter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawSort = searchParams.get("sort");
  const selectedSort = rawSort && sortItems.some((item) => item.key === rawSort) ? rawSort : "top";
  const activeIndex = sortItems.findIndex((item) => item.key === selectedSort);

  return (
    <div className="relative mx-auto w-full max-w-[864px] rounded-full border border-(--border-default) bg-(--bg-surface)/70 p-1 backdrop-blur-md">
      <div
        className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc(25%-0.25rem)] rounded-full bg-brand-primary shadow-[0_8px_24px_rgba(14,165,233,0.28)] transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      <div className="relative z-10 grid grid-cols-4">
        {sortItems.map(({ key, label, Icon }) => {
          const isActive = selectedSort === key;
          const next = new URLSearchParams(searchParams.toString());
          next.set("sort", key);

          return (
            <Link
              key={key}
              href={`${pathname}?${next.toString()}`}
              className="flex h-9 items-center justify-center gap-1.5 rounded-full text-base font-semibold transition-colors duration-200"
              style={{ color: isActive ? "black" : "var(--text-primary)" }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

## Other files in scope

See `01-tokens.md` through `06-primitives.md` for the requested six files.
