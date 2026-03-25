# CEMVP Monorepo

This repository is a pnpm workspace monorepo.

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
