# Changelog

## 2026-04-03 (forum: /new-post TipTap editor)
- **`apps/forum`**: **`/new-post`** uses **`NewPostComposer`** — TipTap (StarterKit, underline, link, placeholder), **selection bubble menu** (`@tiptap/react/menus`), **category** pills aligned with **`getCategories()`** (locked categories disabled), title + optional subtitle, mock **Publish** / **Save draft** toasts. Global **`.new-post-prose`** styles in [`apps/forum/src/app/globals.css`](apps/forum/src/app/globals.css). Removed unused **`@tiptap/extension-bubble-menu`** dependency (menu comes from React package).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` OK.

## 2026-04-03 (forum: search, profiles, saved, legal, mobile nav)
- **`apps/forum`**: Mock **`/search?q=`** (`mock-search.ts`, `FeedClient` optional **`emptyState`**), desktop **TopNav** GET form; **`/users/[handle]`** profiles (`getUserByHandle`, `getPostsByAuthor`) with author **Links** in **post-card**, **thread-header**, **thread-sidebar**; **`/saved`** (`isFavorited` mock filter); static **`/terms`** and **`/privacy`**; **AppShell** footer links; **MobileTabBar** Create → **`/new-post`**, Profile → **`/profile`**.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` OK.

## 2026-04-03 (forum: comment avatar flex stretch)
- **`apps/forum`**: Thread **comments** and **composer** rows use **`items-start`** so `UserAvatar` is not stretched by default flex `align-items: stretch` (fixes tall pill-shaped level ring beside long comment bodies). Avatars get **`shrink-0`** in those rows.
- **Validation:** `pnpm --filter ./apps/forum lint` OK.

## 2026-04-03 (forum: legacy discussion URLs redirect)
- **`apps/forum`**: `/discussions/[slug]` **redirects** to the canonical MVP path + optional `?post=` when `slug` matches a feed post but not a thread (fixes old links and slug-only URLs). **`searchParams.post`** normalized when repeated. **Post card**: larger click target (summary, comments preview, cover image link to the same discussion href).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` OK.

## 2026-04-03 (forum: feed → discussion slug mapping)
- **`apps/forum`**: Feed cards, hero carousel, and share URLs use **`getDiscussionHrefForPost`** (`getFeedPostDiscussionSlug` + optional **`?post=<feedSlug>`**). Generic posts open the MVP thread path with a query so the server can **`resolveFeedOverlay`**: title, summary, body, author, views, upvotes, comment count, and date come from the **clicked post** while category body, tags, insight rail, and mock comments stay on the canonical thread. **`getDiscussionHrefForPost`**, **`FeedThreadOverlay`**, **`ThreadHeader.commentCount`**. Sample notifications use **`review-001`**.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` OK.

## 2026-04-03 (forum: thread MVP polish + QA index)
- **`apps/forum`**: `ThreadDiscussionProvider` / composer wiring; **MAX-only insight rail extras** (list coverage, news timeline + conflicts, review sentiment, help troubleshooting); **showcase** pin + “See in media” from `mediaPin` on comments; **help-only** solution filter chip; **thread report** via `ReportPostDialog`; dev index route **`/discussions/mvp`** (`apps/forum/src/app/(app)/discussions/mvp/page.tsx`).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint`, `build` OK.

## 2026-04-03 (forum: thread discussion MVP UI + mocks)
- **`apps/forum`**: Full **thread discussion** experience for nine MVP slugs (`news-001`, `review-001`, …) at `/discussions/[slug]` — shared shell (header with MIN/MAX, AI summary, actions), category-specific bodies, threaded comments (depth + continue, MAX filters, Help solution, Gigs/Showcase MAX toggles), composer + category nudges, context sidebar / MAX insight rail (desktop + mobile sheet), mock data in [`apps/forum/src/lib/mock-data/discussion-threads.ts`](apps/forum/src/lib/mock-data/discussion-threads.ts). Feed posts prepend these threads. Global leaderboard sidebar hidden on discussion routes via [`ConditionalRightSidebar`](apps/forum/src/components/layout/conditional-right-sidebar.tsx).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint`, `build` OK.

## 2026-04-03 (thread MVP: GitHub issues + creation script)
- [`scripts/create-thread-discussion-issues.sh`](scripts/create-thread-discussion-issues.sh): **`gh issue create`** batch for 20 **[Thread MVP]** work items aligned with [`docs/THREAD_DISCUSSION_USER_STORIES.md`](docs/THREAD_DISCUSSION_USER_STORIES.md).
- [`docs/github-issues/thread-discussion/`](docs/github-issues/thread-discussion/README.md): issue bodies + README (issues **#5–#24** on `contactcreateconomy/CEMVP`).

## 2026-03-29 (multi-app OAuth redirects: `AUTH_REDIRECT_ORIGINS`)
- [`convex/auth.ts`](convex/auth.ts): **`callbacks.redirect`** + **`AUTH_REDIRECT_ORIGINS`** — allow social/OAuth return to seller/admin/marketplace origins when they differ from **`SITE_URL`** (still allows relative paths and `?query` per Convex Auth defaults).
- [`convex/.env.example`](convex/.env.example), [`README.md`](README.md): document **`AUTH_REDIRECT_ORIGINS`**.

## 2026-03-29 (OAuth env trimming — GitHub 404 on authorize)
- [`convex/auth.ts`](convex/auth.ts): pass **trimmed** `clientId` / `clientSecret` into GitHub, Google, and Facebook providers so Convex env values pasted with a **trailing newline** no longer break OAuth (GitHub showed **404** with `client_id=...%0A`).

## 2026-03-29 (Vercel prod build: `next build --webpack`)
- All four apps’ `package.json` **`build`**: **`next build --webpack`** — fixes Vercel **`ERROR`** on production when prerendering (e.g. `/_not-found`): duplicate `convex/react` under default Turbopack build; webpack uses existing [`next.config.mjs`](apps/forum/next.config.mjs) aliases. Verified: `pnpm --filter ./apps/forum build` OK.
- [`README.md`](README.md): note under Vercel section.

## 2026-03-29 (production: Convex prod env + Vercel forum `NEXT_PUBLIC_CONVEX_URL`)
- **Convex production** (`energetic-kangaroo-55`): `SITE_URL` → `https://discuss.createconomy.com`; `JWT_PRIVATE_KEY` / `JWKS` / `AUTH_GITHUB_*` aligned with dev via `pnpm exec convex env set --prod` (Convex MCP cannot mutate prod by default). `CONVEX_SITE_URL` is built-in on Convex Cloud and cannot be overridden.
- **Vercel** project `cemvp-forum` (team createconomy): production **`NEXT_PUBLIC_CONVEX_URL`** → `https://energetic-kangaroo-55.convex.cloud` via `vercel env add` (Vercel MCP has no env-var tool).
- [`README.md`](README.md): dev vs prod Convex URLs, callback list, CLI notes for Convex prod and Vercel.

## 2026-03-29 (Next.js: single Convex instance for auth-ui)
- All four apps’ [`next.config.mjs`](apps/forum/next.config.mjs): **`turbopack.resolveAlias`** + **`webpack.resolve.alias`** for `convex` and `@convex-dev/auth` → each app’s `node_modules`, so `@cemvp/auth-ui` shares the same React context as `ConvexAuthProvider` (fixes **`Could not find ConvexProviderWithAuth`** / duplicate `convex/react` when using `transpilePackages`).
- Dev scripts: **`next dev --webpack`**; **build** scripts: **`next build --webpack`** — Turbopack still bundles a second `convex/react` for transpiled `auth-ui`; webpack honors the aliases for **local dev and Vercel production builds**.

## 2026-03-29 (Convex Auth JWT generator)
- Root `devDependencies`: **`jose`**; script [`scripts/generate-convex-auth-jwt.mjs`](scripts/generate-convex-auth-jwt.mjs) and `pnpm convex:gen-jwt` to fill **`JWT_PRIVATE_KEY`** / **`JWKS`** in `convex/.env.local` per [Convex Auth manual setup](https://labs.convex.dev/auth/setup/manual).
- [`convex/.env.example`](convex/.env.example) and [`README.md`](README.md): notes on syncing keys to Convex (`env set --from-file` for PEM).

## 2026-03-29 (env examples: all apps + Convex OAuth template)
- New [`convex/.env.example`](convex/.env.example): placeholder keys for `SITE_URL`, `CONVEX_SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`, `AUTH_GOOGLE_*`, `AUTH_GITHUB_*`, `AUTH_FACEBOOK_*`, `ADMIN_EMAILS` (set via Convex Dashboard / `npx convex env set`, not Next.js).
- [`apps/seller`](apps/seller/.env.example), [`apps/admin`](apps/admin/.env.example), [`apps/marketplace`](apps/marketplace/.env.example): `.env.example` with `NEXT_PUBLIC_CONVEX_URL`; [`apps/forum/.env.example`](apps/forum/.env.example) and root [`.env.example`](.env.example) updated to match and cross-link `convex/.env.example`.
- [`README.md`](README.md): environment section points at per-app and Convex templates.

## 2026-03-28 (production forum URL, offline auth modal copy)
- [`README.md`](README.md), root [`.env.example`](.env.example), [`apps/forum/.env.example`](apps/forum/.env.example), [`CLAUDE.md`](CLAUDE.md): production forum at **https://discuss.createconomy.com/feed**; Convex **`SITE_URL`** for that deploy documented as origin **https://discuss.createconomy.com**.
- [`packages/auth-ui` `OfflineAuthProvider`](packages/auth-ui/src/offline-auth-provider.tsx): no `authEnvironmentNote` banner in the auth modal; offline submit/social errors use a short hint without “sign-in is unavailable”.

## Validation
- `pnpm --filter ./apps/forum typecheck` OK.

## 2026-03-28 (Convex URL, OAuth, auth UI)
- Root [`.env.example`](.env.example) and [`apps/forum/.env.example`](apps/forum/.env.example): `NEXT_PUBLIC_CONVEX_URL` for deployment `watchful-chameleon-570`; [`README.md`](README.md) documents per-app `.env.local`, Vercel, and Convex-side vars (`SITE_URL`, `AUTH_*` for GitHub/Google/Facebook, callback URLs on `.convex.site`).
- [`convex/auth.ts`](convex/auth.ts): **GitHub**, **Google**, and **Facebook** OAuth via `@auth/core/providers/*` alongside **Password**.
- [`packages/auth-ui`](packages/auth-ui): `socialLogin` calls `signIn(provider)` with optional `redirectTo`; removed auth modal footer disclaimer.

## Validation
- `pnpm exec convex codegen` OK; `pnpm --filter ./apps/forum typecheck` OK.

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

