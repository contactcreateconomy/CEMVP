import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { researchSnippetValidator } from "./validators";

export const saveGeneratedDraft = internalMutation({
  args: {
    kind: v.union(v.literal("post"), v.literal("comment")),
    personaId: v.id("forumPersonas"),
    targetPostId: v.optional(v.id("forumPosts")),
    topicBriefId: v.optional(v.id("forumTopicBriefs")),
    title: v.optional(v.string()),
    body: v.string(),
    summary: v.optional(v.string()),
    category: v.optional(v.string()),
    researchSnippets: v.array(researchSnippetValidator),
    scheduledPublishAt: v.optional(v.number()),
  },
  returns: v.id("forumContentDrafts"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const draftId = await ctx.db.insert("forumContentDrafts", {
      kind: args.kind,
      personaId: args.personaId,
      targetPostId: args.targetPostId,
      topicBriefId: args.topicBriefId,
      title: args.title,
      body: args.body,
      summary: args.summary,
      category: args.category,
      researchSnippets: args.researchSnippets,
      status: "pending",
      scheduledPublishAt: args.scheduledPublishAt,
      createdAt: now,
      updatedAt: now,
    });

    if (args.topicBriefId) {
      await ctx.db.patch(args.topicBriefId, { status: "in_use" });
    }

    await ctx.db.insert("forumAutomationRuns", {
      runType: args.kind === "post" ? "generate_post_draft" : "generate_comment_draft",
      personaId: args.personaId,
      draftId,
      topicBriefId: args.topicBriefId,
      success: true,
      createdAt: now,
    });

    return draftId;
  },
});

export const logAutomationRun = internalMutation({
  args: {
    runType: v.union(
      v.literal("generate_post_draft"),
      v.literal("generate_comment_draft"),
      v.literal("scheduler_tick"),
      v.literal("publish_draft"),
      v.literal("manual_trigger"),
    ),
    personaId: v.optional(v.id("forumPersonas")),
    draftId: v.optional(v.id("forumContentDrafts")),
    topicBriefId: v.optional(v.id("forumTopicBriefs")),
    success: v.boolean(),
    error: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("forumAutomationRuns", {
      ...args,
      createdAt: Date.now(),
    });
    return null;
  },
});
