import { v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";
import { getOrCreateAutomationConfig } from "./configHelpers";

export const scanHumanCommentsForReply = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const config = await getOrCreateAutomationConfig(ctx);
    if (!config.replyToHumansEnabled) {
      return null;
    }

    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    const personas = await ctx.db
      .query("forumPersonas")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    if (personas.length === 0) {
      return null;
    }

    const managedProfileIds = new Set<Id<"forumProfiles">>();
    for (const persona of personas) {
      managedProfileIds.add(persona.profileId);
    }

    const recentPosts = await ctx.db
      .query("forumPosts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(50);

    let scheduled = 0;
    for (const post of recentPosts) {
      if (post.createdAt < cutoff) continue;
      if (!managedProfileIds.has(post.authorProfileId)) continue;

      const comments = await ctx.db
        .query("forumPostComments")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();

      const humanComments = comments.filter(
        (c) => !managedProfileIds.has(c.authorProfileId) && !c.parentId,
      );
      if (humanComments.length === 0) continue;

      const personaReplies = comments.filter((c) => managedProfileIds.has(c.authorProfileId));
      if (personaReplies.length > 0) continue;

      const replier = personas[scheduled % personas.length];
      await ctx.scheduler.runAfter(0, internal.forum.personas.generateAction.generateCommentDraft, {
        personaId: replier._id,
        targetPostId: post._id,
      });
      scheduled += 1;
      if (scheduled >= 3) break;
    }

    await ctx.db.insert("forumAutomationRuns", {
      runType: "reply_to_humans",
      success: true,
      metadata: { scheduled },
      createdAt: Date.now(),
    });

    return null;
  },
});
