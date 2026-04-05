# Convex production deployment

## Schema and functions

From the repo root, deploy **code + schema + indexes** to your **production** deployment (the CLI targets prod when you confirm; dev stays on `CONVEX_DEPLOYMENT` in `.env.local`):

```bash
pnpm exec convex deploy
```

When prompted *Do you want to push your code to your prod deployment … now?*, answer **`Y`**.

**Non-interactive / CI:** set a production **`CONVEX_DEPLOY_KEY`** in the environment, then `pnpm exec convex deploy` runs without prompts ([Convex docs — deploy](https://docs.convex.dev/cli#deploy-convex-functions-to-production)).

**Scheduled functions:** Deploying registers jobs from [`convex/crons.ts`](../convex/crons.ts) (e.g. periodic **`forum/feedCache:recomputeHotFeed`**). Confirm they appear under **Scheduled functions** in the Convex dashboard for prod. The **`forumFeedCache`** table stays empty until the first successful run (or until you add posts for the job to rank).

Production URL for this project (from README): `https://energetic-kangaroo-55.convex.cloud` — your published Next.js app must use **`NEXT_PUBLIC_CONVEX_URL`** pointing at **prod** `.convex.cloud`, not dev.

## User-only content (no demo seed)

The full forum seed (`pnpm convex:seed-forum` / force seed) inserts **posts, seed profiles, rich threads, hero, leaderboard, etc.** Use that on **dev** only.

On **production** you typically want:

- **No** full seed — the feed stays empty until real users sign up and publish.
- **Category taxonomy** must still exist: `createPost` validates `category` against **`forumCategories`**.

**Automatic bootstrap (recommended):** The forum app calls **`forum/mutations:ensureForumCategories`** from **`SharedDataProvider`** when **`listCategories`** returns an empty array, so the first production visit installs the same catalog as **`pnpm convex:prod:ensure-categories`** (idempotent). **`createPost`** also runs the same insert helper once if the chosen category row is still missing (e.g. race or non-browser client).

### Bootstrap categories only (idempotent, optional CLI / CI)

You can still run the internal mutation manually after deploy (safe to re-run; only inserts missing keys):

```bash
pnpm convex:prod:ensure-categories
```

This runs `forum/seed:ensureForumCategories` on **`--prod`**: same rows as [`convex/forum/seed/catalog.ts`](../convex/forum/seed/catalog.ts) when missing. It does **not** add posts, profiles, comments, or sidebar demo rows.

### Environment variables on prod

Set OAuth, `SITE_URL`, JWT keys, etc. on the **production** deployment ([`npx convex env set --prod …`](https://docs.convex.dev/cli)). See root [README.md](../README.md).

## What “no data” looks like

- **Feed:** empty until someone creates a post (expected).
- **Hero / vibing / leaderboard:** empty unless you add data via dashboard, a separate admin path, or (not recommended for user-only prod) a partial seed.

If the UI expects rows in those tables, either accept empty states or build admin tools later.
