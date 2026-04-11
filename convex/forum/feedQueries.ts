import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  FEED_COMMENTS_PREVIEW_PER_POST,
  FEED_HOT_RANK_WINDOW,
  FEED_PAGE_DEFAULT,
  FEED_PAGE_MAX,
} from "./limits";
import { postDocToPost, profileToUser, userFromPostAuthorSnapshot } from "./helpers";

function viralityScoreDoc(p: Doc<"forumPosts">) {
  return p.upvotes * 1.2 + p.commentsCount * 2 + p.views * 0.06;
}

export async function viewerFlagsForPostIds(
  ctx: QueryCtx,
  userId: string | null,
  postIds: Id<"forumPosts">[],
): Promise<{ favoritePostIds: Set<string>; upvotePostIds: Set<string> }> {
  const favoritePostIds = new Set<string>();
  const upvotePostIds = new Set<string>();
  if (!userId || postIds.length === 0) {
    return { favoritePostIds, upvotePostIds };
  }
  const uid = userId as Id<"users">;

  // Batch: fetch all favorites for user, then filter in memory
  const allFavs = await ctx.db
    .query("forumFavorites")
    .withIndex("by_user", (q) => q.eq("userId", uid))
    .collect();
  const favPostIdSet = new Set(allFavs.map((f) => f.postId as string));
  for (const pid of postIds) {
    if (favPostIdSet.has(pid)) favoritePostIds.add(pid);
  }

  // Batch: fetch all upvotes for user, then filter in memory
  const allUps = await ctx.db
    .query("forumUpvotes")
    .withIndex("by_user", (q) => q.eq("userId", uid))
    .collect();
  const upPostIdSet = new Set(allUps.map((u) => u.postId as string));
  for (const pid of postIds) {
    if (upPostIdSet.has(pid)) upvotePostIds.add(pid);
  }

  return { favoritePostIds, upvotePostIds };
}

export async function loadCommentPreviewsForPostIds(
  ctx: QueryCtx,
  postIds: Id<"forumPosts">[],
  limitPerPost: number,
) {
  const results = await Promise.all(
    postIds.map(async (postId) => {
      const docs = await ctx.db
        .query("forumPostComments")
        .withIndex("by_post_createdAt", (q) => q.eq("postId", postId))
        .order("desc")
        .take(limitPerPost);
      const chronological = [...docs].reverse();
      return chronological.map((c) => ({
        id: c._id as string,
        postId: c.postId as string,
        authorId: c.authorProfileId as string,
        body: c.body,
        createdAt: new Date(c.createdAt).toISOString(),
        upvotes: c.upvotes,
      }));
    }),
  );
  return results.flat();
}

export async function resolveUsersForFeed(
  ctx: QueryCtx,
  postDocs: Doc<"forumPosts">[],
  comments: { authorId: string }[],
) {
  const needProfileIds = new Set<string>();
  for (const p of postDocs) {
    if (!userFromPostAuthorSnapshot(p)) {
      needProfileIds.add(p.authorProfileId as string);
    }
  }
  for (const c of comments) {
    needProfileIds.add(c.authorId);
  }

  const byId = new Map<string, ReturnType<typeof profileToUser>>();
  for (const id of needProfileIds) {
    const doc = await ctx.db.get(id as Id<"forumProfiles">);
    if (doc) {
      byId.set(id, profileToUser(doc));
    }
  }
  for (const p of postDocs) {
    const snap = userFromPostAuthorSnapshot(p);
    if (snap && !byId.has(snap.id)) {
      byId.set(snap.id, snap);
    }
  }
  return [...byId.values()];
}

export async function buildFeedBundleFromPosts(
  ctx: QueryCtx,
  postDocs: Doc<"forumPosts">[],
  userId: string | null,
) {
  const { favoritePostIds, upvotePostIds } = await viewerFlagsForPostIds(
    ctx,
    userId,
    postDocs.map((p) => p._id),
  );
  const posts = postDocs.map((p) =>
    postDocToPost(p, {
      isFavorited: favoritePostIds.has(p._id),
      viewerHasUpvote: upvotePostIds.has(p._id),
    }),
  );
  const comments = await loadCommentPreviewsForPostIds(
    ctx,
    postDocs.map((p) => p._id),
    FEED_COMMENTS_PREVIEW_PER_POST,
  );
  const users = await resolveUsersForFeed(ctx, postDocs, comments);
  return { posts, comments, users };
}

export async function loadHotRankedPosts(
  ctx: QueryCtx,
  category: string | undefined,
  limit: number,
): Promise<Doc<"forumPosts">[]> {
  const raw = await ctx.db
    .query("forumPosts")
    .withIndex("by_createdAt")
    .order("desc")
    .take(FEED_HOT_RANK_WINDOW);
  let rows = raw;
  if (category) {
    rows = rows.filter((p) => p.category === category);
  }
  rows.sort((a, b) => viralityScoreDoc(b) - viralityScoreDoc(a));
  return rows.slice(0, limit);
}

export function feedPageSize(limit?: number) {
  return Math.min(Math.max(limit ?? FEED_PAGE_DEFAULT, 1), FEED_PAGE_MAX);
}
