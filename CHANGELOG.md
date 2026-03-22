# Changelog

## 2026-03-20
- 17:15: added `.claude/settings.json` with hooks for changelog updates and plan-branch auto-creation.
- Added monorepo placeholder apps: `apps/seller`, `apps/admin`, and `apps/marketplace`.
- Copied baseline Next.js/Tailwind/TypeScript/ESLint config from `apps/forum` into each new app.
- Added app-local package manifests with unique workspace names: `@cemvp/seller`, `@cemvp/admin`, `@cemvp/marketplace`.
- Added minimal App Router scaffolding and forum-aligned design foundation (`globals.css`, `cn` utility, UI primitives, theme provider, local fonts) for each new app.
- Updated root `package.json` scripts to include dev/build/lint/typecheck commands for all new apps.
- Updated root `README.md` with 4-app workspace commands and Vercel root-directory mapping.
- Added `CLAUDE.md` with repository architecture, commands, and workflow guidance.
- Updated `CLAUDE.md` with repo rules for maintaining `CHANGELOG.md` and branch naming for new implementation plans (`<NNN>-<short-description>`).

## Validation
- `npx pnpm install` completed successfully.
- Build/lint/typecheck passed for:
  - seller
  - admin
  - marketplace
- Dev servers were started successfully for all 4 apps and then stopped on request.
- 22:59: updated .
- .gitignore: updated .

## 2026-03-22
- Added Claude Code skill `sync-forum-ui` at `.claude/skills/sync-forum-ui/SKILL.md` to replicate frontend updates from `/Users/suren/Documents/GitHub/CEfrontend` into `apps/forum` with pixel-perfect/design-language parity guardrails and latest-tool-version policy.
- Added `CLAUDE.md` workflow rule that `apps/forum` frontend/UI updates must be replicated from `/Users/suren/Documents/GitHub/CEfrontend` with pixel-perfect parity and matching web component/system design language, while using latest local tool versions.
- Synced forum feed parity from CEfrontend in:
  - `apps/forum/src/components/feed/post-card.tsx`
  - `apps/forum/src/components/feed/post-interaction-row.tsx`
  - `apps/forum/src/components/feed/comments-preview-cycler.tsx`
  - `apps/forum/src/lib/mock-data/posts.ts`
  - `apps/forum/src/lib/mock-data/top-post-hero.ts`
- Validation: `pnpm lint`, `pnpm typecheck`, and `pnpm build` passed for `apps/forum`.
