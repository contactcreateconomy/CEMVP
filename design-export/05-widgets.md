# Right-sidebar widgets: Podium + What's Vibing

## apps/forum/src/components/layout/podium-widget.tsx

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightCircle, Crown, Medal } from "lucide-react";
import { useMemo, useState } from "react";

import { formatPoints } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

type PodiumWindow = "24h" | "7d" | "1m";

interface PodiumRow {
  rank: number;
  userId: string;
  points: number;
  weeklyDelta: number;
  user: User | null;
}

interface PodiumWidgetProps {
  rows: PodiumRow[];
}

const filters: Array<{ key: PodiumWindow; label: string }> = [
  { key: "24h", label: "24H" },
  { key: "7d", label: "7D" },
  { key: "1m", label: "1M" },
];

const rankColors = {
  1: { ring: "#facc15", icon: "#facc15" },
  2: { ring: "#cbd5e1", icon: "#cbd5e1" },
  3: { ring: "#d97706", icon: "#d97706" },
  4: { ring: "#14b8a6", icon: "#14b8a6" },
  5: { ring: "#6366f1", icon: "#6366f1" },
} as const;

function pointsByWindow(row: PodiumRow, window: PodiumWindow) {
  if (window === "24h") {
    return Math.max(1200, Math.round(row.points * 0.23 + row.weeklyDelta * 2.2));
  }
  if (window === "1m") {
    return Math.round(row.points * 1.35 + row.weeklyDelta * 7.5);
  }
  return row.points;
}

export function PodiumWidget({ rows }: PodiumWidgetProps) {
  const [activeWindow, setActiveWindow] = useState<PodiumWindow>("1m");

  const topRows = useMemo(() => {
    return rows
      .map((row) => ({ ...row, windowPoints: pointsByWindow(row, activeWindow) }))
      .sort((a, b) => b.windowPoints - a.windowPoints)
      .slice(0, 5)
      .map((row, index) => ({ ...row, displayRank: index + 1 }));
  }, [activeWindow, rows]);

  const activeFilterIndex = filters.findIndex((filter) => filter.key === activeWindow);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Podium</h2>

        <div className="relative w-[160px] rounded-full border border-(--border-default) bg-(--bg-overlay)/50 p-1">
          <div
            className="pointer-events-none absolute bottom-1 left-1 top-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-(--brand-primary) transition-transform duration-300 ease-out shadow-[0_8px_20px_rgba(14,165,233,0.24)]"
            style={{ transform: `translateX(${activeFilterIndex * 100}%)` }}
          />

          <div className="relative z-10 grid grid-cols-3">
            {filters.map((filter) => {
              const isActive = activeWindow === filter.key;
              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveWindow(filter.key)}
                  className={cn(
                    "h-6 rounded-full px-2 text-[10px] font-semibold transition-colors duration-200",
                    isActive ? "text-black" : "text-(--text-secondary) hover:text-(--text-primary)",
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {topRows.map((row) => {
          const colors = rankColors[row.displayRank as keyof typeof rankColors];
          const showShimmer = row.displayRank <= 3;
          const Icon = row.displayRank <= 3 ? Crown : Medal;

          return (
            <div
              key={row.userId}
              className={`group relative flex items-center justify-between overflow-hidden rounded-[12px] border border-(--border-subtle) bg-(--bg-overlay)/45 px-3 py-2.5 ${
                showShimmer ? "hover:border-(--border-prominent)" : ""
              }`}
            >
              {showShimmer ? (
                <span className="pointer-events-none absolute inset-y-0 left-[-35%] w-[35%] -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
              ) : null}

              <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2.5 pr-2">
                <Icon className="h-4 w-4 shrink-0" style={{ color: colors.icon }} />

                <span
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--bg-surface)"
                  style={{ boxShadow: `0 0 0 2px ${colors.ring}` }}
                >
                  {row.user?.avatar ? (
                    <Image
                      src={row.user.avatar}
                      alt={row.user.name}
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-(--text-primary)">
                      {(row.user?.name ?? "U")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}
                </span>

                <p className="min-w-0 truncate text-sm font-medium text-(--text-primary)">
                  {row.user?.name ?? "Unknown user"}
                </p>
              </div>

              <p className="relative z-10 shrink-0 text-xs font-semibold text-(--feedback-warning)">
                {formatPoints(row.windowPoints)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex w-full justify-center">
        <Link
          href="/leaderboard"
          aria-label="Open full leaderboard"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-(--brand-primary) transition-all duration-200 hover:bg-(--bg-overlay)/55 hover:text-(--brand-primary-hover) hover:shadow-[0_0_12px_rgba(14,165,233,0.3)]"
        >
          <ArrowRightCircle className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
```

---

## apps/forum/src/components/layout/whats-vibing-widget.tsx

```tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, TrendingUp } from "lucide-react";

import { useQuery } from "convex/react";

import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SLIDE_INTERVAL_MS = 4000;

function WhatsVibingWidgetInner() {
  const fetched = useQuery(api.forum.queries.listVibingItems, { limit: 10 });
  const items = useMemo(() => fetched ?? [], [fetched]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, items.length]);

  if (fetched === undefined) {
    return (
      <Card className="animate-soft-float h-[250px] bg-(--bg-surface) border border-(--border-default) rounded-xl p-4" style={{ animationDelay: "160ms" }}>
        <CardHeader className="p-0 pb-3">
          <div className="h-4 w-32 animate-pulse rounded bg-(--bg-overlay)" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[140px] w-full animate-pulse rounded-[24px] bg-(--bg-overlay)/50" />
        </CardContent>
      </Card>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card
      className="animate-soft-float h-[250px] bg-(--bg-surface) border border-(--border-default) rounded-xl p-4"
      style={{ animationDelay: "160ms" }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <CardHeader className="p-0 pb-3">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
          <TrendingUp className="h-4 w-4 text-(--brand-primary)" /> What&apos;s Vibing
        </h2>
      </CardHeader>

      <CardContent className="flex h-[186px] flex-col justify-between p-0">
        <div className="relative h-full min-h-[140px] overflow-hidden rounded-[24px]">
          {items.map((item, index) => {
            const category = item.kind.charAt(0).toUpperCase() + item.kind.slice(1);

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={`Open trending post ${item.label}`}
                className={cn(
                  "group absolute inset-0 flex h-full cursor-pointer flex-col justify-between rounded-[24px] border border-(--border-prominent) bg-(--bg-overlay)/24 p-4 transition-all duration-500",
                  "hover:border-(--border-active)/45",
                  index === activeIndex
                    ? "z-10 translate-y-0 scale-100 opacity-100"
                    : index < activeIndex
                      ? "pointer-events-none -translate-y-4 scale-95 opacity-0"
                      : "pointer-events-none translate-y-4 scale-95 opacity-0",
                )}
              >
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-(--brand-primary)">Trending in {category}</span>
                  <h4 className="line-clamp-4 text-sm font-semibold leading-5 text-(--text-primary)">
                    New post → {item.label}
                  </h4>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--text-muted)">
                    <span>{item.engagedUsers.toLocaleString()} ENGAGED</span>
                    <span className="inline-flex items-center justify-center text-(--text-secondary) transition-colors duration-200 group-hover:text-(--brand-primary)">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:animate-[pulse_1200ms_ease-in-out_infinite] group-hover:drop-shadow-[0_0_8px_rgba(14,165,233,0.55)]" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/** Only mounted from `RightSidebarWithConvex` today; guard keeps `useQuery` off the tree when Convex URL is missing. */
export function WhatsVibingWidget() {
  if (!isConvexConfigured()) {
    return null;
  }
  return <WhatsVibingWidgetInner />;
}
```
