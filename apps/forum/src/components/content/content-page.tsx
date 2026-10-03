"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUp, Bookmark, Share2, Bell, Users, MessageSquare } from "lucide-react";
import { PostBlock } from "./post-block";
import { ReplyComposer } from "./reply-composer";
import { ThreadModeBar, type ViewMode } from "./thread-mode-bar";
import { CommentThread } from "./comment-thread";
import { CreatorPanel } from "./creator-panel";
import { ThreadIntelligencePanel } from "./thread-intelligence-panel";
import { EngagementPanel } from "./engagement-panel";
import { cn } from "@/lib/utils";
import { fmtCount } from "@/lib/format";
import ModeToggle from "@/components/ui/toggle-switch";
import type { SeedThread, SeedComment } from "@/app/(app)/(content)/content/_seed";

export interface ContentPageProps {
  mode: "max" | "minimal";
  thread: SeedThread;
  comments: SeedComment[];
  onModeChange?: (mode: "max" | "minimal") => void;
}

// ─── Reading Progress Bar ──────────────────────────────────────────────────

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min((scrollTop / scrollHeight) * 100, 100) : 0);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress < 2) return null;

  return (
    <div className="sticky top-[calc(3.5rem+2.75rem)] z-20 h-0.5 bg-[var(--border-subtle)]">
      <div
        className="h-full bg-[var(--brand-primary)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ─── Scroll-to-top FAB ─────────────────────────────────────────────────────

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 lg:bottom-8 right-6 z-40 h-9 w-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-md flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-prominent)] transition-all animate-soft-float-up"
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────

function ContentToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 2000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-24 lg:bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-[14px] border border-[var(--border-prominent)] bg-[var(--bg-surface-elevated)] px-4 py-2.5 text-center text-sm text-[var(--text-primary)] shadow-lg animate-soft-float-up">
      {message}
    </div>
  );
}

// ─── Sticky Header ─────────────────────────────────────────────────────────

function ContentGlobalHeader({ thread, commentCount, mode, onModeChange }: { thread: SeedThread; commentCount: number; mode: "max" | "minimal"; onModeChange?: (mode: "max" | "minimal") => void }) {
  return (
    <div className="sticky top-14 z-50 bg-[var(--bg-canvas)]/90 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-11 flex items-center gap-3">
        <p className="text-xs font-medium text-[var(--text-secondary)] truncate flex-1 min-w-0">
          {thread.title}
        </p>

        {onModeChange && (
          <div className="flex-shrink-0">
            <ModeToggle
              value={mode === "max" ? "max" : "min"}
              onChange={(v) => onModeChange(v === "max" ? "max" : "minimal")}
            />
          </div>
        )}

        <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {fmtCount(commentCount)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {thread.stats.viewersNow} viewing
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-secondary)] transition-colors">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-secondary)] transition-colors">
            <Bookmark className="h-3.5 w-3.5" />
          </button>
          <button className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface-elevated)] hover:text-[var(--text-secondary)] transition-colors">
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export function ContentPage({ mode, thread, comments, onModeChange }: ContentPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("read");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const isMinimal = mode === "minimal";

  const totalComments = useMemo(() => {
    function countAll(cs: SeedComment[]): number {
      return cs.reduce((acc, c) => acc + 1 + countAll(c.replies ?? []), 0);
    }
    return countAll(comments);
  }, [comments]);

  return (
    <div className="min-h-screen">
      <ContentGlobalHeader thread={thread} commentCount={totalComments} mode={mode} onModeChange={onModeChange} />
      <ReadingProgressBar />

      <div className="mx-auto max-w-[1440px] px-4 lg:px-8 pt-6 pb-20">
        <div className="flex gap-6 lg:gap-8 items-start">
          {/* Main column */}
          <div className="min-w-0 flex-1">
            <PostBlock thread={thread} mode={mode} onModeChange={onModeChange} />

            <div className="mt-4">
              <ReplyComposer mode={mode} />
            </div>

            {/* Thread Map — max mode gets all tabs, minimal gets read-only */}
            {!isMinimal && (
              <div className="mt-4">
                <ThreadModeBar
                  viewMode={viewMode}
                  onViewModeChange={(m) => {
                    setViewMode(m);
                    setActiveFilter(null);
                    setActiveTheme(null);
                  }}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  commentCount={totalComments}
                  themeCount={thread.aiThemes.length}
                  showFilterChips={viewMode === "read" || viewMode === "insights"}
                />
              </div>
            )}

            <div className="mt-4">
              <CommentThread
                comments={comments}
                viewMode={isMinimal ? "read" : viewMode}
                activeFilter={isMinimal ? null : activeFilter}
                activeTheme={isMinimal ? null : activeTheme}
                onToast={showToast}
              />
            </div>
          </div>

          {/* Desktop sidebar */}
          <aside className={cn("hidden lg:block w-[300px] flex-shrink-0", isMinimal && "lg:hidden")}>
            {!isMinimal && (
              <div className="sticky top-[100px] space-y-4">
                <CreatorPanel
                  author={thread.author}
                  products={thread.creatorProducts}
                  liveSession={thread.liveSession}
                  mode={mode}
                  onToast={showToast}
                />
                <ThreadIntelligencePanel
                  thread={thread}
                  activeTheme={activeTheme}
                  onThemeClick={setActiveTheme}
                />
                <EngagementPanel thread={thread} mode={mode} />
              </div>
            )}
          </aside>
        </div>

        {/* Mobile sidebar — only in max mode */}
        {!isMinimal && (
          <div className="lg:hidden mt-8 space-y-4">
            <CreatorPanel
              author={thread.author}
              products={thread.creatorProducts}
              liveSession={thread.liveSession}
              mode={mode}
              onToast={showToast}
            />
            <ThreadIntelligencePanel
              thread={thread}
              activeTheme={activeTheme}
              onThemeClick={setActiveTheme}
            />
            <EngagementPanel thread={thread} mode={mode} />
          </div>
        )}

        {/* Minimal mode: compact creator card below comments */}
        {isMinimal && (
          <div className="mt-8">
            <CreatorPanel
              author={thread.author}
              products={[]}
              mode="minimal"
              onToast={showToast}
            />
          </div>
        )}
      </div>

      <ScrollToTop />
      {toast ? <ContentToast message={toast} onDismiss={() => setToast(null)} /> : null}
    </div>
  );
}
