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

- Convex dashboard: Insights (documents read, bytes, subscriptions) on hot queries (`listFeedPage`, `searchPostsAndUsers`, `getDiscussionRouteState`, `getDiscussionSidebarData`).
- **Crons:** After changing [`convex/crons.ts`](../convex/crons.ts) or cron targets, run **`convex deploy`** (or `convex dev`) so schedules register; verify **Scheduled functions** in the Convex dashboard.
- Vercel: function concurrency, error rates; **Analytics / Speed Insights** (forum app) for RUM; **WAF / Firewall rules** for IP- or path-based throttling at the edge (recommended over any in-app in-memory limiter, which does not hold across serverless instances).
- Re-run k6/Artillery-style tests when changing feed size, sort logic, or auth paths.

## Frontend subscription discipline

- **`SharedDataProvider`** ([`apps/forum/src/providers/shared-data-context.tsx`](../apps/forum/src/providers/shared-data-context.tsx)) centralizes **`listCategories`** and **`getUnreadNotificationCount`** so multiple pages do not each open a duplicate Convex subscription for the same data.
- Route **`loading.tsx` / `error.tsx`** under `(app)` improve navigation UX; discussion pages also have a route-level **`loading`** skeleton.
## Rate limiting (where it actually applies)

- **Convex mutations:** [`consumeWriteBucket`](../convex/forum/rateLimit.ts) enforces per-user caps for posts, upvotes, and favorites (`forumWriteBuckets`).
- **Reads / anonymous abuse:** There is **no** in-repo Next.js middleware IP limiter. Previous in-memory Edge middleware was removed because Vercel runs many isolated instances with cold starts, so process-local counters **do not** provide real distributed limits. For production IP or bot control, configure **Vercel WAF** / **Firewall** or integrate **Upstash Redis** (or similar) with `@upstash/ratelimit` in middleware or Route Handlers.

## Known tradeoffs

- **Hot / top** feed: `listFeedPage` still ranks via **`loadHotRankedPosts`** over a bounded recent window (`FEED_HOT_RANK_WINDOW` in `convex/forum/limits.ts`). A **`forumFeedCache`** table and **`recomputeHotFeed`** cron precompute ids for future use (`getCachedFeedPostIds`); wiring the live feed to read the cache is optional follow-up.
- **Search** uses Convex **full-text search indexes** on post title/body and profile name (bounded `take` per query), not a linear scan of all posts.
- **Related / trending** on rich threads are capped (`DISCUSSION_RELATED_CAP`, `DISCUSSION_TRENDING_CAP`) and loaded in a **separate** query (`getDiscussionSidebarData`) from the core discussion payload.
- **Notifications list** queries are bounded (e.g. recent slice with `by_profile_createdAt`); the nav badge can use **`getUnreadNotificationCount`** (counts unread within the same bounded window — not a global unread total if a user has more rows than the cap).
