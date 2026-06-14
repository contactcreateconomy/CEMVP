import type { QueryCtx } from "../../_generated/server";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function isDuplicatePostTitle(
  ctx: QueryCtx,
  title: string,
  lookbackMs: number = 7 * 24 * 60 * 60 * 1000,
): Promise<boolean> {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;

  const cutoff = Date.now() - lookbackMs;
  const recent = await ctx.db
    .query("forumPosts")
    .withIndex("by_createdAt")
    .order("desc")
    .take(200);

  return recent.some((post) => {
    if (post.createdAt < cutoff) return false;
    return normalizeTitle(post.title) === normalized;
  });
}

export async function isDuplicateDraftTitle(
  ctx: QueryCtx,
  title: string,
): Promise<boolean> {
  const normalized = normalizeTitle(title);
  if (!normalized) return false;

  const drafts = await ctx.db
    .query("forumContentDrafts")
    .withIndex("by_status", (q) => q.eq("status", "pending"))
    .collect();

  return drafts.some((d) => d.title && normalizeTitle(d.title) === normalized);
}
