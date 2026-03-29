# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

- This is a `pnpm` workspace monorepo.
- Workspace packages are app-only right now (`pnpm-workspace.yaml` includes `apps/*`).
- Current apps:
  - `apps/forum` — primary Next.js app with full feature surface. Production: https://discuss.createconomy.com/feed.
  - `apps/seller` — placeholder Next.js app.
  - `apps/admin` — placeholder Next.js app.
  - `apps/marketplace` — placeholder Next.js app.

## Common commands

Run from repository root.

### Install

```bash
pnpm install
```

### Default app (forum)

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm typecheck
```

### Seller app

```bash
pnpm dev:seller
pnpm build:seller
pnpm lint:seller
pnpm typecheck:seller
```

### Admin app

```bash
pnpm dev:admin
pnpm build:admin
pnpm lint:admin
pnpm typecheck:admin
```

### Marketplace app

```bash
pnpm dev:marketplace
pnpm build:marketplace
pnpm lint:marketplace
pnpm typecheck:marketplace
```

### Direct workspace targeting

Use this when running commands directly against one app package.

```bash
pnpm --filter ./apps/forum <command>
pnpm --filter @cemvp/seller <command>
pnpm --filter @cemvp/admin <command>
pnpm --filter @cemvp/marketplace <command>
```

### Tests

- There is currently no test script configured at the root or app package level.
- There is no single-test command available yet in this repo.

## Architecture (big picture)

### 1) Monorepo structure and deployment model

- Each app is independently deployable (Vercel root-directory model).
- No shared internal package has been extracted yet; duplicated design foundation is intentional at this stage to avoid premature abstraction.
- Vercel is expected to be configured per app with root directories:
  - `apps/forum`
  - `apps/seller`
  - `apps/admin`
  - `apps/marketplace`

### 2) Forum app layering (`apps/forum`)

Forum is the architectural reference for conventions used by placeholder apps.

- Global app layout (`src/app/layout.tsx`):
  - loads global CSS and local fonts,
  - wraps the tree with `ThemeProvider`, `ConvexProvider`, `AppAuthProvider` from `@cemvp/auth-ui`, and global `AuthModal`.
- Main application shell is applied through route grouping:
  - `src/app/(app)/layout.tsx` wraps grouped routes with `AppShell`.
  - `AppShell` (`src/components/layout/app-shell.tsx`) composes top navigation, sidebars, hero section, and mobile tab bar.
- Route pages (for example `src/app/(app)/feed/page.tsx`) are primarily composition + view-level sorting/filtering.

### 3) Data shape and mock-data flow in forum

- Forum currently relies on mock-backed content organized under `src/lib/mock-data/*`.
- Mock modules are re-exported via `src/lib/mock-data/index.ts`.
- Adapter layer (`src/lib/adapters/content.ts`) provides route-consumable view models and is the boundary between route/page components and raw mock data.
- Several route files include backend endpoint expectations in comments; preserve those as contract hints when integrating real APIs.

### 4) Design system conventions used across apps

- Global visual tokens and motion primitives live in `src/app/globals.css` (CSS custom properties for light/dark mode + shared utility classes such as `card-surface`, `canvas-dot-grid`).
- Reusable UI primitives are in `src/components/ui/*` (e.g., button, input, card, avatar).
- Utility class composition uses `cn` in `src/lib/utils.ts` (`clsx` + `tailwind-merge`).
- App-local placeholders (`seller`, `admin`, `marketplace`) should keep domain content in `src/app/page.tsx` and avoid coupling to forum domain widgets.

## Repository-specific workflow rules

- Maintain a root `CHANGELOG.md` in simplified format.
- Whenever code changes are made in this repository, update `CHANGELOG.md` in the same task with a short entry that summarizes:
  - what changed,
  - which apps/packages were affected,
  - any command/check results that matter.
- Keep changelog entries concise and chronological.


### Branching rule for new plans

- Whenever starting a new implementation plan (plan mode / non-trivial scoped task), create and switch to a dedicated branch before making code changes.
- Branch naming convention must use a 3-digit numeric prefix and kebab-case slug:
  - `<NNN>-<short-description>`
  - Example: `001-monorepo-4-apps`
- If a suitable feature branch already exists for the active plan, continue on it instead of creating another.
- Keep `main` clean; do not implement planned work directly on `main`.

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
