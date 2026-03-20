"use client";

import type { ComponentType } from "react";
import { ArrowUp, Bookmark, Briefcase, ChevronsUp, GitCompare, HelpCircle, LayoutList, MessageCircle, Newspaper, Rocket, Sparkles, Star, Swords } from "lucide-react";

import { Component as AvatarWithName } from "@/components/ui/avatar-with-name";
import { formatCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category, CategoryKey, User } from "@/types";
import { UserAvatar } from "@/components/ui/user-avatar";

interface PostInteractionRowProps {
  upvotes: number;
  commentsCount: number;
  isFavorited: boolean;
  isUpvoted: boolean;
  category: Category | null;
  commenterUsers: User[];
  onToggleFavorite: () => void;
  onToggleUpvote: () => void;
}

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

export function PostInteractionRow({
  upvotes,
  commentsCount,
  isFavorited,
  isUpvoted,
  category,
  commenterUsers,
  onToggleFavorite,
  onToggleUpvote,
}: PostInteractionRowProps) {
  const UpvoteIcon = isUpvoted ? ChevronsUp : ArrowUp;
  const CategoryIcon = category ? categoryIconMap[category.key] : Sparkles;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-overlay)]/20 px-3 py-2">
      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
        <button
          type="button"
          onClick={onToggleUpvote}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition-transform duration-200 hover:-translate-y-0.5 ${
            isUpvoted ? "text-[var(--brand-primary)]" : ""
          }`}
          aria-label={isUpvoted ? "Remove upvote" : "Upvote post"}
        >
          <UpvoteIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${isUpvoted ? "scale-110" : ""}`} />
          {formatCompactNumber(upvotes)}
        </button>

        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 transition-transform duration-200 hover:-translate-y-0.5">
          <MessageCircle className="h-3.5 w-3.5" />
          {formatCompactNumber(commentsCount)}
        </span>

        <button
          type="button"
          onClick={onToggleFavorite}
          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 transition-transform duration-200 hover:-translate-y-0.5 ${
            isFavorited ? "text-[var(--brand-primary)]" : ""
          }`}
          aria-label={isFavorited ? "Unsave post" : "Save post"}
        >
          <Bookmark className={`h-3.5 w-3.5 transition-transform duration-150 ${isFavorited ? "fill-current scale-105" : ""}`} />
          {isFavorited ? "Saved" : "Save"}
        </button>
      </div>

      <div className="flex items-center gap-1">
        <AvatarWithName
          name={category?.name ?? "General"}
          direction="top"
          size="sm"
          icon={<CategoryIcon className="h-5 w-5" style={{ color: "var(--text-primary)", stroke: "var(--text-primary)" }} />}
          className="relative z-10"
          motionClassName="[&>span]:h-9 [&>span]:w-9"
          avatarClassName={cn(
            "h-9 w-9 border border-[var(--border-default)] bg-[var(--bg-surface)]",
            "shadow-[inset_0_1px_1px_rgba(255,255,255,0.16),inset_0_-1px_1px_rgba(0,0,0,0.14)]",
          )}
          nameClassName="bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)]"
          labelStyle={{ left: "50%", translate: "-50% 0" }}
        />

        <div className="flex -space-x-1.5">
          {commenterUsers.slice(0, 3).map((user) => (
            <UserAvatar
              key={user.id}
              user={user}
              size="sm"
              className="ring-2 ring-[var(--bg-surface)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
