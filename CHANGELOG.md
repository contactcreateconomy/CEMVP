# Changelog

## 2026-04-11 (audit: Priority 3 — feature completion and polish)
- **`convex/forum/mutations.ts`**: Added **`updateProfile`** mutation — name, bio, image, handle editing with validation, uniqueness check, and denormalized post author field sync.
- **`convex/forum/limits.ts`**: Added **`MAX_PROFILE_NAME_LEN`**, **`MAX_PROFILE_BIO_LEN`**, **`MAX_PROFILE_HANDLE_LEN`** constants.
- **`convex/forum/queries.ts`**: Added **`getViewerProfile`** query for current user's profile data.
- **`apps/forum/src/app/(app)/settings/settings-page-client.tsx`**: Full rewrite — theme selector (dark/light/system), notification toggles, content filter toggle, all wired to **`updateViewerSettings`** mutation.
- **`apps/forum/src/app/(app)/profile/profile-page-client.tsx`** (new): Real profile display with avatar, name, handle, bio, stats (points/level/streak), edit mode with inline form.
- **`apps/forum/src/app/(app)/profile/page.tsx`**: Replaced placeholder with `ProfilePageClient`.
- **`apps/forum/src/app/(app)/drafts/drafts-page-client.tsx`** (new): Reads localStorage draft, shows real draft with resume/delete actions, or empty state with link to compose.
- **`apps/forum/src/app/(app)/drafts/page.tsx`**: Replaced hardcoded placeholder with `DraftsPageClient`.
- **`apps/forum/src/app/not-found.tsx`** (new): Themed 404 page with brand styling and back-to-feed link.
- **`apps/forum/src/app/(compose)/error.tsx`** (new): Error boundary for compose layout.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (pre-existing warning only).

## 2026-04-11 (audit: Priority 1 + 2 fixes from full codebase audit)
- **`convex/forum/mutations.ts`**: Added **`createComment`** mutation with auth check, rate limiting, body validation, locked-post guard, and `commentsCount` increment.
- **`convex/forum/limits.ts`**: Added **`MAX_COMMENT_BODY_LEN`** (10,000) and **`createComment`** rate limit (60/hour).
- **`convex/forum/validators.ts`**: New file — shared Convex return-type validators matching frontend TypeScript types (post, user, comment, category, notification, campaign, leaderboard, vibing-item, hero-slide, settings, feed-page, search-results).
- **`convex/forum/queries.ts`**: Replaced **13 `v.any()` return types** with explicit validators. Only `getThreadBySlug` and `discussionRoute` queries retain `v.any()` (dynamic payload shapes, validated at read time).
- **`convex/forum/feedQueries.ts`**: **`viewerFlagsForPostIds`** batched from N+2 queries per post to 2 total queries (fetch all favorites + all upvotes for user, filter in memory). **`loadCommentPreviewsForPostIds`** parallelized with `Promise.all` instead of sequential loop.
- **`convex/schema.ts`**: Added documentation comment on `forumRichThreads.payload` clarifying it's seed-only data validated at read time.
- **`apps/forum/src/providers/shared-data-context.tsx`**: Changed `useLayoutEffect` → `useEffect` for non-critical category auto-ensure.
- **`apps/forum/src/app/(app)/*/loading.tsx`**: Added **9 missing loading skeletons** (profile, settings, drafts, campaigns, leaderboard, discover, saved, notifications, users/[handle]).
- **Apps affected**: `apps/forum` (primary), `convex/` (backend).

## 2026-04-05 (forum: new-post — no mandatory fields, TipTap category UX)
- **`category-composer-fields.ts`**: Removed required-field validation and HTML meta merging; exports **`categoryWritingHints`**, **`categoryEditorPlaceholders`**, **`categoryScaffoldHtml`**, **`isEditorDocumentBare`**, and draft payload **without** `extraFields`.
- **`new-post-composer.tsx`**: Dropped per-category input panel and publish validation for extra fields; **`body`** is TipTap HTML only; category row uses **`flex-wrap`** (all chips visible); hint line above editor; dynamic TipTap placeholder; optional **empty-doc scaffold** when switching category; drafts ignore legacy `extraFields` in JSON.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (existing **`thread-comments.tsx`** warning only).

## 2026-04-05 (forum: new-post category strip matches Discover)
- **`new-post-composer.tsx`**: Category picker at the top inside a **Discover**-style **Card** (uppercase **Category** label, **`rounded-[14px]`** row, **`h-10`** rows, Lucide **`h-4 w-4`** **`strokeWidth={2.5}`**, brand vs primary text); **sliding pill** indicator + horizontal scroll / **`scrollIntoView`** for the active item (parity with feed sidebar).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint`.

## 2026-04-05 (forum: new-post category UX + drafts)
- **`category-composer-fields.ts`**: Per-**`CategoryKey`** required/optional fields (aligned with discussion seed **`categoryBody`**), URL validation, escaped HTML meta block prepended to post **`body`** on publish; **`NEW_POST_DRAFT_STORAGE_KEY`** + draft payload type.
- **`new-post-composer.tsx`**: Discover-style category row (**`h-10`**, **`rounded-full`**, Lucide **`h-4 w-4`** **`strokeWidth={2.5}`**, active border/glow); conditional extra-field form; **`validateComposerFields`** before publish; **localStorage** draft save + one-time restore + toasts; fixed bottom bar (**Save** / **Publish** icons); toast **`bottom-24`** above bar.
- **`compose-shell.tsx`**: **`main`** **`pb-28`** so content clears the composer bottom bar.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (existing **`thread-comments.tsx`** warning only).

## 2026-04-05 (forum: Medium-style distraction-free /new-post)
- **Route**: Moved **`/new-post`** from **`(app)`** to **`(compose)`** so it no longer uses **`AppShell`** (no main top nav, sidebars, hero, footer, or mobile tab bar).
- **`compose-shell.tsx`**: Minimal sticky bar — logo → **`/feed`**, close (**`X`**), **Publish** (delegates to **`#compose-publish-btn`**).
- **`new-post-composer.tsx`**: Category icon pills in a horizontal strip (Discover/feed icons); large title + optional subtitle; divider; TipTap + bubble menu; hidden publish trigger for the shell; removed in-page Publish/Save draft row.
- **`apps/forum/README.md`**: Note **`(compose)`** layout for **`/new-post`**.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (cleared stale **`.next`** types after route move).

## 2026-04-05 (forum: restore sort + Discover animations)
- **`trend-sorter.tsx`**: Restored pre–feed-refresh behavior — **`duration-300`** sliding pill, **`bg-(--bg-surface)/70`** + **`backdrop-blur-md`** track, simpler link styling (matches **`6a842ec`** era).
- **`left-sidebar.tsx`**: Restored sliding **absolute indicator** for Discover (**`transition-all duration-300`**), prior **GlowingEffect** / CTA shadow tuning; kept **`?? LayoutList`** and focus rings.

## 2026-04-05 (forum: auto prod category bootstrap)
- **Convex**: **`insertMissingForumCategories`** in **`convex/forum/seed/ensureCategoryRows.ts`** — shared by **`forum/seed:ensureForumCategories`** (CLI) and new public **`forum/mutations:ensureForumCategories`**.
- **`createPost`**: If the category row is missing, runs the same insert helper then re-resolves the category (self-heal).
- **Forum client**: **`SharedDataProvider`** calls **`ensureForumCategories`** in **`useLayoutEffect`** when **`listCategories`** is empty, keeps **`categoriesLoading`** true until the mutation finishes — Discover sidebar / sort toolbar / new-post categories match dev without manual CLI.
- **Docs**: **`docs/production-convex.md`** — automatic bootstrap vs optional **`pnpm convex:prod:ensure-categories`**.
- **Validation:** `pnpm exec convex codegen`, `pnpm --filter ./apps/forum typecheck`, `lint`.

## 2026-04-05 (forum: empty Convex / prod resilience)
- **Hardening**: **`left-sidebar`**, **`post-interaction-row`**, **`new-post-composer`** — fallback Lucide icon when a category key is missing from the static map (avoids **“Element type is invalid … undefined”** if taxonomy and UI diverge).
- **`feed-post-discussion-slug`**: Match Convex **`discussionHrefForPostShape`** — use **`?? post.slug`** when category has no MVP mapping.
- **Empty taxonomy UX**: **`feed-client`** empty copy when **`categories.length === 0`**; **`discover-page-client`** message; **`new-post-page-client`** blocks composer until categories exist (points to **`pnpm convex:prod:ensure-categories`**).
- **`global-error.tsx`**: Root-level error UI (required **`html`/`body`**) for failures in **`layout`** / providers.
- **`feed-route-client`**: Replace feed-ready **ref read during render** with **`feedPageReady`** state (resets on sort/category change); **`loadMore`** deps **`[page]`**. **`saved-page-client`**: **`loadMore`** deps **`[page]`** (React Compiler eslint).
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (one pre-existing warning in **`thread-comments.tsx`**).

## 2026-04-05 (forum: feed UX + dark panels + glow)
- **No flash on sort/category**: **`feed/page.tsx`** static + **`Suspense`** (no **`await searchParams`**); removed **`feed/loading.tsx`**; **`feed-route-client`** reads URL via **`useSearchParams`**, keeps **stale posts** during refetch, avoids **full-tree `null`** after first load (**feed ready** gate); sort header **no `animate-soft-float`**; **post-card** **no `animate-soft-float`** on list updates.
- **`globals.css` `.dark`**: Near-black canvas + **`~#121212`** **`--bg-surface`**; **`.feed-post-card`** hover glow.
- **`trend-sorter.tsx`**: Solid bar bg; hover cyan; **700ms** pill slide (**150ms** reduced motion).
- **`left-sidebar.tsx`**: Discover — **active** row only: pill **border** + **glow** + light fill; **inactive** **hover** = **text color** only (no hover oval/shadow/bg).

## 2026-04-04 (auth-ui: auth modal top accent)
- **`packages/auth-ui/src/auth-modal.tsx`**: Removed the 1px **`bg-brand-primary`** strip at the top of the login/signup dialog (user-facing “blue line”).

## 2026-04-04 (forum: remove misleading Edge IP rate-limit middleware)
- **`apps/forum/src/middleware.ts`**: Removed. In-memory per-IP counters on the Edge do not persist across Vercel instances or cold starts, so they gave a false sense of security.
- **`README.md`**, **`docs/architecture.md`**, **`docs/forum-capacity.md`**, **`CLAUDE.md`**, **`AGENTS.md`**, **`docs/README.md`**: Document Convex **`forumWriteBuckets`** for writes and recommend **Vercel WAF** / shared stores (e.g. Upstash) for distributed IP throttling.

## 2026-04-03 (docs: sync with forum scale hardening)
- **`README.md`**, **`docs/architecture.md`**, **`docs/schema-forum.md`**, **`docs/forum-capacity.md`**, **`docs/overview.md`**, **`docs/README.md`**, **`docs/quick-start.md`**, **`docs/production-convex.md`**, **`CLAUDE.md`**: Document **`SharedDataProvider`**, middleware rate limiting, Vercel Analytics/Speed Insights, Convex crons + **`forumFeedCache`**, search indexes, split discussion queries (**`getDiscussionSidebarData`**), **`hasViewerProfile`**, lazy TipTap, preview env var note, monorepo Vercel CLI note.
- **`apps/forum/README.md`**: Replaced create-next-app boilerplate with pointers to monorepo docs and forum-specific conventions.

## 2026-04-03 (convex prod: deploy + category bootstrap)
- **`convex/forum/seed.ts`**: **`ensureForumCategories`** internal mutation — inserts missing **`forumCategories`** from catalog only (idempotent; no posts/profiles/demo data).
- **`package.json`**: **`pnpm convex:prod:ensure-categories`** → `convex run forum/seed:ensureForumCategories --prod`.
- **`docs/production-convex.md`**: Prod deploy steps, user-only content policy, category bootstrap; linked from [`docs/README.md`](docs/README.md) and [`CLAUDE.md`](CLAUDE.md).
- **Prod**: `convex deploy` to **energetic-kangaroo-55**; **`convex:prod:ensure-categories`** result `{ inserted: 9, skipped: 0 }`.

## 2026-04-03 (forum: next/image remotePatterns for OAuth avatars)
- **`apps/forum`**: [`next.config.mjs`](apps/forum/next.config.mjs) — allow **`next/image`** for **GitHub**, **Google**, **Facebook**, **Gravatar** hostnames (plus existing Unsplash) so signed-in profile avatars do not throw at runtime.

## 2026-04-03 (forum: ForumProfileEnsurer under AppAuthProvider)
- **`apps/forum`**: Render **`ForumProfileEnsurer`** inside **`AppAuthProvider`** in [`layout.tsx`](apps/forum/src/app/layout.tsx) (not inside [`ConvexProvider`](apps/forum/src/providers/convex-provider.tsx)) so **`useAuth`** is defined — fixes **`useAppAuth must be used within AppAuthProvider`** on `/feed`.

## 2026-04-03 (docs: architecture + stack versions)
- **`docs/architecture.md`**: System diagram (Mermaid), monorepo/runtime versions, forum + root dependency tables (Next, React, Convex, Tailwind, TipTap, Radix, ESLint, pnpm, Node), workspace packages, deployment intent. Linked from [`docs/README.md`](docs/README.md), [`CLAUDE.md`](CLAUDE.md), [`README.md`](README.md), [`AGENTS.md`](AGENTS.md), [`docs/overview.md`](docs/overview.md).

## 2026-04-03 (docs: agent-oriented overview, quick start, schema reference)
- **`docs/`**: Added [`docs/README.md`](docs/README.md) (index), [`docs/overview.md`](docs/overview.md), [`docs/quick-start.md`](docs/quick-start.md), [`docs/schema-forum.md`](docs/schema-forum.md). [`CLAUDE.md`](CLAUDE.md) — documentation index table + replaced outdated mock-data forum section with Convex-backed description. [`AGENTS.md`](AGENTS.md), [`README.md`](README.md) — pointers to `docs/README.md`.

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

