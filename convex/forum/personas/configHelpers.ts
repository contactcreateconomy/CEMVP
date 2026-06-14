import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { utcDayKey } from "./auth";

const CONFIG_KEY = "default";

export const DEFAULT_AUTOMATION_CONFIG = {
  enabled: false,
  maxPostsPerDay: 5,
  maxCommentsPerPost: 3,
  commentDelayMinMinutes: 30,
  commentDelayMaxMinutes: 240,
  defaultCategories: ["news", "review", "qa", "showcase", "list"],
  watchedSubreddits: ["artificial", "MachineLearning", "Entrepreneur"],
  trendingKeywords: ["AI", "creator", "startup", "automation", "SaaS"],
  trendingAutoCreate: false,
  activeHoursStart: 8,
  activeHoursEnd: 22,
  timezoneOffsetMinutes: 0,
  seedInitialEngagement: true,
  replyToHumansEnabled: false,
};

export async function getOrCreateAutomationConfig(ctx: QueryCtx | MutationCtx) {
  const existing = await ctx.db
    .query("forumAutomationConfig")
    .withIndex("by_key", (q) => q.eq("key", CONFIG_KEY))
    .unique();

  if (existing) {
    return existing;
  }

  if (!("insert" in ctx.db)) {
    throw new Error("Automation config missing.");
  }

  const now = Date.now();
  const id = await (ctx as MutationCtx).db.insert("forumAutomationConfig", {
    key: CONFIG_KEY,
    ...DEFAULT_AUTOMATION_CONFIG,
    postsGeneratedToday: 0,
    lastPostsDayKey: utcDayKey(now),
    updatedAt: now,
  });
  const created = await ctx.db.get(id);
  if (!created) {
    throw new Error("Failed to create automation config.");
  }
  return created;
}

export function isWithinActiveWindow(
  config: {
    activeHoursStart?: number;
    activeHoursEnd?: number;
    timezoneOffsetMinutes?: number;
  },
  nowMs: number = Date.now(),
): boolean {
  const start = config.activeHoursStart ?? DEFAULT_AUTOMATION_CONFIG.activeHoursStart;
  const end = config.activeHoursEnd ?? DEFAULT_AUTOMATION_CONFIG.activeHoursEnd;
  const offset = config.timezoneOffsetMinutes ?? 0;
  const local = new Date(nowMs + offset * 60 * 1000);
  const hour = local.getUTCHours();
  if (start <= end) {
    return hour >= start && hour < end;
  }
  return hour >= start || hour < end;
}

export async function resetDailyCountersIfNeeded(
  ctx: MutationCtx,
  configId: Id<"forumAutomationConfig">,
) {
  const config = await ctx.db.get(configId);
  if (!config) {
    return;
  }
  const today = utcDayKey();
  if (config.lastPostsDayKey === today) {
    return;
  }
  await ctx.db.patch(configId, {
    postsGeneratedToday: 0,
    lastPostsDayKey: today,
    updatedAt: Date.now(),
  });

  const personas = await ctx.db.query("forumPersonas").collect();
  for (const persona of personas) {
    if (persona.lastPostsDayKey !== today) {
      await ctx.db.patch(persona._id, {
        postsTodayCount: 0,
        lastPostsDayKey: today,
      });
    }
  }
}

export async function incrementPostsGeneratedToday(
  ctx: MutationCtx,
  configId: Id<"forumAutomationConfig">,
) {
  await resetDailyCountersIfNeeded(ctx, configId);
  const config = await ctx.db.get(configId);
  if (!config) {
    return;
  }
  await ctx.db.patch(configId, {
    postsGeneratedToday: config.postsGeneratedToday + 1,
    updatedAt: Date.now(),
  });
}

export async function incrementPersonaPostCount(
  ctx: MutationCtx,
  personaId: Id<"forumPersonas">,
) {
  const persona = await ctx.db.get(personaId);
  if (!persona) {
    return;
  }
  const today = utcDayKey();
  const postsTodayCount =
    persona.lastPostsDayKey === today ? persona.postsTodayCount + 1 : 1;
  await ctx.db.patch(personaId, {
    postsTodayCount,
    lastPostsDayKey: today,
    lastPostAt: Date.now(),
  });
}

export function mapAutomationConfig(config: Awaited<ReturnType<typeof getOrCreateAutomationConfig>>) {
  return {
    enabled: config.enabled,
    maxPostsPerDay: config.maxPostsPerDay,
    maxCommentsPerPost: config.maxCommentsPerPost,
    commentDelayMinMinutes: config.commentDelayMinMinutes,
    commentDelayMaxMinutes: config.commentDelayMaxMinutes,
    defaultCategories: config.defaultCategories,
    postsGeneratedToday: config.postsGeneratedToday,
    watchedSubreddits: config.watchedSubreddits ?? DEFAULT_AUTOMATION_CONFIG.watchedSubreddits,
    trendingKeywords: config.trendingKeywords ?? DEFAULT_AUTOMATION_CONFIG.trendingKeywords,
    trendingAutoCreate: config.trendingAutoCreate ?? false,
    activeHoursStart: config.activeHoursStart ?? DEFAULT_AUTOMATION_CONFIG.activeHoursStart,
    activeHoursEnd: config.activeHoursEnd ?? DEFAULT_AUTOMATION_CONFIG.activeHoursEnd,
    timezoneOffsetMinutes:
      config.timezoneOffsetMinutes ?? DEFAULT_AUTOMATION_CONFIG.timezoneOffsetMinutes,
    seedInitialEngagement: config.seedInitialEngagement ?? true,
    replyToHumansEnabled: config.replyToHumansEnabled ?? false,
  };
}
