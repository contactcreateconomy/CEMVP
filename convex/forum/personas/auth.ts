import { getAuthUserId } from "@convex-dev/auth/server";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export async function requirePersonaAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<{ userId: Id<"users">; profileId: Id<"forumProfiles"> | null }> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Sign in required.");
  }

  const adminMembership = await ctx.db
    .query("memberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("app"), "admin"))
    .first();

  const profile = await ctx.db
    .query("forumProfiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();

  const isForumAdmin = profile?.role === "admin" || profile?.role === "moderator";
  if (!adminMembership && !isForumAdmin) {
    throw new Error("Admin access required.");
  }

  return { userId, profileId: profile?._id ?? null };
}

export function utcDayKey(timestampMs: number = Date.now()): string {
  return new Date(timestampMs).toISOString().slice(0, 10);
}
