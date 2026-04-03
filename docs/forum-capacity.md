# Forum capacity (Convex + Vercel)

This app is shaped for **bounded reads** (pagination, capped scans, denormalized author fields on posts) and **subscription discipline** (fewer monolithic queries). **One million concurrent users** still requires **load testing** and **vendor capacity** (Convex enterprise, Vercel concurrency/WAF)—see the Cursor plan for Phase 0 gates.

## After a schema update (recommended: fresh seed)

For **dev / disposable data**, do not run a separate backfill. **Wipe forum tables and re-seed** so every row matches the new schema (indexes, `author*` on posts, `favoritedAt` on favorites, etc.).

1. Deploy or run `pnpm exec convex dev --once` so Convex accepts the new schema.
2. In the Convex dashboard, set **`ALLOW_FORUM_SEED_FORCE=true`** (temporary).
3. Run:

   ```bash
   pnpm convex:seed-forum-force
   ```

4. Remove **`ALLOW_FORUM_SEED_FORCE`** from the environment afterward.

The force seed deletes forum-related tables (including `forumUserSettings` and `forumWriteBuckets` for a clean dev reset) and inserts catalog data again with the current shape. **This destroys existing forum posts, comments, favorites, seed profiles, and per-user forum settings in that deployment**—only appropriate when you are fine resetting dev data.

`forumFavorites` and `forumUpvotes` are cleared and left empty: they require real Convex Auth `users` ids, so they fill in when people sign in and interact.

## Seeding (non-destructive)

- First-time or idempotent check: `pnpm convex:seed-forum` (no-op if categories already exist).

## Operations checklist

- Convex dashboard: Insights (documents read, bytes, subscriptions) on hot queries (`listFeedPage`, `searchPostsAndUsers`, `getDiscussionRouteState`).
- Vercel: function concurrency, error rates, static asset caching.
- Re-run k6/Artillery-style tests when changing feed size, sort logic, or auth paths.

## Known tradeoffs

- **Hot / top** sorts use a bounded recent window (`FEED_HOT_RANK_WINDOW` in `convex/forum/limits.ts`), not a global rank index.
- **Search** scans at most `SEARCH_MAX_POSTS_SCAN` recent posts and a capped set of profiles.
- **Related / trending** on rich threads are capped (`DISCUSSION_RELATED_CAP`, `DISCUSSION_TRENDING_CAP`).
