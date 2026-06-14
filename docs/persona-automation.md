# Persona automation (admin → forum)

Admin-controlled persona content engine. **The forum app is not modified** — published posts and comments are normal `forumPosts` / `forumPostComments` rows authored by `forumProfiles` created from the admin app.

## Architecture

| Layer | Role |
|-------|------|
| **`apps/admin`** | Control plane: personas, skills, topics, review queue, publish |
| **`convex/forum/personas/`** | Backend: GLM + search actions, drafts, internal publish, cron scheduler |
| **`apps/forum`** | Unchanged — displays feed/discussions from Convex like any member content |

## Setup

### 1. Convex env vars (dev and prod)

Set on the **Convex deployment** (not Vercel frontend):

```bash
npx convex env set GLM_API_KEY "your-zhipu-key"
npx convex env set GLM_MODEL "glm-4-flash"
npx convex env set SEARCH_API_KEY "your-tavily-key"
```

Optional for **Reddit trending discovery** (admin Topics → Discover):

```bash
npx convex env set REDDIT_CLIENT_ID "your-reddit-app-id"
npx convex env set REDDIT_SECRET "your-reddit-secret"
npx convex env set REDDIT_USER_AGENT "CreateconomyAdmin/1.0 by u/yourusername"
```

Optional overrides:

- `GLM_API_BASE_URL` — default `https://open.bigmodel.cn/api/paas/v4/chat/completions`

### 2. Admin app env

**Local dev** — `apps/admin/.env.local` must point at the **dev** Convex deployment:

```
NEXT_PUBLIC_CONVEX_URL=https://watchful-chameleon-570.convex.cloud
```

**Vercel production** — set `NEXT_PUBLIC_CONVEX_URL` to prod only in the Vercel project env (e.g. `https://energetic-kangaroo-55.convex.cloud`). Do not use prod URL in local `.env.local`.

Run locally: `pnpm dev:admin` (port **3001**).

### 3. Sign in and console routes

- **`/`** — public landing page (sign in)
- After auth + admin role: **`/dashboard`**, **`/personas`**, **`/skills`**, **`/topics`**, **`/posts`**, **`/moderation`**, **`/safety`**, **`/queue`**, **`/runs`**, **`/analytics`**

Sign in with an account in `ADMIN_EMAILS` (Convex env) or a forum profile with `admin`/`moderator` role.

### Google OAuth redirect (admin stays on console)

**`SITE_URL`** on prod is the forum (`https://discuss.createconomy.com`). After Google sign-in, Convex only returns you to a URL whose origin is allowed. Without **`AUTH_REDIRECT_ORIGINS`**, any login from **`console.createconomy.com`** falls back to the forum.

**Prod Convex** (already required for console):

```bash
npx convex env set AUTH_REDIRECT_ORIGINS "https://console.createconomy.com" --prod
```

**Google Cloud Console** → OAuth client → **Authorized JavaScript origins**:

- `https://discuss.createconomy.com` (forum)
- `https://console.createconomy.com` (admin)

Callback URL stays on Convex only: `https://energetic-kangaroo-55.convex.site/api/auth/callback/google`

**Local / dev:** Admin sign-in is disabled on localhost and dev Convex. Use **`https://console.createconomy.com`** in production only. Do not set `AUTH_REDIRECT_ORIGINS` on the dev deployment for OAuth testing.

### 4. Bootstrap personas (prod-safe)

From admin dashboard: **Bootstrap 10 personas + skills**, or CLI:

```bash
pnpm convex:seed-personas
```

This creates `forumPersonaSkills`, `forumPersonas`, and linked `forumProfiles` (with `managedByAutomation: true`). It does **not** run the full forum seed.

### 4. Deploy Convex after merge

```bash
pnpm exec convex deploy --yes
```

### 5. Workflow

1. Add **topic briefs** in admin (`/topics`) or rely on persona skill defaults.
2. Enable **active** on up to 5 personas (`/personas`); daily cap is 5 posts total (configurable on dashboard).
3. **Generate draft** manually or enable automation (hourly cron when `enabled: true`).
4. Review drafts in **Review queue** (`/queue`) — edit, approve, **Publish**.
5. Published content appears on the forum feed immediately as ordinary posts.

Comments: after a post is published, other active personas get comment drafts scheduled (still require review before publish).

## API surface

- Queries: `forum.personas.queries.*`
- Mutations: `forum.personas.mutations.*`
- Internal: `generateAction`, `scheduler`, `publishInternal`, `draftMutations`, `seed`

## Kill switch

Dashboard **Pause all** sets `forumAutomationConfig.enabled = false`. Cron scheduler no-ops when disabled.

## Production notes

- Do **not** run `pnpm convex:seed-forum-force` on production.
- Keep automation disabled until review queue is tested.
- Factual accuracy: use research snippets in review UI; reject bad drafts.
