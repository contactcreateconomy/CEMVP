"use node";

import { v } from "convex/values";

import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import { internalAction } from "../../_generated/server";
import { buildResearchContext, searchWeb } from "./research";

type GeneratedPost = {
  title: string;
  summary: string;
  body: string;
  category: string;
};

type GeneratedComment = {
  body: string;
};

async function callGlm(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    throw new Error("GLM_API_KEY is not configured on the Convex deployment.");
  }

  const model = process.env.GLM_MODEL ?? "glm-4-flash";
  const baseUrl =
    process.env.GLM_API_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4/chat/completions";

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GLM API failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("GLM returned empty content.");
  }
  return content;
}

export const generatePostDraft = internalAction({
  args: {
    personaId: v.id("forumPersonas"),
    topicBriefId: v.optional(v.id("forumTopicBriefs")),
  },
  returns: v.union(v.id("forumContentDrafts"), v.null()),
  handler: async (ctx, { personaId, topicBriefId }): Promise<Id<"forumContentDrafts"> | null> => {
    try {
      const context = await ctx.runQuery(internal.forum.personas.generateContext.getPostGenerationContext, {
        personaId,
        topicBriefId,
      });

      const query = context.topicKeywords.length
        ? context.topicKeywords.join(" ")
        : `${context.skill.expertiseTags.join(" ")} ${context.category} creators AI`;

      const snippets = await searchWeb(query);
      const researchBlock = buildResearchContext(snippets);

      const systemPrompt = `You are ${context.persona.displayName}, a forum member with this voice:
Tone: ${context.skill.tone}
Style: ${context.skill.writingStyle}
Expertise: ${context.skill.expertiseTags.join(", ")}

${context.skill.postPromptTemplate}

Return valid JSON only: {"title":"...","summary":"...","body":"...","category":"..."}
Body may use simple HTML paragraphs (<p>, <ul>, <li>). Keep title under 120 chars, summary under 300 chars.`;

      const userPrompt = `Topic: ${context.topicTitle}
Category preference: ${context.category}
Keywords: ${context.topicKeywords.join(", ") || "general AI creator economy"}

Research snippets:
${researchBlock}`;

      const raw = await callGlm(systemPrompt, userPrompt);
      const parsed = JSON.parse(raw) as GeneratedPost;

      const duplicate = await ctx.runQuery(
        internal.forum.personas.generateContext.checkPostTitleDuplicate,
        { title: parsed.title },
      );
      if (duplicate) {
        throw new Error("Generated title duplicates recent content.");
      }

      const draftId = await ctx.runMutation(internal.forum.personas.draftMutations.saveGeneratedDraft, {
        kind: "post",
        personaId,
        topicBriefId,
        title: parsed.title,
        summary: parsed.summary,
        body: parsed.body,
        category: parsed.category || context.category,
        researchSnippets: snippets,
      });

      const autoPublish = await ctx.runQuery(
        internal.forum.personas.generateContext.getPersonaAutoPublish,
        { personaId },
      );
      if (autoPublish.autoPublish) {
        await ctx.runMutation(internal.forum.personas.publishInternal.autoPublishDraftInternal, {
          draftId,
        });
      }

      return draftId;
    } catch (error) {
      await ctx.runMutation(internal.forum.personas.draftMutations.logAutomationRun, {
        runType: "generate_post_draft",
        personaId,
        topicBriefId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
});

export const generateCommentDraft = internalAction({
  args: {
    personaId: v.id("forumPersonas"),
    targetPostId: v.id("forumPosts"),
    scheduledPublishAt: v.optional(v.number()),
  },
  returns: v.union(v.id("forumContentDrafts"), v.null()),
  handler: async (ctx, { personaId, targetPostId, scheduledPublishAt }): Promise<Id<"forumContentDrafts"> | null> => {
    try {
      const context = await ctx.runQuery(
        internal.forum.personas.generateContext.getCommentGenerationContext,
        { personaId, targetPostId },
      );

      const systemPrompt = `You are ${context.persona.displayName}, commenting on a forum post.
Tone: ${context.skill.tone}
Style: ${context.skill.writingStyle}

${context.skill.commentPromptTemplate}

Return valid JSON only: {"body":"..."} — plain text or simple HTML, max 800 chars.`;

      const userPrompt = `Post title: ${context.postTitle}
Post summary: ${context.postSummary}
Post body excerpt: ${context.postBodyExcerpt}

Write one comment that fits this persona. Do not mention being AI.`;

      const raw = await callGlm(systemPrompt, userPrompt);
      const parsed = JSON.parse(raw) as GeneratedComment;

      const draftId = await ctx.runMutation(internal.forum.personas.draftMutations.saveGeneratedDraft, {
        kind: "comment",
        personaId,
        targetPostId,
        body: parsed.body,
        researchSnippets: [],
        scheduledPublishAt,
      });

      return draftId;
    } catch (error) {
      await ctx.runMutation(internal.forum.personas.draftMutations.logAutomationRun, {
        runType: "generate_comment_draft",
        personaId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
});
