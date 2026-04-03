"use client";

import { useQuery } from "convex/react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FeedClient } from "@/components/feed/feed-client";
import { TrendSorter } from "@/components/feed/trend-sorter";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { Comment, Post, User } from "@/types";
import type { Category } from "@/types";

interface FeedRouteClientProps {
  selectedCategory?: string;
  selectedSort: "top" | "hot" | "new" | "fav";
}

function mergeUsers(prev: User[], next: User[]): User[] {
  const byId = new Map(prev.map((u) => [u.id, u]));
  for (const u of next) {
    if (!byId.has(u.id)) {
      byId.set(u.id, u);
    }
  }
  return [...byId.values()];
}

function mergeComments(prev: Comment[], next: Comment[]): Comment[] {
  const ids = new Set(prev.map((c) => c.id));
  const out = [...prev];
  for (const c of next) {
    if (!ids.has(c.id)) {
      ids.add(c.id);
      out.push(c);
    }
  }
  return out;
}

export function FeedRouteClient({ selectedCategory, selectedSort }: FeedRouteClientProps) {
  const enabled = isConvexConfigured();
  const sortArg =
    selectedSort === "top" ? "top" : selectedSort === "hot" ? "hot" : selectedSort === "fav" ? "fav" : "new";
  const needsPagination = sortArg === "new" || sortArg === "fav";

  const [cursor, setCursor] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const appendNextRef = useRef(false);

  useEffect(() => {
    setCursor(null);
    appendNextRef.current = false;
    setPosts([]);
    setComments([]);
    setUsers([]);
  }, [selectedCategory, selectedSort]);

  const page = useQuery(
    api.forum.queries.listFeedPage,
    enabled
      ? {
          sort: sortArg,
          category: selectedCategory,
          cursor: needsPagination ? cursor : null,
          limit: 24,
        }
      : "skip",
  );

  useEffect(() => {
    if (page === undefined || page === null) {
      return;
    }
    if (appendNextRef.current) {
      appendNextRef.current = false;
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const next = [...prev];
        for (const p of page.posts as Post[]) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            next.push(p);
          }
        }
        return next;
      });
      setComments((prev) => mergeComments(prev, page.comments as Comment[]));
      setUsers((prev) => mergeUsers(prev, page.users as User[]));
      return;
    }
    setPosts(page.posts as Post[]);
    setComments(page.comments as Comment[]);
    setUsers(page.users as User[]);
  }, [page]);

  const categories = useQuery(api.forum.queries.listCategories, enabled ? {} : "skip");

  const loadMore = useCallback(() => {
    if (!page?.continueCursor || page.isDone) {
      return;
    }
    appendNextRef.current = true;
    setCursor(page.continueCursor);
  }, [page?.continueCursor, page?.isDone]);

  const canLoadMore = Boolean(needsPagination && page && !page.isDone && page.continueCursor);

  const initialPosts = useMemo(() => posts, [posts]);

  if (!enabled) {
    return (
      <p className="text-sm text-(--text-muted)">
        Set <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code> and run the forum seed to load the feed.
      </p>
    );
  }

  if (page === undefined || categories === undefined) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="card-surface animate-soft-float p-2">
        <Suspense fallback={null}>
          <TrendSorter />
        </Suspense>
      </header>

      <FeedClient
        initialPosts={initialPosts}
        allComments={comments}
        users={users}
        selectedSort={selectedSort}
        categories={categories as Category[]}
      />

      {canLoadMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            className="rounded-full border border-(--border-subtle) px-4 py-2 text-sm font-medium text-(--text-secondary) transition-colors hover:border-(--border-active) hover:text-(--text-primary)"
            onClick={() => loadMore()}
          >
            Load more
          </button>
        </div>
      ) : null}
    </section>
  );
}
