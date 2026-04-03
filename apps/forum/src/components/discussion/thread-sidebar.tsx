"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatCompactNumber } from "@/lib/format";
import { reputationLabel } from "@/lib/discussion/reputation";
import type { DiscussionThread } from "@/types/discussion";
import type { User } from "@/types";

import { InsightRailExtras } from "./insight-rail-extras";

export interface ThreadSidebarPreview {
  slug: string;
  title: string;
  authorId: string;
  engagement: number;
}

interface ThreadSidebarProps {
  thread: DiscussionThread;
  author: User | null;
  isMax: boolean;
  related: ThreadSidebarPreview[];
  trending: ThreadSidebarPreview[];
  usersById: Map<string, User>;
  categoryName: string;
}

export function ThreadSidebar({
  thread,
  author,
  isMax,
  related,
  trending,
  usersById,
  categoryName,
}: ThreadSidebarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wide, setWide] = useState(() => (typeof window !== "undefined" ? window.matchMedia("(min-width: 1280px)").matches : true));

  useEffect(() => {
    const q = () => setWide(window.matchMedia("(min-width: 1280px)").matches);
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);

  const rail = thread.insightRail;
  const topContributorId = rail?.topContributor?.userId ?? "";
  const topUser = topContributorId ? usersById.get(topContributorId) : undefined;
  const summary = rail?.summary ?? "";
  const keyAgreements = Array.isArray(rail?.keyAgreements) ? rail.keyAgreements : [];
  const openQuestions = Array.isArray(rail?.openQuestions) ? rail.openQuestions : [];
  const topExcerpt = rail?.topContributor?.excerpt ?? "";

  const insightInner = (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-(--text-muted)">Key points</p>
        <p className="mt-2 text-sm text-(--text-secondary)">{summary}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-(--text-muted)">Key agreements</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-(--text-secondary)">
          {keyAgreements.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-(--text-muted)">Open questions</p>
        <ul className="mt-2 space-y-2 text-sm">
          {openQuestions.map((q) => (
            <li key={q.anchorId}>
              <a href={`#comment-${q.anchorId}`} className="text-(--brand-primary) hover:underline">
                {q.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[12px] border border-(--border-default) bg-(--bg-inset) p-3">
        <p className="text-xs font-semibold uppercase text-(--text-muted)">Top contributor</p>
        <div className="mt-2 flex items-center gap-2">
          <UserAvatar user={topUser ?? null} size="sm" />
          <span className="text-sm font-medium text-(--text-primary)">{topUser?.name ?? "Member"}</span>
        </div>
        <p className="mt-2 text-xs text-(--text-secondary)">{topExcerpt}</p>
      </div>
      <InsightRailExtras thread={thread} />
    </div>
  );

  const minInner = (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase text-(--text-muted)">About the author</p>
          {author ? (
            <Link
              href={`/users/${encodeURIComponent(author.handle)}`}
              className="flex items-center gap-3 rounded-lg outline-offset-2 transition-colors hover:bg-(--bg-overlay)/50 focus-visible:ring-2 focus-visible:ring-(--border-active)"
            >
              <UserAvatar user={author} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-(--text-primary)">{author.name}</p>
                <p className="text-xs text-(--text-muted)">@{author.handle}</p>
                <p className="text-xs text-(--text-muted)">{reputationLabel(author.points)}</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <UserAvatar user={author} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-(--text-primary)">Unknown</p>
              </div>
            </div>
          )}
          <Button type="button" variant="secondary" size="sm" className="w-full">
            Follow
          </Button>
        </CardContent>
      </Card>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-(--text-muted)">Related threads</p>
        <div className="space-y-2">
          {related.map((r) => {
            const u = usersById.get(r.authorId);
            return (
              <Link
                key={r.slug}
                href={`/discussions/${r.slug}`}
                className="block rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-3 transition-colors hover:border-(--border-active)"
              >
                <p className="text-sm font-medium text-(--text-primary) line-clamp-2">{r.title}</p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {u?.name ?? "Member"} · {formatCompactNumber(r.engagement)} engagements
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-(--text-muted)">Trending in {categoryName}</p>
        <div className="space-y-2">
          {trending.map((r) => {
            const u = usersById.get(r.authorId);
            return (
              <Link
                key={r.slug}
                href={`/discussions/${r.slug}`}
                className="block rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-3 transition-colors hover:border-(--border-active)"
              >
                <p className="text-sm font-medium text-(--text-primary) line-clamp-2">{r.title}</p>
                <p className="mt-1 text-xs text-(--text-muted)">
                  {u?.name ?? "Member"} · {formatCompactNumber(r.engagement)}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-20 xl:w-[300px]">
        <div className="hidden xl:block">{isMax ? insightInner : minInner}</div>
      </aside>

      {isMax && !wide ? (
        <>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="fixed bottom-28 right-4 z-40 flex items-center gap-2 rounded-full border border-(--border-prominent) bg-(--bg-surface-elevated) px-4 py-2 text-sm font-medium text-(--text-primary) shadow-(--shadow-lg) xl:hidden"
          >
            <Sparkles className="h-4 w-4 text-(--brand-primary)" />
            Insights
          </button>
          <Dialog.Root open={sheetOpen} onOpenChange={setSheetOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 xl:hidden" />
              <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-[20px] border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-lg) xl:hidden">
                <Dialog.Title className="text-base font-semibold text-(--text-primary)">Thread insights</Dialog.Title>
                <div className="mt-4">{insightInner}</div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </>
      ) : null}

      {!isMax && !wide ? <div className="space-y-4 xl:hidden">{minInner}</div> : null}
    </>
  );
}
