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
  skillId: v.string(),
  skillName: v.string(),
  active: v.boolean(),
  postsTodayCount: v.number(),
  dailyPostLimit: v.number(),
  lastPostAt: v.union(v.number(), v.null()),
});

export const topicBriefValidator = v.object({
  id: v.string(),
  title: v.string(),
  keywords: v.array(v.string()),
  category: v.string(),
  sourceUrls: v.array(v.string()),
  status: v.union(v.literal("open"), v.literal("in_use"), v.literal("closed")),
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
});

export const automationRunValidator = v.object({
  id: v.string(),
  runType: v.union(
    v.literal("generate_post_draft"),
    v.literal("generate_comment_draft"),
    v.literal("scheduler_tick"),
    v.literal("publish_draft"),
    v.literal("manual_trigger"),
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
