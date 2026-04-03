"use client";

import { useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { FeedClient } from "@/components/feed/feed-client";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { Category, Comment, Post, User } from "@/types";

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

export function SavedPageClient() {
  const enabled = isConvexConfigured();
  const [cursor, setCursor] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const appendNextRef = useRef(false);

  const page = useQuery(
    api.forum.queries.listFeedPage,
    enabled ? { sort: "fav" as const, cursor, limit: 24 } : "skip",
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

  const canLoadMore = Boolean(page && !page.isDone && page.continueCursor);

  if (!enabled) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex to see saved posts.
      </p>
    );
  }

  if (page === undefined || categories === undefined) {
    return null;
  }

  return (
    <section className="animate-route-emerge space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-(--text-primary)">Saved</h1>
        <p className="mt-1 text-sm text-(--text-muted)">Posts you have marked as favorites.</p>
      </div>
      <FeedClient
        initialPosts={posts}
        allComments={comments}
        users={users}
        selectedSort="top"
        categories={categories as Category[]}
        emptyState={{
          title: "No saved posts yet",
          description: "Bookmark posts from the feed while signed in — they will show up here.",
        }}
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
