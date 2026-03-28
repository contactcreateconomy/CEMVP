# Changelog

## 2026-03-28 (auth modal centering / Tailwind v4)
- [`packages/auth-ui` `AuthModal`](packages/auth-ui/src/auth-modal.tsx): full-screen `auth-modal-portal-root` uses flexbox to center the panel; `Dialog.Content` is `relative` (drops `fixed` + `-translate-x/y-1/2`). Modal keyframes in all four apps’ `globals.css` use **`scale()` only** so animated `transform` does not collide with Tailwind v4’s separate `translate` properties (which was leaving the dialog at the viewport’s top-left).

## 2026-03-28 (offline auth modal)
- `OfflineAuthProvider` now keeps real modal state and mounts `AuthModal` in all four apps when Convex is not configured, so **Log in / Sign up** opens the dialog; `authEnvironmentNote` on context explains setting `NEXT_PUBLIC_CONVEX_URL`.

## 2026-03-28 (auth modal CSS)
- Earlier tweak: keyframes briefly combined `translate(-50%, -50%)` with `scale()` while the dialog used fixed + Tailwind translate; superseded by the **2026-03-28 (auth modal centering / Tailwind v4)** flex wrapper + scale-only keyframes.

## 2026-03-28
- Branch `006-login-backend`: Convex Auth **Password** provider in [`convex/auth.ts`](convex/auth.ts), HTTP router in [`convex/http.ts`](convex/http.ts); merged `users` table with Convex Auth fields; [`convex/profile.ts`](convex/profile.ts) `current` query; default **memberships** (forum/seller/marketplace `member`, admin via `ADMIN_EMAILS` env) in `afterUserCreatedOrUpdated`.
- New workspace package [`packages/auth-ui`](packages/auth-ui): shared `AppAuthProvider`, `AuthModal`, login/signup/social UI; forum uses it via `@cemvp/auth-ui` (removed mock `auth-provider` and local auth components).
- **Tailwind v4** for `apps/seller`, `apps/admin`, `apps/marketplace` (forum-aligned `globals.css`, `@tailwindcss/postcss`, removed `tailwind.config.ts`); `transpilePackages: ["@cemvp/auth-ui"]` on all four apps; placeholder home pages include **Log in / Sign up** entry buttons.
- Root `devDependencies.convex` bumped to `^1.34.1`.
- `OfflineAuthProvider` when `NEXT_PUBLIC_CONVEX_URL` is unset so `useAuth` / static builds work without Convex; `AppAuthProvider` when Convex is configured, otherwise `OfflineAuthProvider` + `AuthModal` with an environment note (see 2026-03-28 offline auth modal entry).

## Validation (006-login-backend)
- `pnpm exec convex codegen` OK.
- `pnpm --filter ./apps/forum typecheck` / `build` OK; `pnpm --filter @cemvp/{seller,admin,marketplace} typecheck` OK.

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
- Migrated `apps/forum` from Tailwind CSS v3 to v4.2 using `npx @tailwindcss/upgrade@latest --force`, including PostCSS migration to `@tailwindcss/postcss` and removal of legacy `tailwind.config.ts`.
- Updated `apps/forum/src/app/globals.css` to v4 + shadcn-compatible token structure (`@theme inline`, `:root`/`.dark` token blocks, HSL color tokens) and retained visual parity styling.
- Added explicit `border-gray-200` on v4 default-border-risk spots in:
  - `apps/forum/src/components/ui/glowing-effect.tsx`
  - `apps/forum/src/components/ui/avatar-with-name.tsx`
  - `apps/forum/src/components/auth/signup-form.tsx`
- Tailwind upgrader also rewrote utility syntax across forum pages/components (notably bracket/arbitrary color/style forms) to v4-compatible class forms.
- Validation:
  - `pnpm install` passed.
  - `pnpm --filter ./apps/forum lint` passed.
  - `pnpm --filter ./apps/forum typecheck` passed.
  - `pnpm --filter ./apps/forum build` passed.
- Manual layout adjustments for `space-x` / `divide-y`: none required (`-space-x-1.5` in `apps/forum/src/components/feed/post-interaction-row.tsx` remained unchanged and did not require manual rewrite).
- 21:54: updated .
- /Users/suren/.claude/plans/lexical-knitting-sunrise.md: updated .
- 22:39: updated .
- /Users/suren/.claude/plans/precious-herding-scroll.md: updated .
- 22:46: updated .
- apps/forum/src/app/globals.css: updated .
- 22:46: updated .
- apps/forum/src/components/ui/avatar-with-name.tsx: updated .
- 22:46: updated .
- apps/forum/src/components/ui/glowing-effect.tsx: updated .
- 22:46: updated .
- apps/forum/src/components/auth/signup-form.tsx: updated .
- 22:50: updated .
- apps/forum/src/app/globals.css: updated .
- 22:57: updated .
- apps/forum/src/app/(app)/feed/page.tsx: updated .
- 22:57: updated .
- apps/forum/src/app/(app)/feed/page.tsx: updated .
- 23:01: updated .
- apps/forum/src/app/(app)/discussions/[slug]/page.tsx: updated .
- 23:01: updated .
- apps/forum/src/app/(app)/discussions/[slug]/page.tsx: updated .
- 23:05: updated .
- apps/forum/src/components/auth/auth-modal.tsx: updated .
- 23:05: updated .
- apps/forum/src/components/feed/trend-sorter.tsx: updated .
- 23:05: updated .
- apps/forum/src/components/auth/auth-modal.tsx: updated .

## 2026-03-23
- 21:46: updated .
- /Users/suren/.claude/settings.json: updated .
- Fixed Tailwind CSS v4 color syntax issues in `apps/forum`:
  - Updated `@theme` block in `globals.css` with all missing color mappings (text-primary, text-secondary, bg-surface, bg-overlay, brand-primary, feedback-error, etc.)
  - Migrated button variants from v3 `text-(--var)` syntax to v4 `text-color-name` syntax
  - Migrated input component from v3 to v4 color syntax
  - Migrated auth-modal, login-form, and signup-form from v3 to v4 color syntax
  - Added z-index scale values (z-70, z-80) for modal positioning
  - Added shadow mappings (shadow-xs through shadow-lg, glow variants)
- Added `.cursor/` to `.gitignore` (local tooling state)
- Affected files:
  - `apps/forum/src/app/globals.css`
  - `apps/forum/src/components/ui/button.tsx`
  - `apps/forum/src/components/ui/input.tsx`
  - `apps/forum/src/components/auth/auth-modal.tsx`
  - `apps/forum/src/components/auth/login-form.tsx`
  - `apps/forum/src/components/auth/signup-form.tsx`
  - `.gitignore`

