import { v } from "convex/values";

export const researchSnippetValidator = v.object({
  title: v.string(),
  url: v.string(),
  snippet: v.string(),
});

export const personaSkillValidator = v.object({
  id: v.string(),
  key: v.string(),
  name: v.string(),
  expertiseTags: v.array(v.string()),
  tone: v.string(),
  writingStyle: v.string(),
  preferredCategories: v.array(v.string()),
  postPromptTemplate: v.string(),
  commentPromptTemplate: v.string(),
  enabled: v.boolean(),
});

export const personaValidator = v.object({
  id: v.string(),
  profileId: v.string(),
  seedKey: v.union(v.string(), v.null()),
  displayName: v.string(),
  handle: v.string(),
  image: v.string(),
  bio: v.string(),
  skillId: v.string(),
  skillName: v.string(),
  active: v.boolean(),
  autoPublish: v.boolean(),
  postsTodayCount: v.number(),
  dailyPostLimit: v.number(),
  lastPostAt: v.union(v.number(), v.null()),
  level: v.number(),
  points: v.number(),
  streakDays: v.number(),
  verified: v.boolean(),
});

export const topicBriefValidator = v.object({
  id: v.string(),
  title: v.string(),
  keywords: v.array(v.string()),
  category: v.string(),
  sourceUrls: v.array(v.string()),
  status: v.union(
    v.literal("suggested"),
    v.literal("open"),
    v.literal("in_use"),
    v.literal("closed"),
  ),
  source: v.union(v.literal("manual"), v.literal("reddit"), v.literal("tavily"), v.null()),
  score: v.union(v.number(), v.null()),
  sourceMeta: v.union(v.any(), v.null()),
  createdAt: v.number(),
});

export const draftValidator = v.object({
  id: v.string(),
  kind: v.union(v.literal("post"), v.literal("comment")),
  personaId: v.string(),
  personaName: v.string(),
  targetPostId: v.union(v.string(), v.null()),
  targetPostTitle: v.union(v.string(), v.null()),
  topicBriefId: v.union(v.string(), v.null()),
  title: v.union(v.string(), v.null()),
  body: v.string(),
  summary: v.union(v.string(), v.null()),
  category: v.union(v.string(), v.null()),
  researchSnippets: v.array(researchSnippetValidator),
  status: v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
    v.literal("published"),
  ),
  safetyFlag: v.boolean(),
  safetyMatchedTerms: v.array(v.string()),
  scheduledPublishAt: v.union(v.number(), v.null()),
  publishedPostId: v.union(v.string(), v.null()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const automationConfigValidator = v.object({
  enabled: v.boolean(),
  maxPostsPerDay: v.number(),
  maxCommentsPerPost: v.number(),
  commentDelayMinMinutes: v.number(),
  commentDelayMaxMinutes: v.number(),
  defaultCategories: v.array(v.string()),
  postsGeneratedToday: v.number(),
  watchedSubreddits: v.array(v.string()),
  trendingKeywords: v.array(v.string()),
  trendingAutoCreate: v.boolean(),
  activeHoursStart: v.union(v.number(), v.null()),
  activeHoursEnd: v.union(v.number(), v.null()),
  timezoneOffsetMinutes: v.number(),
  seedInitialEngagement: v.boolean(),
  replyToHumansEnabled: v.boolean(),
});

export const blockedKeywordValidator = v.object({
  id: v.string(),
  term: v.string(),
  severity: v.union(v.literal("block"), v.literal("flag")),
  category: v.string(),
  createdAt: v.number(),
});

export const adminPostValidator = v.object({
  id: v.string(),
  slug: v.string(),
  title: v.string(),
  summary: v.string(),
  category: v.string(),
  authorName: v.string(),
  authorHandle: v.string(),
  moderationStatus: v.union(
    v.literal("visible"),
    v.literal("flagged"),
    v.literal("removed"),
    v.literal("shadow_removed"),
  ),
  upvotes: v.number(),
  commentsCount: v.number(),
  views: v.number(),
  createdAt: v.number(),
  managedByAutomation: v.boolean(),
});

export const adminReportValidator = v.object({
  id: v.string(),
  contentType: v.union(v.literal("post"), v.literal("comment")),
  contentId: v.string(),
  reason: v.string(),
  details: v.union(v.string(), v.null()),
  status: v.string(),
  createdAt: v.number(),
  reporterName: v.union(v.string(), v.null()),
  contentPreview: v.union(v.string(), v.null()),
});

export const analyticsSummaryValidator = v.object({
  totalDrafts: v.number(),
  pendingDrafts: v.number(),
  publishedDrafts: v.number(),
  rejectedDrafts: v.number(),
  postsByPersona: v.array(
    v.object({
      personaId: v.string(),
      personaName: v.string(),
      publishedCount: v.number(),
    }),
  ),
  runsByType: v.array(
    v.object({
      runType: v.string(),
      count: v.number(),
      successRate: v.number(),
    }),
  ),
});

export const automationRunValidator = v.object({
  id: v.string(),
  runType: v.union(
    v.literal("generate_post_draft"),
    v.literal("generate_comment_draft"),
    v.literal("scheduler_tick"),
    v.literal("publish_draft"),
    v.literal("manual_trigger"),
    v.literal("discover_trending"),
    v.literal("reply_to_humans"),
  ),
  personaId: v.union(v.string(), v.null()),
  draftId: v.union(v.string(), v.null()),
  success: v.boolean(),
  error: v.union(v.string(), v.null()),
  createdAt: v.number(),
});

export const dashboardStatsValidator = v.object({
  pendingDrafts: v.number(),
  publishedToday: v.number(),
  activePersonas: v.number(),
  postsGeneratedToday: v.number(),
  automationEnabled: v.boolean(),
});
