# Quick start

Minimal path from clone to a working forum against **dev** Convex.

## Prerequisites

- **Node.js** — see [`.nvmrc`](../.nvmrc) (e.g. 20.x).
- **pnpm** — repo uses `pnpm@10` (see [`package.json`](../package.json) `packageManager`).
- **Convex account** — project linked (`.env.local` or deploy key under `convex/`).

## 1. Install

```bash
pnpm install
```

## 2. Environment

### Forum app (Next.js)

From repo root:

```bash
cp apps/forum/.env.example apps/forum/.env.local
```

Set **`NEXT_PUBLIC_CONVEX_URL`** to your Convex deployment URL (`.convex.cloud`), same as in the Convex dashboard.

### Convex (server secrets)

OAuth, JWT, `SITE_URL`, etc. live on the **Convex** deployment, not only in Next.js. See [README.md § Environment](../README.md) and [`convex/.env.example`](../convex/.env.example).

## 3. Push Convex functions (if schema/code changed)

```bash
pnpm exec convex dev --once
# or keep watcher: pnpm convex:dev
```

**Scheduled functions:** If you change [`convex/crons.ts`](../convex/crons.ts), deploy or run dev sync so crons register on the target deployment (see [forum-capacity.md](forum-capacity.md)).

## 4. Seed forum data (first time or after schema change)

Idempotent (skips if categories already exist):

```bash
pnpm convex:seed-forum
```

**Wipe and re-seed dev** (destructive — see [forum-capacity.md](forum-capacity.md)):

```bash
pnpm exec convex env set ALLOW_FORUM_SEED_FORCE true
pnpm convex:seed-forum-force
pnpm exec convex env remove ALLOW_FORUM_SEED_FORCE
```

## 5. Run the forum app

```bash
pnpm dev
```

Open the URL Next prints (usually `http://localhost:3000`). Feed and related routes need Convex configured + seed data.

## Common root scripts

| Script | Use |
|--------|-----|
| `pnpm dev` | Forum Next.js dev server |
| `pnpm typecheck` | Forum TypeScript |
| `pnpm lint` | Forum ESLint |
| `pnpm convex:dev` | Convex dev sync |
| `pnpm convex:codegen` | Regenerate `convex/_generated` |
| `pnpm convex:seed-forum` | Seed if empty |
| `pnpm convex:seed-forum-force` | Force re-seed (requires `ALLOW_FORUM_SEED_FORCE` on deployment) |

## Production Convex

Deploy schema/functions and bootstrap **category keys only** (no demo posts): [production-convex.md](production-convex.md).

## Troubleshooting (short)

- **Empty feed / errors** — Check `NEXT_PUBLIC_CONVEX_URL`, run `pnpm convex:seed-forum`, confirm `pnpm exec convex dev --once` succeeded.
- **Vercel build: `Could not find Convex client` / `useQuery` without provider** — Ensure **`NEXT_PUBLIC_CONVEX_URL`** is set for **Preview** and **Production** on the Vercel project; client components must not call **`useQuery`** when Convex is unconfigured (use **`isConvexConfigured()`** guards). See [README.md § Forum app (recent hardening)](../README.md).
- **OAuth redirects** — `SITE_URL` and provider callback URLs must match Convex `.convex.site` host; see [README.md](../README.md).
- **Type errors after schema change** — `pnpm exec convex codegen` from repo root.
