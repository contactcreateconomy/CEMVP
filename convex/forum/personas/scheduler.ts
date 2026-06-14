import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalMutation } from "../../_generated/server";
import { utcDayKey } from "./auth";
import { getOrCreateAutomationConfig, resetDailyCountersIfNeeded } from "./configHelpers";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const runPersonaScheduler = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const config = await getOrCreateAutomationConfig(ctx);
    await resetDailyCountersIfNeeded(ctx, config._id);
    const refreshed = await ctx.db.get(config._id);
    if (!refreshed?.enabled) {
      return null;
    }

    await ctx.db.insert("forumAutomationRuns", {
      runType: "scheduler_tick",
      success: true,
      metadata: { postsGeneratedToday: refreshed.postsGeneratedToday },
      createdAt: Date.now(),
    });

    if (refreshed.postsGeneratedToday >= refreshed.maxPostsPerDay) {
      return null;
    }

    const today = utcDayKey();
    const personas = await ctx.db
      .query("forumPersonas")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const eligible = personas.filter((p) => {
      const postsToday = p.lastPostsDayKey === today ? p.postsTodayCount : 0;
      return postsToday < p.dailyPostLimit;
    });

    const remaining = refreshed.maxPostsPerDay - refreshed.postsGeneratedToday;
    const toSchedule = eligible.slice(0, remaining);

    for (const persona of toSchedule) {
      await ctx.scheduler.runAfter(
        randomInt(0, 5 * 60 * 1000),
        internal.forum.personas.generateAction.generatePostDraft,
        { personaId: persona._id },
      );
    }

    return null;
  },
});

export const scheduleCommentDraftsForPost = internalMutation({
  args: {
    postId: v.id("forumPosts"),
    authorPersonaId: v.id("forumPersonas"),
  },
  returns: v.null(),
  handler: async (ctx, { postId, authorPersonaId }) => {
    const config = await getOrCreateAutomationConfig(ctx);
    const personas = await ctx.db
      .query("forumPersonas")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    const commenters = personas
      .filter((p) => p._id !== authorPersonaId)
      .slice(0, config.maxCommentsPerPost);

    for (const persona of commenters) {
      const delayMs =
        randomInt(config.commentDelayMinMinutes, config.commentDelayMaxMinutes) * 60 * 1000;
      await ctx.scheduler.runAfter(
        delayMs,
        internal.forum.personas.generateAction.generateCommentDraft,
        {
          personaId: persona._id,
          targetPostId: postId,
          scheduledPublishAt: Date.now() + delayMs,
        },
      );
    }

    return null;
  },
});
