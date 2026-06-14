import { v } from "convex/values";

import { internalQuery } from "../../_generated/server";

export const getPostGenerationContext = internalQuery({
  args: {
    personaId: v.id("forumPersonas"),
    topicBriefId: v.optional(v.id("forumTopicBriefs")),
  },
  returns: v.object({
    persona: v.object({
      displayName: v.string(),
    }),
    skill: v.object({
      tone: v.string(),
      writingStyle: v.string(),
      expertiseTags: v.array(v.string()),
      postPromptTemplate: v.string(),
      preferredCategories: v.array(v.string()),
    }),
    topicTitle: v.string(),
    topicKeywords: v.array(v.string()),
    category: v.string(),
  }),
  handler: async (ctx, { personaId, topicBriefId }) => {
    const persona = await ctx.db.get(personaId);
    if (!persona) {
      throw new Error("Persona not found.");
    }
    const skill = await ctx.db.get(persona.skillId);
    if (!skill) {
      throw new Error("Skill not found.");
    }

    let topicTitle = "Latest trends for AI-native creators";
    let topicKeywords: string[] = skill.expertiseTags.slice(0, 3);
    let category = skill.preferredCategories[0] ?? "news";

    if (topicBriefId) {
      const brief = await ctx.db.get(topicBriefId);
      if (brief) {
        topicTitle = brief.title;
        topicKeywords = brief.keywords;
        category = brief.category;
      }
    } else {
      const openBrief = await ctx.db
        .query("forumTopicBriefs")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .order("desc")
        .first();
      if (openBrief) {
        topicTitle = openBrief.title;
        topicKeywords = openBrief.keywords;
        category = openBrief.category;
      }
    }

    return {
      persona: { displayName: persona.displayName },
      skill: {
        tone: skill.tone,
        writingStyle: skill.writingStyle,
        expertiseTags: skill.expertiseTags,
        postPromptTemplate: skill.postPromptTemplate,
        preferredCategories: skill.preferredCategories,
      },
      topicTitle,
      topicKeywords,
      category,
    };
  },
});

export const getCommentGenerationContext = internalQuery({
  args: {
    personaId: v.id("forumPersonas"),
    targetPostId: v.id("forumPosts"),
  },
  returns: v.object({
    persona: v.object({
      displayName: v.string(),
    }),
    skill: v.object({
      tone: v.string(),
      writingStyle: v.string(),
      commentPromptTemplate: v.string(),
    }),
    postTitle: v.string(),
    postSummary: v.string(),
    postBodyExcerpt: v.string(),
  }),
  handler: async (ctx, { personaId, targetPostId }) => {
    const persona = await ctx.db.get(personaId);
    if (!persona) {
      throw new Error("Persona not found.");
    }
    const skill = await ctx.db.get(persona.skillId);
    if (!skill) {
      throw new Error("Skill not found.");
    }
    const post = await ctx.db.get(targetPostId);
    if (!post) {
      throw new Error("Post not found.");
    }

    return {
      persona: { displayName: persona.displayName },
      skill: {
        tone: skill.tone,
        writingStyle: skill.writingStyle,
        commentPromptTemplate: skill.commentPromptTemplate,
      },
      postTitle: post.title,
      postSummary: post.summary,
      postBodyExcerpt: post.body.slice(0, 1200),
    };
  },
});
