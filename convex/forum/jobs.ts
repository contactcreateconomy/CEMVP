import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Batch-syncs denormalized author fields (authorName, authorHandle, authorImage)
 * on all forumPosts by a given profile. Processes 100 posts per run and
 * self-chains via ctx.scheduler.runAfter until all posts are updated.
 * This avoids hitting Convex's execution time / transaction limits for
 * prolific authors with many posts.
 */
export const syncAuthorDenormalization = internalMutation({
  args: {
    profileId: v.id("forumProfiles"),
    authorPatch: v.object({
      authorName: v.optional(v.string()),
      authorHandle: v.optional(v.string()),
      authorImage: v.optional(v.string()),
    }),
    cursor: v.union(v.string(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, { profileId, authorPatch, cursor }) => {
    const page = await ctx.db
      .query("forumPosts")
      .withIndex("by_author", (q) => q.eq("authorProfileId", profileId))
      .paginate({ numItems: 100, cursor });

    const cleaned = Object.fromEntries(
      Object.entries(authorPatch).filter(([, val]) => val !== undefined),
    );

    if (Object.keys(cleaned).length > 0) {
      for (const post of page.page) {
        await ctx.db.patch(post._id, cleaned);
      }
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.forum.jobs.syncAuthorDenormalization, {
        profileId,
        authorPatch,
        cursor: page.continueCursor,
      });
    }

    return null;
  },
});

/**
 * Reconcile sharded upvote/view counters with the denormalized `forumPosts`
 * fields. Sums all shards per entity and patches the post document.
 * Runs on a 10-minute cron.
 */
export const reconcileUpvoteCounts = internalMutation({
  args: { cursor: v.optional(v.union(v.string(), v.null())) },
  returns: v.null(),
  handler: async (ctx, { cursor }) => {
    const shardPage = await ctx.db
      .query("forumCounterShards")
      .paginate({ numItems: 200, cursor: cursor ?? null });

    // Group by entityId and counterType
    const sums = new Map<string, number>();
    for (const shard of shardPage.page) {
      const key = `${shard.entityId}:${shard.counterType}`;
      sums.set(key, (sums.get(key) ?? 0) + shard.count);
    }

    // Patch posts with accurate counts
    for (const [key, total] of sums) {
      const [entityId, counterType] = key.split(":");
      if (counterType === "upvotes") {
        const post = await ctx.db.get(entityId as Id<"forumPosts">);
        if (post) {
          await ctx.db.patch(post._id, { upvotes: total });
        }
      } else if (counterType === "views") {
        const post = await ctx.db.get(entityId as Id<"forumPosts">);
        if (post) {
          await ctx.db.patch(post._id, { views: total });
        }
      }
    }

    if (!shardPage.isDone) {
      await ctx.scheduler.runAfter(0, internal.forum.jobs.reconcileUpvoteCounts, {
        cursor: shardPage.continueCursor,
      });
    }

    return null;
  },
});

/**
 * Aggregate the previous day's analytics events into daily stats.
 * Powers future admin dashboards without expensive real-time aggregations.
 */
export const aggregateDailyAnalytics = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const yesterdayStart = now - oneDayMs;
    const yesterdayDate = new Date(yesterdayStart).toISOString().slice(0, 10);

    // Scan events from the past 24 hours by iterating over known event types
    const eventTypes = ["post_created", "comment_created", "upvote_added", "post_bookmarked"];
    const allEvents = [];
    for (const eventType of eventTypes) {
      const batch = await ctx.db
        .query("forumAnalyticsEvents")
        .withIndex("by_eventType_createdAt", (q) =>
          q.eq("eventType", eventType).gte("createdAt", yesterdayStart),
        )
        .collect();
      allEvents.push(...batch);
    }

    // Group by eventType + category
    const groups = new Map<string, { eventType: string; category: string | undefined; count: number }>();
    for (const event of allEvents) {
      const key = `${event.eventType}:${event.category ?? "_all"}`;
      const existing = groups.get(key);
      if (existing) {
        existing.count++;
      } else {
        groups.set(key, { eventType: event.eventType, category: event.category, count: 1 });
      }
    }

    // Write aggregated stats
    for (const [, agg] of groups) {
      await ctx.db.insert("forumDailyStats", {
        date: yesterdayDate,
        category: agg.category,
        eventType: agg.eventType,
        count: agg.count,
      });
    }

    return null;
  },
});
