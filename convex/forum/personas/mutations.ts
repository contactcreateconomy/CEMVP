import { v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { mutation } from "../../_generated/server";
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

    const profileId = await ctx.db.insert("forumProfiles", {
      handle,
      name: args.displayName.trim(),
      image: args.image.trim(),
      bio: args.bio.trim(),
      level: 1,
      points: 0,
      streakDays: 0,
      role: "member",
      managedByAutomation: true,
    });

    return await ctx.db.insert("forumPersonas", {
      profileId,
      displayName: args.displayName.trim(),
      skillId: args.skillId,
      active: args.active ?? false,
      postsTodayCount: 0,
      dailyPostLimit: 1,
    });
  },
});

export const updatePersona = mutation({
  args: {
    personaId: v.id("forumPersonas"),
    displayName: v.optional(v.string()),
    skillId: v.optional(v.id("forumPersonaSkills")),
    active: v.optional(v.boolean()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { personaId, displayName, skillId, active, bio, image }) => {
    await requirePersonaAdmin(ctx);
    const persona = await ctx.db.get(personaId);
    if (!persona) throw new Error("Persona not found.");

    const patch: Record<string, unknown> = {};
    if (displayName !== undefined) patch.displayName = displayName.trim();
    if (skillId !== undefined) patch.skillId = skillId;
    if (active !== undefined) patch.active = active;
    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(personaId, patch);
    }

    const profilePatch: Record<string, unknown> = {};
    if (displayName !== undefined) profilePatch.name = displayName.trim();
    if (bio !== undefined) profilePatch.bio = bio.trim();
    if (image !== undefined) profilePatch.image = image.trim();
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
