# CEMVP Monorepo

This repository is a pnpm workspace monorepo.

## Workspace layout

- `apps/forum` — Next.js forum app (migrated from `CEfrontend` with behavior-preserving structure)

## Prerequisites

- Node.js `20` (see `.nvmrc`)
- pnpm

## Install

From repository root:

```bash
pnpm install
```

## Run the forum app

From repository root:

```bash
pnpm dev
```

Equivalent direct app command:

```bash
pnpm --filter ./apps/forum dev
```

## Build / lint / typecheck

From repository root:

```bash
pnpm build
pnpm lint
pnpm typecheck
```

## Vercel deployment (monorepo)

Configure the Vercel project with:

- Framework preset: `Next.js`
- Root Directory: `apps/forum`
- Install Command: `pnpm install`
- Build Command: `pnpm --filter ./apps/forum build` (or `pnpm build` when project root is `apps/forum`)

No repo-level `vercel.json` is required for this setup.
