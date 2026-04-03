"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowBigDown, ArrowBigUp, MessageSquareReply, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { UserAvatar } from "@/components/ui/user-avatar";
import { formatRelativeDate } from "@/lib/format";
import { reputationLabel } from "@/lib/discussion/reputation";
import { cn } from "@/lib/utils";
import type { ContributionTag, DiscussionThread, ThreadComment } from "@/types/discussion";
import type { User } from "@/types";

import { ThreadComposer } from "./thread-composer";
import { useThreadDiscussion } from "./thread-discussion-context";

const FILTER_OPTIONS: ContributionTag[] = ["evidence", "counterpoint", "question", "resource", "solution"];

function buildChildrenMap(comments: ThreadComment[]) {
  const map = new Map<string | null, ThreadComment[]>();
  for (const c of comments) {
    const p = c.parentId;
    const list = map.get(p) ?? [];
    list.push(c);
    map.set(p, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  return map;
}

function subtreeHasMatch(
  c: ThreadComment,
  childrenMap: Map<string | null, ThreadComment[]>,
  active: Set<ContributionTag>,
): boolean {
  if (active.size === 0) return true;
  const self = c.tags?.some((t) => active.has(t));
  if (self) return true;
  const kids = childrenMap.get(c.id) ?? [];
  return kids.some((ch) => subtreeHasMatch(ch, childrenMap, active));
}

interface ThreadCommentsProps {
  thread: DiscussionThread;
  authorId: string;
  usersById: Map<string, User>;
  isMax: boolean;
  activeFilters: Set<ContributionTag>;
  onToggleFilter: (tag: ContributionTag) => void;
  onClearFilters: () => void;
  ensureAuthenticated: () => boolean;
  sort: "best" | "new" | "top";
  onSortChange: (s: "best" | "new" | "top") => void;
  /** Gigs MAX: partition comments */
  gigsCommentMode?: "all" | "questions" | "responses";
  onGigsCommentModeChange?: (m: "all" | "questions" | "responses") => void;
  /** Showcase MAX */
  showcaseGroupByTheme?: boolean;
  onShowcaseGroupToggle?: (v: boolean) => void;
}

export function ThreadComments({
  thread,
  authorId,
  usersById,
  isMax,
  activeFilters,
  onToggleFilter,
  onClearFilters,
  ensureAuthenticated,
  sort,
  onSortChange,
  gigsCommentMode = "all",
  onGigsCommentModeChange,
  showcaseGroupByTheme = false,
  onShowcaseGroupToggle,
}: ThreadCommentsProps) {
  const [votes, setVotes] = useState<Record<string, { up?: boolean; down?: boolean }>>({});
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const commentList = thread.comments ?? [];

  const filterChipOptions = useMemo(() => {
    if (thread.category === "help") return FILTER_OPTIONS;
    return FILTER_OPTIONS.filter((t) => t !== "solution");
  }, [thread.category]);

  const sortedComments = useMemo(() => {
    const list = [...commentList];
    if (sort === "new") {
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    if (sort === "top") {
      return list.sort((a, b) => b.upvotes - a.upvotes);
    }
    return list.sort((a, b) => b.upvotes + b.downvotes - (a.upvotes + a.downvotes));
  }, [commentList, sort]);

  const childrenMap = useMemo(() => buildChildrenMap(sortedComments), [sortedComments]);

  const filteredForGigs = useMemo(() => {
    if (thread.category !== "gigs" || !isMax || gigsCommentMode === "all") return sortedComments;
    return sortedComments.filter((c) =>
      gigsCommentMode === "questions" ? c.gigsPartition === "question" : c.gigsPartition === "application",
    );
  }, [sortedComments, thread.category, isMax, gigsCommentMode]);

  const childrenMapGigs = useMemo(() => buildChildrenMap(filteredForGigs), [filteredForGigs]);

  const mapToUse = thread.category === "gigs" && isMax && gigsCommentMode !== "all" ? childrenMapGigs : childrenMap;

  const solutionId =
    thread.category === "help" &&
    thread.categoryBody &&
    "solved" in thread.categoryBody &&
    thread.categoryBody.solved
      ? thread.categoryBody.solutionCommentId
      : undefined;

  const roots = useMemo(() => {
    const listRoots = mapToUse.get(null) ?? [];
    return listRoots.filter((c) => subtreeHasMatch(c, mapToUse, activeFilters));
  }, [mapToUse, activeFilters]);

  const toggleVote = (id: string, dir: "up" | "down") => {
    if (!ensureAuthenticated()) return;
    setVotes((prev) => {
      const cur = prev[id] ?? {};
      if (dir === "up") {
        return { ...prev, [id]: { up: !cur.up, down: false } };
      }
      return { ...prev, [id]: { up: false, down: !cur.down } };
    });
  };

  const maxDepth = isMax ? 5 : 3;

  const renderShowcaseGrouped = () => {
    const themes = ["ux", "visual", "technical", "other"] as const;
    return (
      <div className="space-y-6">
        {themes.map((th) => {
          const inTheme = sortedComments.filter((c) => c.showcaseThemes?.includes(th));
          if (inTheme.length === 0) return null;
          return (
            <div key={th}>
              <p className="mb-2 text-xs font-semibold uppercase text-(--text-muted)">{th}</p>
              <div className="space-y-2 border-l border-(--border-default) pl-3">
                {inTheme.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    authorId={authorId}
                    usersById={usersById}
                    votes={votes}
                    onVote={toggleVote}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    thread={thread}
                    ensureAuthenticated={ensureAuthenticated}
                    solutionId={solutionId}
                    isMax={isMax}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="space-y-4" aria-label="Comments">
      {solutionId ? (
        <div className="rounded-[12px] border border-(--feedback-success)/40 bg-(--feedback-success)/10 px-4 py-3 text-sm text-(--feedback-success)">
          This thread has an accepted solution.{" "}
          <a href={`#comment-${solutionId}`} className="font-semibold underline">
            Jump to solution →
          </a>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-(--text-primary)">{commentList.length} comments</p>
        <div className="flex flex-wrap gap-1 rounded-full border border-(--border-default) bg-(--bg-inset) p-0.5">
          {(["best", "new", "top"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSortChange(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                sort === s ? "bg-(--bg-surface) text-(--text-primary) shadow-sm" : "text-(--text-muted)",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {thread.category === "gigs" && isMax && onGigsCommentModeChange ? (
        <div className="flex flex-wrap gap-2">
          {(["all", "questions", "responses"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onGigsCommentModeChange(m)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                gigsCommentMode === m ? "border-(--brand-primary) bg-(--brand-primary)/10" : "border-(--border-default)",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      ) : null}

      {thread.category === "showcase" && isMax && onShowcaseGroupToggle ? (
        <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
          <input type="checkbox" checked={showcaseGroupByTheme} onChange={(e) => onShowcaseGroupToggle(e.target.checked)} />
          Feedback by theme
        </label>
      ) : null}

      {isMax && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-(--text-muted)">Filter</span>
          {filterChipOptions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleFilter(tag)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                activeFilters.has(tag) ? "border-(--brand-primary) bg-(--brand-primary)/10" : "border-(--border-default) text-(--text-secondary)",
              )}
            >
              {tag}
            </button>
          ))}
          {activeFilters.size > 0 ? (
            <button type="button" className="text-[11px] text-(--brand-primary) underline" onClick={onClearFilters}>
              Clear all ({activeFilters.size})
            </button>
          ) : null}
        </div>
      )}

      {commentList.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-(--border-default) bg-(--bg-inset) px-4 py-8 text-center text-sm text-(--text-secondary)">
          Be the first to reply. Share your thoughts.
        </div>
      ) : thread.category === "showcase" && isMax && showcaseGroupByTheme ? (
        renderShowcaseGrouped()
      ) : (
        <div className="space-y-1">
          {roots.map((c) => (
            <CommentBranch
              key={c.id}
              comment={c}
              depth={0}
              maxDepth={maxDepth}
              isMax={isMax}
              authorId={authorId}
              usersById={usersById}
              votes={votes}
              onVote={toggleVote}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              thread={thread}
              ensureAuthenticated={ensureAuthenticated}
              solutionId={solutionId}
              childrenMap={mapToUse}
              activeFilters={activeFilters}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function CommentBranch({
  comment,
  depth,
  maxDepth,
  isMax,
  authorId,
  usersById,
  votes,
  onVote,
  replyTo,
  setReplyTo,
  thread,
  ensureAuthenticated,
  solutionId,
  childrenMap,
  activeFilters,
}: {
  comment: ThreadComment;
  depth: number;
  maxDepth: number;
  isMax: boolean;
  authorId: string;
  usersById: Map<string, User>;
  votes: Record<string, { up?: boolean; down?: boolean }>;
  onVote: (id: string, dir: "up" | "down") => void;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  thread: DiscussionThread;
  ensureAuthenticated: () => boolean;
  solutionId?: string;
  childrenMap: Map<string | null, ThreadComment[]>;
  activeFilters: Set<ContributionTag>;
}) {
  const [continued, setContinued] = useState(false);
  const replies = childrenMap.get(comment.id) ?? [];
  const filteredReplies = replies.filter((c) => subtreeHasMatch(c, childrenMap, activeFilters));
  const nextDepth = depth + 1;
  const blockReplies = nextDepth >= maxDepth && filteredReplies.length > 0 && !continued;

  return (
    <div className={cn(depth > 0 && "ml-3 border-l border-(--border-subtle) pl-3 sm:ml-4 sm:pl-4")}>
      <CommentCard
        comment={comment}
        authorId={authorId}
        usersById={usersById}
        votes={votes}
        onVote={onVote}
        replyTo={replyTo}
        setReplyTo={setReplyTo}
        thread={thread}
        ensureAuthenticated={ensureAuthenticated}
        solutionId={solutionId}
        isMax={isMax}
      />
      {blockReplies ? (
        <button
          type="button"
          className="mt-2 text-xs font-medium text-(--brand-primary) hover:underline"
          onClick={() => setContinued(true)}
        >
          Continue this thread →
        </button>
      ) : (
        filteredReplies.map((ch) => (
          <CommentBranch
            key={ch.id}
            comment={ch}
            depth={nextDepth}
            maxDepth={maxDepth}
            isMax={isMax}
            authorId={authorId}
            usersById={usersById}
            votes={votes}
            onVote={onVote}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            thread={thread}
            ensureAuthenticated={ensureAuthenticated}
            solutionId={solutionId}
            childrenMap={childrenMap}
            activeFilters={activeFilters}
          />
        ))
      )}
    </div>
  );
}

function CommentCard({
  comment,
  authorId,
  usersById,
  votes,
  onVote,
  replyTo,
  setReplyTo,
  thread,
  ensureAuthenticated,
  solutionId,
  isMax,
}: {
  comment: ThreadComment;
  authorId: string;
  usersById: Map<string, User>;
  votes: Record<string, { up?: boolean; down?: boolean }>;
  onVote: (id: string, dir: "up" | "down") => void;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  thread: DiscussionThread;
  ensureAuthenticated: () => boolean;
  solutionId?: string;
  isMax: boolean;
}) {
  const td = useThreadDiscussion();
  const user = usersById.get(comment.authorId) ?? null;
  const v = votes[comment.id] ?? {};
  const up = comment.upvotes + (v.up ? 1 : 0) - (v.down ? 0 : 0);
  const isOp = comment.authorId === authorId;
  const isSolution = solutionId === comment.id || comment.isSolution;

  return (
    <div
      id={`comment-${comment.id}`}
      className={cn(
        "rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-3",
        isSolution && "border-l-4 border-l-(--feedback-success) border-(--feedback-success)/30",
      )}
    >
      <div className="flex items-start gap-2">
        <UserAvatar user={user} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-(--text-primary)">{user?.name ?? "Unknown"}</span>
            <span className="text-(--text-muted)">@{user?.handle}</span>
            {user ? <span className="text-(--text-muted)">{reputationLabel(user.points)}</span> : null}
            {isOp ? <span className="rounded bg-(--brand-primary)/15 px-1.5 py-0.5 text-[10px] font-semibold text-(--brand-primary)">OP</span> : null}
            {isSolution ? (
              <span className="rounded bg-(--feedback-success)/15 px-1.5 py-0.5 text-[10px] font-semibold text-(--feedback-success)">Solution</span>
            ) : null}
            <span className="text-(--text-muted)">{formatRelativeDate(comment.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-(--text-secondary)">{comment.body}</p>
          {thread.category === "showcase" && isMax && comment.mediaPin ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-(--brand-primary) hover:underline"
              onClick={() => {
                td.setMediaHighlightCoords(comment.mediaPin!);
                document.getElementById("showcase-media")?.scrollIntoView({ behavior: "smooth", block: "center" });
                window.setTimeout(() => td.setMediaHighlightCoords(null), 2200);
              }}
            >
              See in media
            </button>
          ) : null}
          {thread.category === "debate" && isMax && comment.fallacyTags && comment.fallacyTags.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {comment.fallacyTags.map((f) => (
                <span key={f} className="rounded-full bg-(--bg-overlay) px-2 py-0.5 text-[10px] text-(--text-muted)">
                  {f}
                </span>
              ))}
            </div>
          ) : null}
          {thread.category === "gigs" && isMax && comment.proofOfWorkSlugs && comment.proofOfWorkSlugs.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {comment.proofOfWorkSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/discussions/${slug}`}
                  className="rounded-lg border border-(--border-default) bg-(--bg-inset) px-2 py-1 text-[11px] text-(--brand-primary) hover:underline"
                >
                  Proof: {slug}
                </a>
              ))}
            </div>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={cn("inline-flex items-center gap-0.5 text-(--text-muted) hover:text-(--text-primary)", v.up && "text-(--brand-primary)")}
              onClick={() => onVote(comment.id, "up")}
            >
              <ArrowBigUp className={cn("h-4 w-4", v.up && "fill-current")} />
              {up}
            </button>
            <button
              type="button"
              className={cn("inline-flex items-center gap-0.5 text-(--text-muted) hover:text-(--text-primary)", v.down && "text-(--feedback-error)")}
              onClick={() => onVote(comment.id, "down")}
            >
              <ArrowBigDown className={cn("h-4 w-4", v.down && "fill-current")} />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-(--text-secondary) hover:text-(--text-primary)"
              onClick={() => {
                if (!ensureAuthenticated()) return;
                setReplyTo(replyTo === comment.id ? null : comment.id);
              }}
            >
              <MessageSquareReply className="h-3.5 w-3.5" />
              Reply
            </button>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-(--bg-overlay)" aria-label="Comment actions">
                  <MoreHorizontal className="h-4 w-4 text-(--text-muted)" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[140px] rounded-[12px] border border-(--border-default) bg-(--bg-surface) p-1 shadow-(--shadow-lg)"
                  align="end"
                >
                  <DropdownMenu.Item className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)">Report</DropdownMenu.Item>
                  <DropdownMenu.Item className="cursor-pointer rounded-[8px] px-2 py-2 text-sm data-highlighted:bg-(--bg-overlay)">Copy link</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          {replyTo === comment.id ? (
            <div className="mt-3">
              <ThreadComposer
                thread={thread}
                placeholder={`Reply to @${user?.handle ?? "user"}…`}
                onSubmit={() => setReplyTo(null)}
                compact
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
