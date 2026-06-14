"use node";

import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { searchWeb } from "./research";

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        url?: string;
        permalink?: string;
        subreddit?: string;
        score?: number;
        num_comments?: number;
        selftext?: string;
      };
    }>;
  };
};

async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT ?? "CreateconomyAdmin/1.0";

  if (!clientId || !clientSecret) {
    return null;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Reddit auth failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
}

async function fetchSubredditHot(
  token: string,
  subreddit: string,
  userAgent: string,
): Promise<Array<{ title: string; url: string; score: number; subreddit: string }>> {
  const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
  });

  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as RedditListing;
  return (json.data?.children ?? [])
    .map((child) => child.data)
    .filter(Boolean)
    .map((row) => ({
      title: row!.title ?? "",
      url: row!.url ?? `https://reddit.com${row!.permalink ?? ""}`,
      score: (row!.score ?? 0) + (row!.num_comments ?? 0) * 2,
      subreddit: row!.subreddit ?? subreddit,
    }))
    .filter((row) => row.title.length > 0);
}

function inferCategory(title: string, defaultCategories: string[]): string {
  const lower = title.toLowerCase();
  if (lower.includes("showcase") || lower.includes("built")) return "showcase";
  if (lower.includes("review")) return "review";
  if (lower.includes("help") || lower.includes("how")) return "qa";
  if (lower.includes("list") || lower.includes("top ")) return "list";
  return defaultCategories[0] ?? "news";
}

export const discoverTrendingTopics = internalAction({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number(), source: v.string() }),
  handler: async (ctx): Promise<{ inserted: number; skipped: number; source: string }> => {
    const config = await ctx.runQuery(internal.forum.personas.generateContext.getTrendingConfig, {});

    const userAgent = process.env.REDDIT_USER_AGENT ?? "CreateconomyAdmin/1.0";
    const token = await getRedditAccessToken();

    const candidates: Array<{
      title: string;
      keywords: string[];
      category: string;
      sourceUrls: string[];
      source: "reddit" | "tavily";
      score: number;
      sourceMeta: Record<string, unknown>;
      status: "suggested" | "open";
    }> = [];

    if (token) {
      for (const subreddit of config.watchedSubreddits.slice(0, 8)) {
        const posts = await fetchSubredditHot(token, subreddit, userAgent);
        for (const post of posts.slice(0, 5)) {
          const keywords = post.title
            .split(/\W+/)
            .filter((w) => w.length > 3)
            .slice(0, 6);
          candidates.push({
            title: post.title.slice(0, 200),
            keywords: [...new Set([...keywords, ...config.trendingKeywords.slice(0, 3)])],
            category: inferCategory(post.title, config.defaultCategories),
            sourceUrls: [post.url],
            source: "reddit",
            score: post.score,
            sourceMeta: { subreddit: post.subreddit },
            status: config.trendingAutoCreate ? "open" : "suggested",
          });
        }
      }
    }

    for (const keyword of config.trendingKeywords.slice(0, 5)) {
      const snippets = await searchWeb(`${keyword} AI creator economy news`);
      for (const snippet of snippets.slice(0, 2)) {
        candidates.push({
          title: snippet.title.slice(0, 200),
          keywords: [keyword, "AI", "creator"],
          category: inferCategory(snippet.title, config.defaultCategories),
          sourceUrls: snippet.url ? [snippet.url] : [],
          source: "tavily",
          score: 10,
          sourceMeta: { query: keyword },
          status: config.trendingAutoCreate ? "open" : "suggested",
        });
      }
    }

    candidates.sort((a, b) => b.score - a.score);
    const top = candidates.slice(0, 15);

    const result = await ctx.runMutation(internal.forum.personas.trendingInternal.insertSuggestedTopics, {
      topics: top,
    });

    await ctx.runMutation(internal.forum.personas.draftMutations.logAutomationRun, {
      runType: "discover_trending",
      success: true,
      metadata: { ...result, source: token ? "reddit+tavily" : "tavily" },
    });

    return { ...result, source: token ? "reddit+tavily" : "tavily" };
  },
});
