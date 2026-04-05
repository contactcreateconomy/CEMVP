import type { MutationCtx } from "../../_generated/server";

import { categoryRows } from "./catalog";

/** Idempotent: inserts any catalog category row missing from `forumCategories`. */
export async function insertMissingForumCategories(
  ctx: MutationCtx,
): Promise<{ inserted: number; skipped: number }> {
  let inserted = 0;
  let skipped = 0;
  for (const c of categoryRows) {
    const existing = await ctx.db
      .query("forumCategories")
      .withIndex("by_key", (q) => q.eq("key", c.key))
      .unique();
    if (existing) {
      skipped++;
      continue;
    }
    await ctx.db.insert("forumCategories", { ...c });
    inserted++;
  }
  return { inserted, skipped };
}
