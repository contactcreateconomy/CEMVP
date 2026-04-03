import { v } from "convex/values";

import { query } from "../_generated/server";
import { CATEGORY_TO_MVP_THREAD_SLUG, discussionHrefForPostShape } from "./constants";
import { DISCUSSION_RELATED_CAP, DISCUSSION_TRENDING_CAP } from "./limits";
import {
  cappedRelatedSlugs,
  cappedTrendingSlugs,
  coalesceRichThreadPayloadForClient,
  hydrateRelatedThreads,
  loadProfilesForIds,
  type RichThreadPayload,
} from "./discussionRouteHelpers";
import { postDocToPost, profileToUser } from "./helpers";

function expectedDiscussionHref(pathSlug: string, feedPostSlug: string | undefined): string {
  return `/discussions/${pathSlug}${feedPostSlug ? `?post=${encodeURIComponent(feedPostSlug)}` : ""}`;
}

export const getDiscussionRouteState = query({
  args: {
    pathSlug: v.string(),
    feedPostSlug: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, { pathSlug, feedPostSlug }) => {
    const categories = (await ctx.db.query("forumCategories").collect()).map((r) => ({
      key: r.key,
      name: r.name,
      icon: r.icon,
      description: r.description,
      primaryColor: r.primaryColor,
      lockedByDefault: r.lockedByDefault,
      pointsToUnlock: r.pointsToUnlock,
    }));

    const richRow = await ctx.db
      .query("forumRichThreads")
      .withIndex("by_slug", (q) => q.eq("slug", pathSlug))
      .unique();

    if (richRow?.payload) {
      const thread = coalesceRichThreadPayloadForClient(richRow.payload as RichThreadPayload);
      const threadSlug = String(thread.slug ?? pathSlug);

      const resolveOverlay = () => {
        if (!feedPostSlug) {
          return null;
        }
        return { feedPostSlug };
      };
      const overlayRef = resolveOverlay();
      let feedOverlay: Record<string, unknown> | null = null;
      if (overlayRef) {
        const postDoc = await ctx.db
          .query("forumPosts")
          .withIndex("by_slug", (q) => q.eq("slug", overlayRef.feedPostSlug))
          .unique();
        if (postDoc) {
          const postShape = postDocToPost(postDoc, { isFavorited: false, viewerHasUpvote: false });
          const canonicalSlug = postShape.isRichThread
            ? postShape.slug
            : CATEGORY_TO_MVP_THREAD_SLUG[postShape.category] ?? postShape.slug;
          const threadCategory = String(thread.category ?? "");
          if (canonicalSlug === threadSlug && postShape.category === threadCategory) {
            feedOverlay = {
              title: postShape.title,
              summary: postShape.summary,
              body: postShape.body,
              authorId: postShape.authorId,
              views: postShape.views,
              upvotes: postShape.upvotes,
              commentsCount: postShape.commentsCount,
              createdAt: postShape.createdAt,
            };
          }
        }
      }

      const userIds = new Set<string>();
      userIds.add(String(thread.authorId));
      if (feedOverlay) {
        userIds.add(String(feedOverlay.authorId));
      }
      const comments = thread.comments as unknown[] | undefined;
      if (Array.isArray(comments)) {
        for (const c of comments) {
          if (c && typeof c === "object" && "authorId" in c) {
            userIds.add(String((c as { authorId: string }).authorId));
          }
        }
      }
      const relatedSlugs = cappedRelatedSlugs(thread);
      const trendingSlugs = cappedTrendingSlugs(thread);
      const rail = thread.insightRail as { topContributor?: { userId: string } } | undefined;
      if (rail?.topContributor?.userId) {
        userIds.add(rail.topContributor.userId);
      }

      const related = await hydrateRelatedThreads(ctx, relatedSlugs, DISCUSSION_RELATED_CAP);
      const trending = await hydrateRelatedThreads(ctx, trendingSlugs, DISCUSSION_TRENDING_CAP);

      for (const r of related) {
        userIds.add(r.authorId);
      }
      for (const t of trending) {
        userIds.add(t.authorId);
      }

      const users = await loadProfilesForIds(ctx, userIds);

      const authorDoc = await ctx.db.get(
        String(thread.authorId) as import("../_generated/dataModel").Id<"forumProfiles">,
      );
      const author = authorDoc ? profileToUser(authorDoc) : null;
      const category = categories.find((c) => c.key === thread.category) ?? null;

      return {
        kind: "rich" as const,
        thread,
        author,
        category,
        related,
        trending,
        users,
        feedOverlay,
        categories,
      };
    }

    const postByPath = await ctx.db
      .query("forumPosts")
      .withIndex("by_slug", (q) => q.eq("slug", pathSlug))
      .unique();

    if (postByPath) {
      const postShape = postDocToPost(postByPath, { isFavorited: false, viewerHasUpvote: false });
      if (!postShape.isRichThread) {
        const canonicalSlug = CATEGORY_TO_MVP_THREAD_SLUG[postShape.category] ?? postShape.slug;
        const canonicalRich = await ctx.db
          .query("forumRichThreads")
          .withIndex("by_slug", (q) => q.eq("slug", canonicalSlug))
          .unique();
        if (canonicalRich) {
          const target = discussionHrefForPostShape({
            slug: postShape.slug,
            category: postShape.category,
            isRichThread: false,
          });
          const current = expectedDiscussionHref(pathSlug, feedPostSlug);
          if (target !== current) {
            return { kind: "redirect" as const, href: target };
          }
        }
      }
    }

    if (postByPath) {
      const postShape = postDocToPost(postByPath, { isFavorited: false, viewerHasUpvote: false });
      const authorDoc = await ctx.db.get(postByPath.authorProfileId);
      const author = authorDoc ? profileToUser(authorDoc) : null;
      const commentDocs = await ctx.db
        .query("forumPostComments")
        .withIndex("by_post", (q) => q.eq("postId", postByPath._id))
        .collect();
      const comments = commentDocs.slice(0, 12).map((c) => ({
        id: c._id as string,
        postId: c.postId as string,
        authorId: c.authorProfileId as string,
        body: c.body,
        createdAt: new Date(c.createdAt).toISOString(),
        upvotes: c.upvotes,
      }));
      const commentAuthorIds = [...new Set(comments.map((c) => c.authorId))];
      const commentAuthors = [];
      for (const id of commentAuthorIds) {
        const d = await ctx.db.get(id as import("../_generated/dataModel").Id<"forumProfiles">);
        if (d) {
          commentAuthors.push(profileToUser(d));
        }
      }
      return {
        kind: "simple" as const,
        post: postShape,
        author,
        comments,
        commentAuthors,
      };
    }

    return { kind: "not_found" as const };
  },
});
