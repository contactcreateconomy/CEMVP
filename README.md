# CEMVP Monorepo

This repository is a pnpm workspace monorepo.

## Documentation (`docs/`)

- **[docs/README.md](docs/README.md)** — index of overview, architecture (stack + versions), quick start, forum schema reference, and capacity/seed docs (for contributors and AI agents).
- **[docs/architecture.md](docs/architecture.md)** — architecture, software stack, and declared dependency versions.
- **[CLAUDE.md](CLAUDE.md)** — links the same docs in a table for Claude Code.

## Workspace layout

- `apps/forum` — Next.js forum app (migrated from `CEfrontend` with behavior-preserving structure)
- `apps/seller` — Next.js seller placeholder app
- `apps/admin` — Next.js admin placeholder app
- `apps/marketplace` — Next.js marketplace placeholder app

## Prerequisites

- Node.js `20` (see `.nvmrc`)
- pnpm

## Install

From repository root:

```bash
pnpm install
```

## Environment (Convex client URL)

Each Next.js app reads **`NEXT_PUBLIC_CONVEX_URL`** from its own package root. Copy the matching **`apps/<app>/.env.example`** to **`apps/<app>/.env.local`** (forum, seller, admin, marketplace). The root [`.env.example`](.env.example) is an index; **Google/GitHub/Facebook IDs and secrets** are listed in [`convex/.env.example`](convex/.env.example) and must be set on the **Convex** deployment (`npx convex env set` or Dashboard), not in Next.js.

Set the same variable in **each Vercel project** (Environment Variables) for deployed apps.

**Production forum** (live app): [https://discuss.createconomy.com/feed](https://discuss.createconomy.com/feed). For Convex Auth on that deployment, set **`SITE_URL`** to the site origin **`https://discuss.createconomy.com`** (OAuth redirects use the origin; `/feed` is the main forum route).

## Convex Auth (password + OAuth)

Configure on your **Convex deployment** (Dashboard → Environment variables, or `npx convex env set`):

| Variable | Purpose |
|----------|--------|
| `SITE_URL` | Primary app origin for OAuth return redirects when no `redirectTo` is used (e.g. `http://localhost:3000` for forum dev, or `https://discuss.createconomy.com` for production forum; see link above). |
| `AUTH_REDIRECT_ORIGINS` | Optional comma-separated extra **origins** (full URLs, e.g. `https://seller.example.com,https://admin.example.com`) allowed as OAuth `redirectTo` targets. The shared [`AppAuthProvider`](packages/auth-ui/src/app-auth-provider.tsx) already sends `window.location.href` for social login; without this variable, only `SITE_URL` and relative paths are accepted ([Convex Auth `callbacks.redirect`](https://labs.convex.dev/auth/api_reference/server#callbacksredirect)). |
| `JWT_PRIVATE_KEY`, `JWKS` | Required by Convex Auth ([manual setup](https://labs.convex.dev/auth/setup/manual)). Generate locally with `pnpm convex:gen-jwt` (updates `convex/.env.local`); set on Convex with `pnpm exec convex env set JWT_PRIVATE_KEY --from-file …` (see script output — PEM can break plain `env set` argv). |
| `CONVEX_SITE_URL` | JWT issuer domain; usually present on hosted deployments ([`convex/auth.config.ts`](convex/auth.config.ts)). |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | GitHub OAuth ([docs](https://labs.convex.dev/auth/config/oauth/github)). |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth ([docs](https://labs.convex.dev/auth/config/oauth/google)). |
| `AUTH_FACEBOOK_ID`, `AUTH_FACEBOOK_SECRET` | Facebook / Meta OAuth (Auth.js provider). |
| `ADMIN_EMAILS` | Optional comma-separated emails → `admin` membership on first sign-up ([`convex/auth.ts`](convex/auth.ts)). |

OAuth **callback** URLs use your deployment’s **HTTP Actions** host (`.convex.site`, not `.cloud`). Add **every** Convex deployment you use to your OAuth provider (GitHub allows multiple callback URLs).

| Deployment | `.convex.cloud` (client / `NEXT_PUBLIC_CONVEX_URL`) | `.convex.site` (OAuth callbacks) |
|------------|-----------------------------------------------------|-----------------------------------|
| Dev (`watchful-chameleon-570`) | `https://watchful-chameleon-570.convex.cloud` | `https://watchful-chameleon-570.convex.site` |
| Prod (`energetic-kangaroo-55`) | `https://energetic-kangaroo-55.convex.cloud` | `https://energetic-kangaroo-55.convex.site` |

Example GitHub callbacks (repeat for Google/Facebook as needed):

- `https://watchful-chameleon-570.convex.site/api/auth/callback/github`
- `https://energetic-kangaroo-55.convex.site/api/auth/callback/github`

### Production: Convex CLI vs MCP

- **Convex production env vars** are not writable via the default Convex MCP connection (production is read-only). Use **`pnpm exec convex env set --prod …`** or the Convex Dashboard.
- **Vercel env vars** are not exposed by the Vercel MCP tools in this repo; use **`vercel env add`** (see below) or the Vercel Dashboard.

### Vercel project `cemvp-forum` (production)

From `apps/forum` after `vercel link` (team **createconomy**):

```bash
pnpm dlx vercel@latest env add NEXT_PUBLIC_CONVEX_URL production --value "https://energetic-kangaroo-55.convex.cloud" --yes --force
```

Redeploy the production deployment after changing env vars so the build picks them up.

**Vercel / production builds:** Next.js 16 defaults to **Turbopack** for `next build`, which does not apply the same `convex` dedupe as webpack and can fail prerender with **`Could not find ConvexProviderWithAuth`**. Forum (and other apps using `@cemvp/auth-ui`) use **`next build --webpack`** in `package.json` so production matches local auth.

**Preview environment:** Set **`NEXT_PUBLIC_CONVEX_URL`** for Preview as well as Production (often the dev Convex URL for previews). If the third argument to `vercel env add` fails for “branch”, pass an empty string to apply to all preview branches:

```bash
pnpm dlx vercel@latest env add NEXT_PUBLIC_CONVEX_URL preview '' --value "https://<your-dev-deployment>.convex.cloud" --yes --force
```

**CLI deploy from monorepo root:** If the Vercel project’s Root Directory is **`apps/forum`**, run `vercel` / `vercel deploy` from the **repository root** with a linked **`.vercel/project.json`** at the root that matches that project (so the CLI does not double-resolve `apps/forum`).

### Forum app (recent hardening)

- **Shared Convex subscriptions:** [`SharedDataProvider`](apps/forum/src/providers/shared-data-context.tsx) loads **`listCategories`** and **`getUnreadNotificationCount`** once per session; pages use **`useSharedData()`** instead of duplicating **`listCategories`**.
- **Rate limiting:** Writes are capped in Convex via **`forumWriteBuckets`** ([`convex/forum/rateLimit.ts`](convex/forum/rateLimit.ts)). **IP / edge request** limits are not implemented in-app: in-memory middleware would reset per instance and cold start (false security). Use **Vercel WAF**, **Firewall**, or a **shared store** (e.g. Upstash Redis + `@upstash/ratelimit`) if you need distributed IP throttling.
- **Observability:** **`@vercel/analytics`** and **`@vercel/speed-insights`** in root layout (no extra env vars for basic usage).
- **Convex crons:** [`convex/crons.ts`](convex/crons.ts) registers scheduled jobs (e.g. feed cache recompute); deploy Convex after changing crons.

Details: [docs/architecture.md](docs/architecture.md), [docs/schema-forum.md](docs/schema-forum.md), [docs/forum-capacity.md](docs/forum-capacity.md).

## Run apps

From repository root:

```bash
# Default app (forum)
pnpm dev

# Additional apps
pnpm dev:seller
pnpm dev:admin
pnpm dev:marketplace
```

Equivalent direct app commands:

```bash
pnpm --filter ./apps/forum dev
pnpm --filter @cemvp/seller dev
pnpm --filter @cemvp/admin dev
pnpm --filter @cemvp/marketplace dev
```

## Build / lint / typecheck

From repository root:

```bash
# Default app (forum)
pnpm build
pnpm lint
pnpm typecheck

# Seller
pnpm build:seller
pnpm lint:seller
pnpm typecheck:seller

# Admin
pnpm build:admin
pnpm lint:admin
pnpm typecheck:admin

# Marketplace
pnpm build:marketplace
pnpm lint:marketplace
pnpm typecheck:marketplace
```

## Vercel deployment (monorepo)

Create one Vercel project per app and map each to its root directory:

- Forum project
  - Root Directory: `apps/forum`
- Seller project
  - Root Directory: `apps/seller`
- Admin project
  - Root Directory: `apps/admin`
- Marketplace project
  - Root Directory: `apps/marketplace`

For each project use:

- Framework preset: `Next.js`
- Install Command: `pnpm install`
- Build Command: `pnpm build` (when Root Directory is set to the target app)

No repo-level `vercel.json` is required for this setup.
