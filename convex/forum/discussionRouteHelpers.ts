import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { DISCUSSION_RELATED_CAP, DISCUSSION_TRENDING_CAP } from "./limits";
import { profileToUser } from "./helpers";

export type RichThreadPayload = Record<string, unknown>;

export async function hydrateRelatedThreads(
  ctx: QueryCtx,
  slugs: string[],
  cap: number,
): Promise<
  {
    slug: string;
    title: string;
    authorId: string;
    engagement: number;
  }[]
> {
  const out: {
    slug: string;
    title: string;
    authorId: string;
    engagement: number;
  }[] = [];
  const slice = slugs.slice(0, cap);
  for (const s of slice) {
    const rrow = await ctx.db
      .query("forumRichThreads")
      .withIndex("by_slug", (q) => q.eq("slug", s))
      .unique();
    if (rrow?.payload && typeof rrow.payload === "object") {
      const p = rrow.payload as {
        slug: string;
        title: string;
        authorId: string;
        upvotes: number;
        comments: unknown[];
      };
      out.push({
        slug: p.slug,
        title: p.title,
        authorId: p.authorId,
        engagement: p.upvotes + (Array.isArray(p.comments) ? p.comments.length * 2 : 0),
      });
    }
  }
  return out;
}

export async function loadProfilesForIds(
  ctx: QueryCtx,
  userIds: Set<string>,
): Promise<ReturnType<typeof profileToUser>[]> {
  const users = [];
  for (const id of userIds) {
    const doc = await ctx.db.get(id as Id<"forumProfiles">);
    if (doc) {
      users.push(profileToUser(doc));
    }
  }
  return users;
}

export function cappedRelatedSlugs(thread: RichThreadPayload): string[] {
  const relatedSlugs = (thread.relatedSlugs as string[] | undefined) ?? [];
  return relatedSlugs.slice(0, DISCUSSION_RELATED_CAP);
}

export function cappedTrendingSlugs(thread: RichThreadPayload): string[] {
  const trendingSlugs = (thread.trendingSlugs as string[] | undefined) ?? [];
  return trendingSlugs.slice(0, DISCUSSION_TRENDING_CAP);
}
