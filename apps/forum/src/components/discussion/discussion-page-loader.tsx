"use client";

import { useQuery } from "convex/react";
import { MessageSquare, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DiscussionPageClient } from "@/components/discussion/discussion-page-client";
import type { FeedThreadOverlay } from "@/components/discussion/discussion-page-client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { DiscussionThread } from "@/types/discussion";
import type { Comment, Post, User } from "@/types";
import { formatRelativeDate } from "@/lib/format";

interface DiscussionPageLoaderProps {
  pathSlug: string;
  feedPostSlug: string | undefined;
}

function DiscussionPageLoaderWithConvex({ pathSlug, feedPostSlug }: DiscussionPageLoaderProps) {
  const router = useRouter();
  const state = useQuery(api.forum.discussionRoute.getDiscussionRouteState, { pathSlug, feedPostSlug });
  const sidebarData = useQuery(
    api.forum.discussionRoute.getDiscussionSidebarData,
    state?.kind === "rich" ? { threadSlug: pathSlug } : "skip",
  );

  useEffect(() => {
    if (state?.kind === "redirect") {
      router.replace(state.href);
    }
  }, [router, state]);

  if (state === undefined) {
    return null;
  }

  if (state.kind === "redirect") {
    return null;
  }

  if (state.kind === "not_found") {
    return (
      <section className="animate-route-emerge space-y-2">
        <h1 className="text-xl font-semibold text-(--text-primary)">Discussion not found</h1>
        <p className="text-sm text-(--text-muted)">This slug does not match a post or thread in the database.</p>
      </section>
    );
  }

  if (state.kind === "rich") {
    return (
      <DiscussionPageClient
        thread={state.thread as unknown as DiscussionThread}
        author={state.author}
        category={state.category as import("@/types").Category | null}
        related={sidebarData?.related ?? state.related}
        trending={sidebarData?.trending ?? state.trending}
        users={[
          ...(state.users as User[]),
          ...((sidebarData?.sidebarUsers ?? []) as User[]),
        ]}
        feedOverlay={state.feedOverlay as FeedThreadOverlay | null | undefined}
      />
    );
  }

  const post = state.post as Post;
  const author = state.author as User | null;
  const comments = state.comments as Comment[];
  const commentAuthors = state.commentAuthors as User[];

  return (
    <section className="animate-route-emerge space-y-4">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-(--text-primary)">{post.title}</h1>
            <p className="text-sm text-(--text-muted)">
              by {author?.name ?? "Unknown author"} · {formatRelativeDate(post.createdAt)}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-(--text-secondary)">{post.body}</p>

          <div className="rounded-md border border-(--border-default) bg-(--bg-surface) p-3 text-xs text-(--text-muted)">
            <p>Category: {post.category}</p>
            <p className="mt-1">
              {post.views.toLocaleString()} views · {post.upvotes.toLocaleString()} upvotes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="inline-flex items-center gap-2 text-lg font-semibold text-(--text-primary)">
            <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
          </h2>
        </CardHeader>

        <CardContent className="space-y-3">
          {comments.map((comment) => {
            const commentAuthor = commentAuthors.find((u) => u.id === comment.authorId);

            return (
              <div key={comment.id} className="rounded-md border border-(--border-default) bg-(--bg-surface) p-3">
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-(--text-primary)">
                  <UserRound className="h-3.5 w-3.5" />
                  {commentAuthor?.name ?? "Unknown user"}
                </p>
                <p className="mt-1 text-xs leading-5 text-(--text-secondary)">{comment.body}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

export function DiscussionPageLoader({ pathSlug, feedPostSlug }: DiscussionPageLoaderProps) {
  if (!isConvexConfigured()) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex (set <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code>) to load discussions.
      </p>
    );
  }

  return <DiscussionPageLoaderWithConvex pathSlug={pathSlug} feedPostSlug={feedPostSlug} />;
}
