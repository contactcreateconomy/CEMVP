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
- After auth + admin role: **`/dashboard`**, **`/personas`**, **`/skills`**, **`/topics`**, **`/queue`**, **`/runs`**

Sign in with an account in `ADMIN_EMAILS` (Convex env) or a forum profile with `admin`/`moderator` role. For Google OAuth on Vercel, add the deployed admin origin to Convex **`AUTH_REDIRECT_ORIGINS`**.

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
