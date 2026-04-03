# Convex schema — forum and auth (reference)

**Source of truth:** [`convex/schema.ts`](../convex/schema.ts). This doc is for navigation and agent context; if it disagrees with `schema.ts`, trust the code.

## Auth and identity (non-forum-specific)

| Table | Role |
|-------|------|
| `users` | Convex Auth user; `handle`, `email`, `image`, etc. Indexes: `email`, `phone`, `by_handle`. |
| `memberships` | App + role per user (`forum`, `seller`, `admin`, `marketplace`). Indexes: `by_user`, `by_app`, `by_app_role`. |

Imported via `authTables` from `@convex-dev/auth/server`.

## Forum — profiles and taxonomy

| Table | Key fields | Indexes |
|-------|------------|---------|
| `forumProfiles` | `userId?`, `seedKey?`, `handle`, `name`, `image`, `bio`, `level`, `points`, `streakDays`, `role` | `by_handle`, `by_user`, `by_seed_key`, **`search_name`** (full-text on `name`) |
| `forumCategories` | `key`, `name`, `icon`, `description`, `primaryColor`, `lockedByDefault`, `pointsToUnlock?` | `by_key` |

**Real users** get a `forumProfiles` row from [`convex/auth.ts`](../convex/auth.ts) on signup. **Seed** inserts profiles with `seedKey` only (no `userId`). [`ensureForumProfile`](../convex/forum/mutations.ts) backfills missing profiles for logged-in users. The client’s [`ForumProfileEnsurer`](../apps/forum/src/providers/forum-profile-ensurer.tsx) calls **`hasViewerProfile`** first and only runs the mutation when no profile exists (avoids redundant writes for normal signups).

## Forum — posts and threads

| Table | Key fields | Indexes |
|-------|------------|---------|
| `forumPosts` | `slug`, `title`, `summary`, `body`, `category`, `authorProfileId`, optional **`authorName` / `authorHandle` / `authorImage`** (denormalized for feed), counters, `createdAt`, `trending`, `locked`, `isRichThread`, `legacyKey?` | `by_slug`, `by_category`, `by_author`, `by_legacy_key`, **`by_createdAt`**, **`by_category_createdAt`**, **`search_title`**, **`search_body`** (full-text; filter field `category`) |
| `forumRichThreads` | `slug`, `payload` (JSON blob for MVP rich threads) | `by_slug` |
| `forumPostComments` | `postId`, `authorProfileId`, `body`, `createdAt`, `upvotes` | `by_post`, **`by_post_createdAt`** |

**Routing:** [`convex/forum/discussionRoute.ts`](../convex/forum/discussionRoute.ts) resolves `/discussions/[slug]` (rich thread vs simple post vs redirect).

## Forum — viewer-specific (requires `users` id)

| Table | Key fields | Indexes |
|-------|------------|---------|
| `forumFavorites` | `userId`, `postId`, `favoritedAt?` | `by_user`, `by_user_post`, **`by_user_favoritedAt`** |
| `forumUpvotes` | `userId`, `postId` | `by_user`, `by_user_post` |
| `forumUserSettings` | `userId`, theme, notification flags | `by_user` |
| `forumWriteBuckets` | `userId`, `kind` (rate limit), `count`, `windowStartMs` | `by_user_kind` |

Seed **clears** favorites/upvotes/settings/buckets on force re-seed but does **not** insert favorites/upvotes (no synthetic `users` rows).

## Forum — auxiliary content

| Table | Role |
|-------|------|
| `forumCampaigns` | Campaign cards; index **`by_endsAt`** |
| `forumLeaderboard` | Ranked rows → `forumProfiles`; index **`by_rank`** |
| `forumNotifications` | In-app notifications → `forumProfiles`; indexes **`by_profile`**, **`by_profile_createdAt`** (time-ordered, bounded reads) |
| `forumVibingItems` | Sidebar “vibing” links (`sortOrder`) |
| `forumHeroSlides` | Hero carousel; joins posts via `legacyPostKey` → `forumPosts.legacyKey`; index **`by_sort`** |
| **`forumFeedCache`** | Precomputed ranked post id lists for scheduled jobs; **`cacheKey`**, **`postIds`**, **`computedAt`**; index **`by_key`**. Populated by cron; query **`getCachedFeedPostIds`** exists for future feed wiring. |

## API layout (forum)

| Area | File |
|------|------|
| Queries (feed pages, search, profiles, hero, …) | [`convex/forum/queries.ts`](../convex/forum/queries.ts) — includes **`getUnreadNotificationCount`**, **`hasViewerProfile`**; **search** uses **`withSearchIndex`** on posts/profiles |
| Mutations (posts, votes, favorites, settings, …) | [`convex/forum/mutations.ts`](../convex/forum/mutations.ts) |
| Discussion route | [`convex/forum/discussionRoute.ts`](../convex/forum/discussionRoute.ts) — **`getDiscussionRouteState`** (core thread/author/categories) + **`getDiscussionSidebarData`** (related/trending + sidebar users) |
| Feed cache (cron target) | [`convex/forum/feedCache.ts`](../convex/forum/feedCache.ts) — internal **`recomputeHotFeed`**, query **`getCachedFeedPostIds`** |
| Crons | [`convex/crons.ts`](../convex/crons.ts) |
| Seed | [`convex/forum/seed.ts`](../convex/forum/seed.ts) (internal mutation `runForumSeed`) |
| Limits / caps | [`convex/forum/limits.ts`](../convex/forum/limits.ts) |
| Feed query helpers | [`convex/forum/feedQueries.ts`](../convex/forum/feedQueries.ts) |
| Discussion helpers | [`convex/forum/discussionRouteHelpers.ts`](../convex/forum/discussionRouteHelpers.ts) |

Frontend API re-export: [`apps/forum/src/lib/convex.ts`](../apps/forum/src/lib/convex.ts) (`api`, `Id`).

## Id conventions agents should respect

- **`Id<"users">`** — Convex Auth; required for favorites, upvotes, settings, write buckets.
- **`Id<"forumProfiles">`** — authors, leaderboard, notifications, comment authors.
- Do not assume every `forumProfiles` row has `userId` (seed data does not).
