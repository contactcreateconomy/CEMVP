import { v } from "convex/values";

import { query } from "../../_generated/server";
import {
  ensureStarterBlockedKeywords,
  listBlockedKeywordsForAdmin,
} from "../moderation/contentSafety";
import { requirePersonaAdmin, utcDayKey } from "./auth";
import {
  analyticsSummaryValidator,
  automationConfigValidator,
  automationRunValidator,
  blockedKeywordValidator,
  dashboardStatsValidator,
  draftValidator,
  personaSkillValidator,
  personaValidator,
  topicBriefValidator,
} from "./validators";
import { getOrCreateAutomationConfig, mapAutomationConfig } from "./configHelpers";

export const getDashboardStats = query({
  args: {},
  returns: dashboardStatsValidator,
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const config = await getOrCreateAutomationConfig(ctx);
    const today = utcDayKey();

    const pendingDrafts = await ctx.db
      .query("forumContentDrafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    const publishedToday = (await ctx.db.query("forumContentDrafts").collect()).filter(
      (d) => d.status === "published" && d.reviewedAt && utcDayKey(d.reviewedAt) === today,
    ).length;

    const activePersonas = await ctx.db
      .query("forumPersonas")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    return {
      pendingDrafts: pendingDrafts.length,
      publishedToday,
      activePersonas: activePersonas.length,
      postsGeneratedToday: config.postsGeneratedToday,
      automationEnabled: config.enabled,
    };
  },
});

export const getAutomationConfig = query({
  args: {},
  returns: automationConfigValidator,
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const config = await getOrCreateAutomationConfig(ctx);
    return mapAutomationConfig(config);
  },
});

export const listSkills = query({
  args: {},
  returns: v.array(personaSkillValidator),
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const rows = await ctx.db.query("forumPersonaSkills").collect();
    return rows.map((row) => ({
      id: row._id as string,
      key: row.key,
      name: row.name,
      expertiseTags: row.expertiseTags,
      tone: row.tone,
      writingStyle: row.writingStyle,
      preferredCategories: row.preferredCategories,
      postPromptTemplate: row.postPromptTemplate,
      commentPromptTemplate: row.commentPromptTemplate,
      enabled: row.enabled,
    }));
  },
});

export const listPersonas = query({
  args: {},
  returns: v.array(personaValidator),
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const rows = await ctx.db.query("forumPersonas").collect();
    const out = [];
    for (const row of rows) {
      const profile = await ctx.db.get(row.profileId);
      const skill = await ctx.db.get(row.skillId);
      if (!profile || !skill) continue;
      out.push({
        id: row._id as string,
        profileId: row.profileId as string,
        seedKey: row.seedKey ?? null,
        displayName: row.displayName,
        handle: profile.handle,
        image: profile.image,
        bio: profile.bio,
        skillId: row.skillId as string,
        skillName: skill.name,
        active: row.active,
        autoPublish: row.autoPublish ?? false,
        postsTodayCount: row.postsTodayCount,
        dailyPostLimit: row.dailyPostLimit,
        lastPostAt: row.lastPostAt ?? null,
        level: profile.level,
        points: profile.points,
        streakDays: profile.streakDays,
        verified: profile.verified ?? false,
      });
    }
    return out;
  },
});

export const listTopicBriefs = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("suggested"),
        v.literal("open"),
        v.literal("in_use"),
        v.literal("closed"),
      ),
    ),
  },
  returns: v.array(topicBriefValidator),
  handler: async (ctx, { status }) => {
    await requirePersonaAdmin(ctx);
    const rows = status
      ? await ctx.db
          .query("forumTopicBriefs")
          .withIndex("by_status", (q) => q.eq("status", status))
          .order("desc")
          .collect()
      : await ctx.db.query("forumTopicBriefs").order("desc").collect();

    return rows.map((row) => ({
      id: row._id as string,
      title: row.title,
      keywords: row.keywords,
      category: row.category,
      sourceUrls: row.sourceUrls,
      status: row.status,
      source: row.source ?? null,
      score: row.score ?? null,
      sourceMeta: row.sourceMeta ?? null,
      createdAt: row.createdAt,
    }));
  },
});

export const listDrafts = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("published"),
      ),
    ),
  },
  returns: v.array(draftValidator),
  handler: async (ctx, { status }) => {
    await requirePersonaAdmin(ctx);
    const rows = status
      ? await ctx.db
          .query("forumContentDrafts")
          .withIndex("by_status", (q) => q.eq("status", status))
          .order("desc")
          .collect()
      : await ctx.db.query("forumContentDrafts").order("desc").collect();

    const out = [];
    for (const row of rows) {
      const persona = await ctx.db.get(row.personaId);
      let targetPostTitle: string | null = null;
      if (row.targetPostId) {
        const post = await ctx.db.get(row.targetPostId);
        targetPostTitle = post?.title ?? null;
      }
      out.push({
        id: row._id as string,
        kind: row.kind,
        personaId: row.personaId as string,
        personaName: persona?.displayName ?? "Unknown",
        targetPostId: row.targetPostId ? (row.targetPostId as string) : null,
        targetPostTitle,
        topicBriefId: row.topicBriefId ? (row.topicBriefId as string) : null,
        title: row.title ?? null,
        body: row.body,
        summary: row.summary ?? null,
        category: row.category ?? null,
        researchSnippets: row.researchSnippets,
        status: row.status,
        safetyFlag: row.safetyFlag ?? false,
        safetyMatchedTerms: row.safetyMatchedTerms ?? [],
        scheduledPublishAt: row.scheduledPublishAt ?? null,
        publishedPostId: row.publishedPostId ? (row.publishedPostId as string) : null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });
    }
    return out;
  },
});

export const listAutomationRuns = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(automationRunValidator),
  handler: async (ctx, { limit = 50 }) => {
    await requirePersonaAdmin(ctx);
    const cap = Math.min(Math.max(limit, 1), 200);
    const rows = await ctx.db
      .query("forumAutomationRuns")
      .withIndex("by_createdAt")
      .order("desc")
      .take(cap);

    return rows.map((row) => ({
      id: row._id as string,
      runType: row.runType,
      personaId: row.personaId ? (row.personaId as string) : null,
      draftId: row.draftId ? (row.draftId as string) : null,
      success: row.success,
      error: row.error ?? null,
      createdAt: row.createdAt,
    }));
  },
});

export const listBlockedKeywords = query({
  args: {},
  returns: v.array(blockedKeywordValidator),
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    return await listBlockedKeywordsForAdmin(ctx);
  },
});

export const getAnalyticsSummary = query({
  args: {},
  returns: analyticsSummaryValidator,
  handler: async (ctx) => {
    await requirePersonaAdmin(ctx);
    const drafts = await ctx.db.query("forumContentDrafts").collect();
    const personas = await ctx.db.query("forumPersonas").collect();
    const runs = await ctx.db.query("forumAutomationRuns").take(500);

    const postsByPersona = personas.map((p) => ({
      personaId: p._id as string,
      personaName: p.displayName,
      publishedCount: drafts.filter((d) => d.personaId === p._id && d.status === "published").length,
    }));

    const runTypeMap = new Map<string, { total: number; success: number }>();
    for (const run of runs) {
      const entry = runTypeMap.get(run.runType) ?? { total: 0, success: 0 };
      entry.total += 1;
      if (run.success) entry.success += 1;
      runTypeMap.set(run.runType, entry);
    }

    const runsByType = [...runTypeMap.entries()].map(([runType, stats]) => ({
      runType,
      count: stats.total,
      successRate: stats.total > 0 ? stats.success / stats.total : 0,
    }));

    return {
      totalDrafts: drafts.length,
      pendingDrafts: drafts.filter((d) => d.status === "pending").length,
      publishedDrafts: drafts.filter((d) => d.status === "published").length,
      rejectedDrafts: drafts.filter((d) => d.status === "rejected").length,
      postsByPersona,
      runsByType,
    };
  },
});

export const isPersonaAdmin = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    try {
      await requirePersonaAdmin(ctx);
      return true;
    } catch {
      return false;
    }
  },
});
