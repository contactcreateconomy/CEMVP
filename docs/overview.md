# Repository overview

## What this is

**CEMVP** is a **pnpm workspace monorepo** of Next.js apps sharing a **Convex** backend (database + server functions + Convex Auth). The **forum** app is the primary, production-ready surface; other apps are placeholders for future domains.

## Apps (`apps/*`)

| App | Role |
|-----|------|
| `apps/forum` | Main product: feed, discussions, search, profiles, settings, Convex-backed data. |
| `apps/seller`, `apps/admin`, `apps/marketplace` | Scaffolds; not the data focus of this repo today. |

Each app can be deployed separately (e.g. Vercel with per-app root directory). Shared UI/auth lives in workspace packages such as `@cemvp/auth-ui` and `@cemvp/convex-client`.

## Backend (`convex/`)

- **Schema:** [`convex/schema.ts`](../convex/schema.ts) — Convex Auth tables (`users`, sessions, etc.), `memberships`, and all **`forum*`** tables.
- **Forum API:** [`convex/forum/`](../convex/forum/) — `queries.ts`, `mutations.ts`, `discussionRoute.ts`, `feedCache.ts`, `seed.ts`, helpers, limits. **Crons:** [`convex/crons.ts`](../convex/crons.ts).
- **Auth:** [`convex/auth.ts`](../convex/auth.ts) — providers, `afterUserCreatedOrUpdated` (creates `forumProfiles` + memberships for new users).

The forum **UI** uses `useQuery` / `useMutation` from `convex/react` against `api.forum.*` (see [`apps/forum/src/lib/convex.ts`](../apps/forum/src/lib/convex.ts)). Shared reference data (categories, unread notification count) is loaded once via **`SharedDataProvider`** / **`useSharedData()`** to avoid duplicate subscriptions across routes (see [`apps/forum/src/providers/shared-data-context.tsx`](../apps/forum/src/providers/shared-data-context.tsx)).

## Data model (conceptual)

- **`users`** (Convex Auth) — real accounts.
- **`forumProfiles`** — display identity for the forum; optional `userId` link for real users, or seed-only rows (`seedKey`) for demo content.
- **`forumPosts`** / **`forumPostComments`** / **`forumRichThreads`** — feed and discussion content.
- **`forumFavorites`** / **`forumUpvotes`** — keyed by **`users`**, not profiles; empty after seed until users interact.

Details and indexes: [schema-forum.md](schema-forum.md).

## Where to go next

- Stack and versions: [architecture.md](architecture.md)
- Run locally: [quick-start.md](quick-start.md)
- Table/index reference: [schema-forum.md](schema-forum.md)
- Reset dev data / scaling notes: [forum-capacity.md](forum-capacity.md)
