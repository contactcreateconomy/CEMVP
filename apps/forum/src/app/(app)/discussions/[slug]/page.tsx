/**
 * Route: /discussions/[slug]
 * Auth requirement: Optional
 * MVP threads: *-001 slugs use full discussion shell + category bodies (mock).
 */
import { notFound, redirect } from "next/navigation";
import { MessageSquare, UserRound } from "lucide-react";

import { DiscussionPageClient } from "@/components/discussion/discussion-page-client";
import type { ThreadSidebarPreview } from "@/components/discussion/thread-sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FeedThreadOverlay } from "@/components/discussion/discussion-page-client";
import {
  getCategories,
  getCommentsByPostId,
  getDiscussionThreadBySlug,
  getPostBySlug,
  getUserById,
} from "@/lib/adapters/content";
import { getDiscussionHrefForPost, getFeedPostDiscussionSlug } from "@/lib/discussion/feed-post-discussion-slug";
import { formatRelativeDate } from "@/lib/format";

interface DiscussionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ post?: string }>;
}

function resolveFeedOverlay(slug: string, feedPostSlug: string | undefined): FeedThreadOverlay | null {
  if (!feedPostSlug) return null;
  const post = getPostBySlug(feedPostSlug);
  if (!post) return null;
  if (getFeedPostDiscussionSlug(post) !== slug) return null;
  const canonical = getDiscussionThreadBySlug(slug);
  if (!canonical || post.category !== canonical.category) return null;
  return {
    title: post.title,
    summary: post.summary,
    body: post.body,
    authorId: post.authorId,
    views: post.views,
    upvotes: post.upvotes,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
  };
}

function threadPreview(slug: string): ThreadSidebarPreview | null {
  const t = getDiscussionThreadBySlug(slug);
  if (!t) return null;
  return {
    slug: t.slug,
    title: t.title,
    authorId: t.authorId,
    engagement: t.upvotes + t.comments.length * 2,
  };
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function DiscussionPage({ params, searchParams }: DiscussionPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const feedPostSlug = firstSearchParam(resolvedSearch?.post);
  const thread = getDiscussionThreadBySlug(slug);

  /** Feed cards used to link here with slugified titles — send users to the MVP thread + overlay. */
  if (!thread) {
    const post = getPostBySlug(slug);
    if (post && getDiscussionThreadBySlug(getFeedPostDiscussionSlug(post))) {
      redirect(getDiscussionHrefForPost(post));
    }
  }

  if (thread) {
    const feedOverlay = resolveFeedOverlay(slug, feedPostSlug);
    const categories = getCategories();
    const category = categories.find((c) => c.key === thread.category) ?? null;
    const author = getUserById(thread.authorId);
    const related = thread.relatedSlugs.map(threadPreview).filter((x): x is ThreadSidebarPreview => x !== null);
    const trending = thread.trendingSlugs.map(threadPreview).filter((x): x is ThreadSidebarPreview => x !== null);
    const userIds = new Set<string>();
    userIds.add(thread.authorId);
    if (feedOverlay) {
      userIds.add(feedOverlay.authorId);
    }
    thread.comments.forEach((c) => userIds.add(c.authorId));
    related.forEach((r) => userIds.add(r.authorId));
    trending.forEach((r) => userIds.add(r.authorId));
    userIds.add(thread.insightRail.topContributor.userId);
    const users = [...userIds].map((id) => getUserById(id)).filter((u): u is NonNullable<typeof u> => u != null);

    return (
      <DiscussionPageClient
        thread={thread}
        author={author}
        category={category}
        related={related}
        trending={trending}
        users={users}
        feedOverlay={feedOverlay}
      />
    );
  }

  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const postAuthor = getUserById(post.authorId);
  const postComments = getCommentsByPostId(post.id).slice(0, 12);

  return (
    <section className="animate-route-emerge space-y-4">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-(--text-primary)">{post.title}</h1>
            <p className="text-sm text-(--text-muted)">
              by {postAuthor?.name ?? "Unknown author"} · {formatRelativeDate(post.createdAt)}
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
            <MessageSquare className="h-4 w-4" /> Comments ({postComments.length})
          </h2>
        </CardHeader>

        <CardContent className="space-y-3">
          {postComments.map((comment) => {
            const commentAuthor = getUserById(comment.authorId);

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
