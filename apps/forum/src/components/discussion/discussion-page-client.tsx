"use client";

import { useAuth } from "@cemvp/auth-ui";
import { motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

import type { ContributionTag, DiscussionThread } from "@/types/discussion";
import type { Category, User } from "@/types";

import { BriefToast } from "./brief-toast";
import { CategoryThreadBody } from "./category-bodies";
import { ThreadComments } from "./thread-comments";
import { ThreadComposer } from "./thread-composer";
import { ThreadHeader } from "./thread-header";
import { ThreadDiscussionProvider, useThreadDiscussion } from "./thread-discussion-context";
import { ThreadSidebar, type ThreadSidebarPreview } from "./thread-sidebar";

/** Feed card copy layered on the canonical MVP thread (same category). */
export type FeedThreadOverlay = {
  title: string;
  summary: string;
  body: string;
  authorId: string;
  views: number;
  upvotes: number;
  commentsCount: number;
  createdAt: string;
};

interface DiscussionPageClientProps {
  thread: DiscussionThread;
  author: User | null;
  category: Category | null;
  related: ThreadSidebarPreview[];
  trending: ThreadSidebarPreview[];
  users: User[];
  feedOverlay?: FeedThreadOverlay | null;
}

export function DiscussionPageClient(props: DiscussionPageClientProps) {
  return (
    <ThreadDiscussionProvider>
      <DiscussionPageInner {...props} />
    </ThreadDiscussionProvider>
  );
}

function DiscussionPageInner({
  thread,
  author,
  category,
  related,
  trending,
  users,
  feedOverlay,
}: DiscussionPageClientProps) {
  const { authStatus, openAuthModal } = useAuth();
  const { mainComposerText, setMainComposerText } = useThreadDiscussion();
  const [isMax, setIsMax] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const effectiveThread = useMemo((): DiscussionThread => {
    if (!feedOverlay) return thread;
    return {
      ...thread,
      title: feedOverlay.title,
      body: feedOverlay.body,
      aiSummary: feedOverlay.summary,
      views: feedOverlay.views,
      upvotes: feedOverlay.upvotes,
      createdAt: feedOverlay.createdAt,
    };
  }, [thread, feedOverlay]);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const effectiveAuthor = useMemo(() => {
    if (!feedOverlay) return author;
    return usersById.get(feedOverlay.authorId) ?? author;
  }, [author, feedOverlay, usersById]);

  const [upvotes, setUpvotes] = useState(() => (feedOverlay ? feedOverlay.upvotes : thread.upvotes));
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [bookmarks, setBookmarks] = useState(thread.bookmarks);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [sort, setSort] = useState<"best" | "new" | "top">("best");
  const [activeFilters, setActiveFilters] = useState<Set<ContributionTag>>(new Set());
  const [gigsMode, setGigsMode] = useState<"all" | "questions" | "responses">("all");
  const [showcaseTheme, setShowcaseTheme] = useState(false);

  const ensureAuthenticated = useCallback(() => {
    if (authStatus !== "authenticated") {
      openAuthModal("login");
      return false;
    }
    return true;
  }, [authStatus, openAuthModal]);

  const scrollToComments = () => {
    document.getElementById("discussion-comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFilter = (tag: ContributionTag) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const feedbackChips =
    thread.category === "launch-pad"
      ? thread.categoryBody.feedbackChips
      : thread.category === "showcase"
        ? thread.categoryBody.feedbackChips
        : null;

  return (
    <>
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="min-w-0 flex-1 space-y-6 animate-route-emerge"
        >
          <ThreadHeader
            thread={effectiveThread}
            author={effectiveAuthor}
            commentCount={feedOverlay?.commentsCount}
            category={category}
            isMax={isMax}
            onSetMax={setIsMax}
            upvotes={upvotes}
            isUpvoted={isUpvoted}
            onToggleUpvote={() => {
              setIsUpvoted((v) => {
                const next = !v;
                setUpvotes((u) => u + (next ? 1 : -1));
                return next;
              });
            }}
            bookmarks={bookmarks}
            isBookmarked={isBookmarked}
            onToggleBookmark={() => {
              setIsBookmarked((v) => {
                const next = !v;
                setBookmarks((b) => b + (next ? 1 : -1));
                return next;
              });
            }}
            onScrollToComments={scrollToComments}
            onToast={(msg) => {
              setToast(msg);
              window.setTimeout(() => setToast(null), 2500);
            }}
            ensureAuthenticated={ensureAuthenticated}
          />

          <motion.div
            key={isMax ? "max" : "min"}
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <CategoryThreadBody
              thread={effectiveThread}
              isMax={isMax}
              author={effectiveAuthor}
              ensureAuthenticated={ensureAuthenticated}
            />
          </motion.div>

          <div id="discussion-comments" className="scroll-mt-24 space-y-4">
            {feedbackChips ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-(--text-muted)">What I need feedback on</p>
                <div className="flex flex-wrap gap-2">
                  {feedbackChips.map((c) => (
                    <span key={c} className="rounded-full border border-(--border-default) bg-(--bg-inset) px-3 py-1 text-xs text-(--text-secondary)">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <ThreadComposer thread={effectiveThread} mainValue={mainComposerText} onMainValueChange={setMainComposerText} />

            <ThreadComments
              thread={effectiveThread}
              authorId={feedOverlay?.authorId ?? thread.authorId}
              usersById={usersById}
              isMax={isMax}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onClearFilters={() => setActiveFilters(new Set())}
              ensureAuthenticated={ensureAuthenticated}
              sort={sort}
              onSortChange={setSort}
              gigsCommentMode={gigsMode}
              onGigsCommentModeChange={setGigsMode}
              showcaseGroupByTheme={showcaseTheme}
              onShowcaseGroupToggle={setShowcaseTheme}
            />
          </div>
        </motion.div>

        <ThreadSidebar
          thread={effectiveThread}
          author={effectiveAuthor}
          isMax={isMax}
          related={related}
          trending={trending}
          usersById={usersById}
          categoryName={category?.name ?? "Category"}
        />
      </div>

      {toast ? <BriefToast message={toast} onDismiss={() => setToast(null)} /> : null}
    </>
  );
}
