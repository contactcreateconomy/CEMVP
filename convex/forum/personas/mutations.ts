import { v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
import {
  addBlockedKeywordRow,
  assertContentSafe,
  checkBlockedKeywords,
  ensureStarterBlockedKeywords,
  listBlockedKeywordsForAdmin,
} from "../moderation/contentSafety";
import { requirePersonaAdmin } from "./auth";
import { getOrCreateAutomationConfig } from "./configHelpers";

export const updateAutomationConfig = mutation({
  args: {
    enabled: v.optional(v.boolean()),
    maxPostsPerDay: v.optional(v.number()),
    maxCommentsPerPost: v.optional(v.number()),
    commentDelayMinMinutes: v.optional(v.number()),
    commentDelayMaxMinutes: v.optional(v.number()),
    defaultCategories: v.optional(v.array(v.string())),
    watchedSubreddits: v.optional(v.array(v.string())),
    trendingKeywords: v.optional(v.array(v.string())),
    trendingAutoCreate: v.optional(v.boolean()),
    activeHoursStart: v.optional(v.number()),
    activeHoursEnd: v.optional(v.number()),
    timezoneOffsetMinutes: v.optional(v.number()),
    seedInitialEngagement: v.optional(v.boolean()),
    replyToHumansEnabled: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePersonaAdmin(ctx);
    const config = await getOrCreateAutomationConfig(ctx);
    await ctx.db.patch(config._id, {
      ...args,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const pauseAutomation = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const config = await getOrCreateAutomationConfig(ctx);
    await ctx.db.patch(config._id, { enabled: false, updatedAt: Date.now() });
    return null;
  },
});

export const createTopicBrief = mutation({
  args: {
    title: v.string(),
    keywords: v.array(v.string()),
    category: v.string(),
    sourceUrls: v.optional(v.array(v.string())),
  },
  returns: v.id("forumTopicBriefs"),
  handler: async (ctx, args) => {
    const { userId } = await requirePersonaAdmin(ctx);
    return await ctx.db.insert("forumTopicBriefs", {
      title: args.title.trim(),
      keywords: args.keywords.map((k) => k.trim()).filter(Boolean),
      category: args.category.trim(),
      sourceUrls: args.sourceUrls ?? [],
      status: "open",
      source: "manual",
      createdByUserId: userId,
      createdAt: Date.now(),
    });
  },
});

export const closeTopicBrief = mutation({
  args: { topicBriefId: v.id("forumTopicBriefs") },
  returns: v.null(),
  handler: async (ctx, { topicBriefId }) => {
    await requirePersonaAdmin(ctx);
    await ctx.db.patch(topicBriefId, { status: "closed" });
    return null;
  },
});

export const createPersona = mutation({
  args: {
    displayName: v.string(),
    handle: v.string(),
    image: v.string(),
    bio: v.string(),
    skillId: v.id("forumPersonaSkills"),
    active: v.optional(v.boolean()),
    autoPublish: v.optional(v.boolean()),
    dailyPostLimit: v.optional(v.number()),
    level: v.optional(v.number()),
    points: v.optional(v.number()),
    streakDays: v.optional(v.number()),
    verified: v.optional(v.boolean()),
  },
  returns: v.id("forumPersonas"),
  handler: async (ctx, args) => {
    await requirePersonaAdmin(ctx);

    const handle = args.handle.trim().toLowerCase();
    const existingHandle = await ctx.db
      .query("forumProfiles")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .unique();
    if (existingHandle) {
      throw new Error("Handle already taken.");
    }

    const level = args.level ?? Math.floor(Math.random() * 25) + 1;
    const points = args.points ?? level * 120 + Math.floor(Math.random() * 500);
    const streakDays = args.streakDays ?? Math.floor(Math.random() * 30);
    const verified = args.verified ?? Math.random() < 0.3;

    const profileId = await ctx.db.insert("forumProfiles", {
      handle,
      name: args.displayName.trim(),
      image: args.image.trim(),
      bio: args.bio.trim(),
      level,
      points,
      streakDays,
      role: "member",
      managedByAutomation: true,
      verified,
    });

    return await ctx.db.insert("forumPersonas", {
      profileId,
      displayName: args.displayName.trim(),
      skillId: args.skillId,
      active: args.active ?? false,
      autoPublish: args.autoPublish ?? false,
      postsTodayCount: 0,
      dailyPostLimit: args.dailyPostLimit ?? 1,
    });
  },
});

export const updatePersona = mutation({
  args: {
    personaId: v.id("forumPersonas"),
    displayName: v.optional(v.string()),
    skillId: v.optional(v.id("forumPersonaSkills")),
    active: v.optional(v.boolean()),
    autoPublish: v.optional(v.boolean()),
    dailyPostLimit: v.optional(v.number()),
    level: v.optional(v.number()),
    points: v.optional(v.number()),
    streakDays: v.optional(v.number()),
    verified: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, {
    personaId,
    displayName,
    skillId,
    active,
    bio,
    image,
    autoPublish,
    dailyPostLimit,
    level,
    points,
    streakDays,
    verified,
  }) => {
    await requirePersonaAdmin(ctx);
    const persona = await ctx.db.get(personaId);
    if (!persona) throw new Error("Persona not found.");

    const patch: Record<string, unknown> = {};
    if (displayName !== undefined) patch.displayName = displayName.trim();
    if (skillId !== undefined) patch.skillId = skillId;
    if (active !== undefined) patch.active = active;
    if (autoPublish !== undefined) patch.autoPublish = autoPublish;
    if (dailyPostLimit !== undefined) patch.dailyPostLimit = dailyPostLimit;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(personaId, patch);
    }

    const profilePatch: Record<string, unknown> = {};
    if (displayName !== undefined) profilePatch.name = displayName.trim();
    if (bio !== undefined) profilePatch.bio = bio.trim();
    if (image !== undefined) profilePatch.image = image.trim();
    if (level !== undefined) profilePatch.level = level;
    if (points !== undefined) profilePatch.points = points;
    if (streakDays !== undefined) profilePatch.streakDays = streakDays;
    if (verified !== undefined) profilePatch.verified = verified;
    if (Object.keys(profilePatch).length > 0) {
      await ctx.db.patch(persona.profileId, profilePatch);
    }

    return null;
  },
});

export const updateSkill = mutation({
  args: {
    skillId: v.id("forumPersonaSkills"),
    name: v.optional(v.string()),
    tone: v.optional(v.string()),
    writingStyle: v.optional(v.string()),
    expertiseTags: v.optional(v.array(v.string())),
    preferredCategories: v.optional(v.array(v.string())),
    postPromptTemplate: v.optional(v.string()),
    commentPromptTemplate: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, { skillId, ...fields }) => {
    await requirePersonaAdmin(ctx);
    const skill = await ctx.db.get(skillId);
    if (!skill) throw new Error("Skill not found.");
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(skillId, patch);
    }
    return null;
  },
});

export const editDraft = mutation({
  args: {
    draftId: v.id("forumContentDrafts"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { draftId, ...fields }) => {
    await requirePersonaAdmin(ctx);
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found.");
    if (draft.status === "published") throw new Error("Cannot edit published draft.");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }

    const safetyTexts = [
      typeof patch.title === "string" ? patch.title : draft.title,
      typeof patch.summary === "string" ? patch.summary : draft.summary,
      typeof patch.body === "string" ? patch.body : draft.body,
    ].filter((t): t is string => typeof t === "string" && t.length > 0);
    const safety = await checkBlockedKeywords(ctx, safetyTexts);
    assertContentSafe(safety);
    patch.safetyFlag = safety.flagged;
    patch.safetyMatchedTerms = safety.matchedTerms;

    await ctx.db.patch(draftId, patch);
    return null;
  },
});

export const approveDraft = mutation({
  args: { draftId: v.id("forumContentDrafts") },
  returns: v.null(),
  handler: async (ctx, { draftId }) => {
    const { userId } = await requirePersonaAdmin(ctx);
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found.");
    if (draft.status !== "pending") throw new Error("Only pending drafts can be approved.");

    await ctx.db.patch(draftId, {
      status: "approved",
      reviewedByUserId: userId,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const rejectDraft = mutation({
  args: {
    draftId: v.id("forumContentDrafts"),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { draftId, reason }) => {
    const { userId } = await requirePersonaAdmin(ctx);
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found.");
    if (draft.status !== "pending" && draft.status !== "approved") {
      throw new Error("Draft cannot be rejected.");
    }

    await ctx.db.patch(draftId, {
      status: "rejected",
      rejectionReason: reason,
      reviewedByUserId: userId,
      reviewedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const publishDraft = mutation({
  args: { draftId: v.id("forumContentDrafts") },
  returns: v.object({
    postId: v.union(v.id("forumPosts"), v.null()),
    commentId: v.union(v.id("forumPostComments"), v.null()),
  }),
  handler: async (ctx, { draftId }): Promise<{
    postId: Id<"forumPosts"> | null;
    commentId: Id<"forumPostComments"> | null;
  }> => {
    const { userId } = await requirePersonaAdmin(ctx);
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error("Draft not found.");
    if (draft.status === "pending") {
      await ctx.db.patch(draftId, {
        status: "approved",
        reviewedByUserId: userId,
        reviewedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return await ctx.runMutation(internal.forum.personas.publishInternal.publishApprovedDraftInternal, {
      draftId,
      reviewedByUserId: userId,
    });
  },
});

export const triggerGeneration = mutation({
  args: {
    personaId: v.id("forumPersonas"),
    topicBriefId: v.optional(v.id("forumTopicBriefs")),
  },
  returns: v.null(),
  handler: async (ctx, { personaId, topicBriefId }) => {
    await requirePersonaAdmin(ctx);
    await ctx.db.insert("forumAutomationRuns", {
      runType: "manual_trigger",
      personaId,
      topicBriefId,
      success: true,
      createdAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.forum.personas.generateAction.generatePostDraft, {
      personaId,
      topicBriefId,
    });
    return null;
  },
});

export const bootstrapPersonas = mutation({
  args: {},
  returns: v.object({
    skillsInserted: v.number(),
    personasInserted: v.number(),
    profilesCreated: v.number(),
  }),
  handler: async (ctx): Promise<{
    skillsInserted: number;
    personasInserted: number;
    profilesCreated: number;
  }> => {
    await requirePersonaAdmin(ctx);
    return await ctx.runMutation(internal.forum.personas.seed.seedPersonasAndSkills, {});
  },
});

function slugifyKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "skill";
}

export const createSkill = mutation({
  args: {
    name: v.string(),
    expertiseTags: v.array(v.string()),
    tone: v.string(),
    writingStyle: v.string(),
    preferredCategories: v.array(v.string()),
    postPromptTemplate: v.string(),
    commentPromptTemplate: v.string(),
    enabled: v.optional(v.boolean()),
  },
  returns: v.id("forumPersonaSkills"),
  handler: async (ctx, args) => {
    await requirePersonaAdmin(ctx);
    const baseKey = slugifyKey(args.name);
    let key = baseKey;
    let suffix = 0;
    while (
      await ctx.db
        .query("forumPersonaSkills")
        .withIndex("by_key", (q) => q.eq("key", key))
        .unique()
    ) {
      suffix += 1;
      key = `${baseKey}-${suffix}`;
    }

    return await ctx.db.insert("forumPersonaSkills", {
      key,
      name: args.name.trim(),
      expertiseTags: args.expertiseTags,
      tone: args.tone.trim(),
      writingStyle: args.writingStyle.trim(),
      preferredCategories: args.preferredCategories,
      postPromptTemplate: args.postPromptTemplate,
      commentPromptTemplate: args.commentPromptTemplate,
      enabled: args.enabled ?? true,
    });
  },
});

export const deleteSkill = mutation({
  args: { skillId: v.id("forumPersonaSkills") },
  returns: v.null(),
  handler: async (ctx, { skillId }) => {
    await requirePersonaAdmin(ctx);
    const inUse = await ctx.db
      .query("forumPersonas")
      .filter((q) => q.eq(q.field("skillId"), skillId))
      .first();
    if (inUse) {
      throw new Error("Skill is assigned to a persona. Reassign or delete the persona first.");
    }
    await ctx.db.delete(skillId);
    return null;
  },
});

export const deletePersona = mutation({
  args: { personaId: v.id("forumPersonas") },
  returns: v.null(),
  handler: async (ctx, { personaId }) => {
    await requirePersonaAdmin(ctx);
    const persona = await ctx.db.get(personaId);
    if (!persona) throw new Error("Persona not found.");
    await ctx.db.delete(personaId);
    return null;
  },
});

export const deleteTopicBrief = mutation({
  args: { topicBriefId: v.id("forumTopicBriefs") },
  returns: v.null(),
  handler: async (ctx, { topicBriefId }) => {
    await requirePersonaAdmin(ctx);
    const brief = await ctx.db.get(topicBriefId);
    if (!brief) throw new Error("Topic not found.");
    if (brief.status === "in_use") {
      throw new Error("Cannot delete a topic that is in use.");
    }
    await ctx.db.delete(topicBriefId);
    return null;
  },
});

export const acceptSuggestedTopic = mutation({
  args: { topicBriefId: v.id("forumTopicBriefs") },
  returns: v.null(),
  handler: async (ctx, { topicBriefId }) => {
    await requirePersonaAdmin(ctx);
    const brief = await ctx.db.get(topicBriefId);
    if (!brief) throw new Error("Topic not found.");
    if (brief.status !== "suggested") {
      throw new Error("Only suggested topics can be accepted.");
    }
    await ctx.db.patch(topicBriefId, { status: "open" });
    return null;
  },
});

export const dismissSuggestedTopic = mutation({
  args: { topicBriefId: v.id("forumTopicBriefs") },
  returns: v.null(),
  handler: async (ctx, { topicBriefId }) => {
    await requirePersonaAdmin(ctx);
    const brief = await ctx.db.get(topicBriefId);
    if (!brief) throw new Error("Topic not found.");
    if (brief.status !== "suggested") {
      throw new Error("Only suggested topics can be dismissed.");
    }
    await ctx.db.delete(topicBriefId);
    return null;
  },
});

export const triggerTrendingDiscovery = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    await ctx.scheduler.runAfter(0, internal.forum.personas.trendingAction.discoverTrendingTopics, {});
    return null;
  },
});

export const updateTrendingConfig = mutation({
  args: {
    watchedSubreddits: v.optional(v.array(v.string())),
    trendingKeywords: v.optional(v.array(v.string())),
    trendingAutoCreate: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePersonaAdmin(ctx);
    const config = await getOrCreateAutomationConfig(ctx);
    await ctx.db.patch(config._id, { ...args, updatedAt: Date.now() });
    return null;
  },
});

export const addBlockedKeyword = mutation({
  args: {
    term: v.string(),
    severity: v.union(v.literal("block"), v.literal("flag")),
    category: v.optional(v.string()),
  },
  returns: v.id("forumBlockedKeywords"),
  handler: async (ctx, args) => {
    const { userId } = await requirePersonaAdmin(ctx);
    await ensureStarterBlockedKeywords(ctx);
    return await addBlockedKeywordRow(ctx, {
      term: args.term,
      severity: args.severity,
      category: args.category ?? "general",
      userId,
    });
  },
});

export const removeBlockedKeyword = mutation({
  args: { keywordId: v.id("forumBlockedKeywords") },
  returns: v.null(),
  handler: async (ctx, { keywordId }) => {
    await requirePersonaAdmin(ctx);
    await ctx.db.delete(keywordId);
    return null;
  },
});
