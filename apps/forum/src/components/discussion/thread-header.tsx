"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type { ComponentType } from "react";
import {
  ArrowUp,
  Bookmark,
  Bot,
  Briefcase,
  ChevronDown,
  ChevronsUp,
  GitCompare,
  HelpCircle,
  LayoutList,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Rocket,
  Share2,
  Sparkles,
  Star,
  Swords,
} from "lucide-react";
import { useEffect, useState } from "react";

import Link from "next/link";

import { ReportPostDialog } from "@/components/feed/report-post-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatCompactNumber } from "@/lib/format";
import { reputationLabel } from "@/lib/discussion/reputation";
import { cn } from "@/lib/utils";
import type { Category, CategoryKey } from "@/types";
import type { DiscussionThread } from "@/types/discussion";
import type { User } from "@/types";

const categoryIconMap: Record<CategoryKey, ComponentType<{ className?: string }>> = {
  news: Newspaper,
  review: Star,
  compare: GitCompare,
  "launch-pad": Rocket,
  debate: Swords,
  help: HelpCircle,
  list: LayoutList,
  showcase: Sparkles,
  gigs: Briefcase,
};

interface ThreadHeaderProps {
  thread: DiscussionThread;
  author: User | null;
  /** When set (e.g. feed overlay), shown instead of `thread.comments.length` on the comment action. */
  commentCount?: number;
  category: Category | null;
  isMax: boolean;
  onSetMax: (value: boolean) => void;
  upvotes: number;
  isUpvoted: boolean;
  onToggleUpvote: () => void;
  bookmarks: number;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onScrollToComments: () => void;
  onToast: (msg: string) => void;
  ensureAuthenticated: () => boolean;
}

export function ThreadHeader({
  thread,
  author,
  commentCount,
  category,
  isMax,
  onSetMax,
  upvotes,
  isUpvoted,
  onToggleBookmark,
  isBookmarked,
  bookmarks,
  onToggleUpvote,
  onScrollToComments,
  onToast,
  ensureAuthenticated,
}: ThreadHeaderProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setAiOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const CategoryIcon = category ? (categoryIconMap[category.key] ?? Sparkles) : Sparkles;
  const chipStyle = category ? { borderColor: `${category.primaryColor}55`, color: category.primaryColor } : undefined;

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    await navigator.clipboard.writeText(url);
    onToast("Link copied");
  };

  return (
    <>
    <Card className="overflow-hidden border-(--border-default) bg-(--bg-surface)">
      <CardContent className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {category ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border bg-(--bg-inset) px-2.5 py-1 text-xs font-semibold"
                style={chipStyle}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
                {category.name}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-(--text-muted)">View</span>
            <div className="inline-flex rounded-full border border-(--border-default) bg-(--bg-inset) p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => onSetMax(false)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-all duration-200",
                  !isMax ? "bg-(--bg-surface) text-(--text-primary) shadow-sm" : "text-(--text-muted)",
                )}
              >
                MIN
              </button>
              <button
                type="button"
                onClick={() => onSetMax(true)}
                className={cn(
                  "rounded-full px-3 py-1.5 transition-all duration-200",
                  isMax ? "bg-(--bg-surface) text-(--text-primary) shadow-sm" : "text-(--text-muted)",
                )}
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        <h1 className="text-balance text-2xl font-semibold tracking-tight text-(--text-primary) sm:text-3xl">{thread.title}</h1>

        <div className="flex flex-wrap items-center gap-3">
          {author ? (
            <Link
              href={`/users/${encodeURIComponent(author.handle)}`}
              className="flex min-w-0 items-center gap-3 rounded-lg outline-offset-2 transition-colors hover:bg-(--bg-overlay)/50 focus-visible:ring-2 focus-visible:ring-(--border-active)"
            >
              <UserAvatar user={author} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-(--text-primary)">{author.name}</p>
                <p className="text-xs text-(--text-muted)">
                  @{author.handle} · {reputationLabel(author.points)}
                </p>
              </div>
            </Link>
          ) : (
            <>
              <UserAvatar user={author} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-(--text-primary)">Unknown</p>
                <p className="text-xs text-(--text-muted)">@unknown · Member</p>
              </div>
            </>
          )}
          <span className="text-xs text-(--text-muted) sm:ml-auto">
            {new Date(thread.createdAt).toLocaleString()} · {formatCompactNumber(thread.views)} views
          </span>
        </div>

        {thread.updatedAt ? (
          <p className="text-xs text-(--text-secondary)">Updated {new Date(thread.updatedAt).toLocaleString()}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(thread.tags ?? []).map((tag) => (
            <button
              key={tag}
              type="button"
              className="rounded-full border border-(--border-default) bg-(--bg-inset) px-3 py-1 text-xs font-medium text-(--text-secondary) transition-colors hover:border-(--border-active)"
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="rounded-[12px] border border-(--border-default) bg-(--bg-inset)/80 p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 text-left md:pointer-events-none md:cursor-default"
            onClick={() => setAiOpen((o) => !o)}
            aria-expanded={aiOpen}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-(--text-primary)">
              <Bot className="h-4 w-4 text-(--brand-primary)" />
              AI Summary
            </span>
            <ChevronDown className={cn("h-4 w-4 text-(--text-muted) transition-transform md:hidden", aiOpen && "rotate-180")} />
          </button>
          <div className={cn("mt-2 text-sm leading-relaxed text-(--text-secondary)", !aiOpen && "hidden md:block")}>
            {thread.aiSummary}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-(--border-subtle) pt-4">
          <button
            type="button"
            onClick={() => {
              if (!ensureAuthenticated()) return;
              onToggleUpvote();
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-(--border-default) px-3 py-1.5 text-sm font-medium transition-colors hover:bg-(--bg-overlay)",
              isUpvoted && "border-(--brand-primary)/40 text-(--brand-primary)",
            )}
          >
            {isUpvoted ? <ChevronsUp className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
            {formatCompactNumber(upvotes)}
          </button>
          <button
            type="button"
            onClick={onScrollToComments}
            className="inline-flex items-center gap-1.5 rounded-full border border-(--border-default) px-3 py-1.5 text-sm font-medium text-(--text-secondary) transition-colors hover:bg-(--bg-overlay)"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount ?? thread.comments?.length ?? 0}
          </button>
          <button
            type="button"
            onClick={() => {
              if (!ensureAuthenticated()) return;
              onToggleBookmark();
            }}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-(--border-default) px-3 py-1.5 text-sm font-medium transition-colors hover:bg-(--bg-overlay)",
              isBookmarked && "border-(--brand-primary)/40 text-(--brand-primary)",
            )}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            {formatCompactNumber(bookmarks)}
          </button>
          <Button type="button" variant="secondary" size="sm" className="gap-1.5" onClick={share}>
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--border-default) text-(--text-secondary) hover:bg-(--bg-overlay)"
                aria-label="More actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[160px] rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-1 shadow-(--shadow-lg)"
              >
                <DropdownMenu.Item
                  className="cursor-pointer rounded-[8px] px-2 py-2 text-sm text-(--feedback-error) outline-hidden data-highlighted:bg-(--bg-overlay)"
                  onSelect={() => setReportOpen(true)}
                >
                  Report
                </DropdownMenu.Item>
                <DropdownMenu.Item className="cursor-pointer rounded-[8px] px-2 py-2 text-sm outline-hidden data-highlighted:bg-(--bg-overlay)" onSelect={share}>
                  Copy link
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </CardContent>
    </Card>
    <ReportPostDialog
      open={reportOpen}
      onOpenChange={setReportOpen}
      title="Report thread"
      description="Select a reason. Our moderators will review this thread."
      onSubmit={() => {
        setReportOpen(false);
        onToast("Report submitted");
      }}
    />
    </>
  );
}
