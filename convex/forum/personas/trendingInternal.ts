import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const insertSuggestedTopics = internalMutation({
  args: {
    topics: v.array(
      v.object({
        title: v.string(),
        keywords: v.array(v.string()),
        category: v.string(),
        sourceUrls: v.array(v.string()),
        source: v.union(v.literal("reddit"), v.literal("tavily")),
        score: v.number(),
        sourceMeta: v.optional(v.any()),
        status: v.union(v.literal("suggested"), v.literal("open")),
      }),
    ),
  },
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx, { topics }) => {
    const existing = await ctx.db.query("forumTopicBriefs").collect();
    const existingTitles = new Set(existing.map((t) => normalizeTitle(t.title)));

    let inserted = 0;
    let skipped = 0;
    const now = Date.now();

    for (const topic of topics) {
      const normalized = normalizeTitle(topic.title);
      if (!normalized || existingTitles.has(normalized)) {
        skipped += 1;
        continue;
      }

      await ctx.db.insert("forumTopicBriefs", {
        title: topic.title.trim(),
        keywords: topic.keywords,
        category: topic.category,
        sourceUrls: topic.sourceUrls,
        status: topic.status,
        source: topic.source,
        score: topic.score,
        sourceMeta: topic.sourceMeta,
        createdAt: now,
      });
      existingTitles.add(normalized);
      inserted += 1;
    }

    return { inserted, skipped };
  },
});
