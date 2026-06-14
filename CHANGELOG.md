# Changelog

## 2026-06-14 (admin + Convex: persona automation — admin-only control plane)

**Feature:** Admin-controlled persona content engine for cold-start forum activity. Personas, skills, topic briefs, GLM + Tavily draft generation, review queue, and publish — all managed from **`apps/admin`** only. **`apps/forum` unchanged**; published content appears as normal member posts/comments via internal Convex publish helpers.

**Convex:** New tables `forumPersonaSkills`, `forumPersonas`, `forumTopicBriefs`, `forumContentDrafts`, `forumAutomationConfig`, `forumAutomationRuns`; module `convex/forum/personas/`; hourly persona scheduler cron.

**Admin routes:** Public `/` landing; authenticated console at `/dashboard`, `/personas`, `/skills`, `/topics`, `/queue`, `/runs`.

**Docs:** [`docs/persona-automation.md`](docs/persona-automation.md). Env: `GLM_API_KEY`, `GLM_MODEL`, `SEARCH_API_KEY` on Convex deployment.

**Apps affected:** `apps/admin`, `convex` (shared backend). Forum app not modified.

**Prod deploy (local admin test):** `convex deploy` to **energetic-kangaroo-55** (persona tables + APIs). Vercel admin app uses prod `NEXT_PUBLIC_CONVEX_URL`; local `.env.local` uses dev **`watchful-chameleon-570`**. Admin UI: public landing at `/`, console at `/dashboard`, `/personas`, etc. after sign-in.

**Admin UX:** Landing `/` shows login panel on **`console.createconomy.com`** only; local/dev shows “production only” message. Prod **`AUTH_REDIRECT_ORIGINS`** → `https://console.createconomy.com` so Google OAuth returns to console, not forum.

## 2026-06-14 (forum: fix Vercel build — Suspense on TopNav in AppShell + 9 page routes)

**Problem:** Vercel build kept failing with `useSearchParams() should be wrapped in a suspense boundary at page "/campaigns"`. The prior fix wrapped the page-level client components in `Suspense`, but the real trigger was `TopNav` (which calls `useSearchParams()`) being rendered in `AppShell` **without** a `Suspense` boundary — making every page in the `(app)` group a prerender failure.

**Fix:**
- Wrapped `<TopNav />` in `<Suspense fallback={null}>` inside `app-shell.tsx` — this is the root fix that unblocks all pages.
- Also wrapped client components in `<Suspense fallback={null}>` in 9 page routes: `campaigns`, `discover`, `leaderboard`, `notifications`, `profile`, `saved`, `settings`, `drafts`, `(compose)/new-post`.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel bug fixes — compact image fallback, direction wrap, null guard)

**Bug fixes from code review:**
- Compact cascade `<Image>` now has `onError` handler — broken images fall back to accent gradient instead of blank.
- Fixed cascade direction wrap: clicking back cards near the end of the carousel no longer plays animations in the wrong direction.
- Added null guard for `heroRef.current` in the measure effect (was using non-null assertion).
- Removed stale JSDoc on `discussionHref` that referenced a `?post=` param the implementation never uses.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel compact — fluid directional animation)

**Compact state — animation direction alignment (Apple macOS-style):**
- Fixed the core clash: old front card now exits **LEFT** on "next" (sinks into the cascade stack depth), instead of wrongly exiting right while text exited left.
- Cascade enter/exit is now fully symmetric: "next" and "prev" are exact direction mirrors.
- `enterFrom`/`exitTo` values tuned for depth-coherent 3D transition (new back card materialises from deep behind the stack; old front sinks into it on next, and the reverse for prev).
- Text `AnimatePresence` switched from `mode="wait"` (sequential) to `mode="sync"` (parallel exit+enter) — old text slides out as new text slides in simultaneously, matching macOS page-turn behaviour.
- Text transition replaced with a spring (`stiffness: 280, damping: 28, mass: 0.9`) matching the CASCADE_SPRING feel.
- Text x-offset increased from ±40 to ±56 for more visible, purposeful motion.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel — sizing revert + icon-only toggle buttons)

**Default state — sizing reverted to pre-enlargement values:**
- `cardW` fallback reverted to 549 (was 640); dynamic measure reverted to `sorterRect.width` (no ×1.18 factor).
- `focusX` reverted to original formula (no −80 offset).
- `X_STRIDE` reverted to 440 (was 360).
- Side-card `scale`/`opacity`/`blur`/`brightness` reverted to original dimmer values (0.5/0.35, 0.55/0.14, 8/16, 0.45/0.2).

**Toggle buttons — text removed, icon-only, top-right corner:**
- "Compact" button replaced with `Minimize2` icon-only circle at top-right of default state.
- "Expand" button replaced with `Maximize2` icon-only circle at top-right of compact state.
- Removed `ChevronDown`/`ChevronUp` imports; added `Minimize2`/`Maximize2`.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel compact-state design fixes)

**Compact state — navigator, Explore button, hover glow:**
- Removed inline "Read/Explore" link from the animated text block.
- Added a static **Explore** button next to the navigator (same pill + Explore row as default state); it remains fixed regardless of slide changes.
- Navigator replaced with the same symmetric pill-container design from default state — both Prev/Next buttons use `ChevronLeft`/`ChevronRight` inside a shared frosted-glass pill with equal hover states.
- Explore button inherits the same `group-hover/hero` glow and arrow pulse animation as default state.
- Removed unused `ArrowLeft` and `ArrowRight` imports.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel default-state positioning tweaks)

**Default state — positioning & visibility:**
- Focus card is ~18% wider (dynamically derived from sorter width × 1.18) and shifted ~80px left for better left-justification.
- Side cards now cascade closer together (`X_STRIDE` 440 → 360) with more visibility: larger scale (0.6/0.48), higher opacity (0.65/0.3), less blur and more brightness.
- Edge mask widened from 10%/90% to 2%/98% so side cards peek out more.
- Perspective origin adjusted to 42% to match shifted focus.

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: compact state — 3D cascade animation for image area)

**Compact state — 3D cascade:**
- Replaced the static left thumbnails + center vertical-slide image with a unified **3D cascade stage** (`col-span-7`).
- Active slide is the front card; next 2 upcoming slides cascade behind it with `z`, `rotateY`, `scale`, `opacity`, and `blur/brightness` depth transforms.
- Direction-aware entrance/exit: forward slides enter from back-left and exit right; backward reverses.
- Premium spring physics (`CASCADE_SPRING`: stiffness 180, damping 25, mass 0.9) for smooth macOS-style motion.
- Removed `thumbnailSlides` and `imgVariants` — replaced by `cascadeSlides` array and inline animate/initial/exit props.
- Card dimensions derived from `compactH` (82% usable height, landscape 4:3 ratio).

**Apps affected:** `apps/forum`.

## 2026-04-18 (forum: hero carousel compact state redesign)

**New feature — two-state hero carousel (compact mode):**
- Hero carousel now has two states: **Default** (existing 3D cinematic cascade, unchanged) and **Compact** (new 3-column portrait layout, ~50% height).
- Compact dimensions: 220px (mobile/tablet) | 260px (xl ≥ 1280px) — exactly 50% of default heights. Height springs between states via Framer Motion (`stiffness:200, damping:28`).
- Compact layout — left column: mono slide counter + vertical `eyebrow` category label + 3 thumbnail buttons; center column: portrait-cropped cover image with vertical slide animation per direction; right column: eyebrow, title, summary (line-clamped), Explore link, + circular ArrowLeft/ArrowRight nav buttons. Accent colour drives the "next" button background and shadow.
- Direction-aware animations: image slides in/out vertically (100% y), text slides in/out horizontally (40px x), both 0.5s cubic-bezier.
- Toggle: "Compact" pill at bottom-centre of default state (appears on hero hover, cyan glow on direct hover). "Expand" pill at top-right of compact state.
- Auto-advance (5.2s) and hover-pause work identically in both states. Wheel/drag navigation disabled in compact. `prefers-reduced-motion` collapses all transitions to instant.
- Ambient background (blurred cover image) shared between states for seamless visual continuity.
- `top-post-hero-section.tsx`: removed external `h-[440px] xl:h-[520px]` class from `TopPostHeroCarousel` — the component now manages its own height internally.

**Apps affected:** `apps/forum`.

## 2026-04-17 (forum: rename Help category to Q&A)

**Category rename — full key + display name change:**
- Renamed the "Help" category to "Q&A" across the entire codebase: key `"help"` → `"qa"`, display name `"Help"` → `"Q&A"`.
- Updated Convex schema, validators, seed data (catalog, discussion threads, generated posts).
- Updated frontend types (`CategoryKey`, `HelpBody` → `QaBody`), slug utility, category template folder (`categories/help/` → `categories/qa/`).
- Updated registry, tests, left sidebar icon mapping, shared data context fallbacks, category preview route, thread comments (solution filter), thread header icons, post interaction row icons, new-post composer fields and scaffolds.
- Seed data: thread slug `help-001` → `qa-001`, campaign "Community Help Week" → "Community Q&A Week", hero slide "Help Desk Highlight" → "Q&A Highlight".
- **Re-seed required** after deployment to update stored category keys.

**Apps affected:** `apps/forum`, `convex/`.

## 2026-04-17 (forum: category design preview routes)

**New feature — `/category/[slug]` design sandbox:**
- Added `apps/forum/src/app/(app)/category/[slug]/page.tsx` + `category-preview-loader.tsx`: parameterised route that loads the most recent real thread for any of the 9 categories and renders it using the exact same `DiscussionPageClient` as real thread pages.
- Added `convex/forum/discussionRoute.ts: getRepresentativeThreadByCategory` query: finds the latest non-removed post by `by_category_createdAt` index and returns a full `DiscussionRouteState`.
- In development mode a banner shows the category key and the template directory to edit.
- Design workflow: navigate to `localhost:3000/category/news` (or any of the 9 category slugs), make changes to `src/components/discussion/categories/news/NewsBody.tsx` etc., and they propagate to all real thread pages automatically.

**Files affected:** `apps/forum` (new route), `convex/forum/discussionRoute.ts` (new query).

## 2026-04-16 (forum: bug fixes — 8 confirmed bugs resolved)

**Critical fixes:**
- **Bug 1** — `thread-composer.tsx`: Fixed postId resolution for rich threads. Now uses `thread.postId ?? thread.id` so comments work on seeded/rich thread pages (previously threw "Post not found").
- **Bug 2** — `convex/forum/mutations.ts`: Fixed permanently stale upvote counts. `toggleUpvote` now patches `forumPosts.upvotes` in sync with sharded counter writes, so the document field stays accurate for feed/discussion rendering.
- **Bug 3** — `image-uploader.tsx` + `use-cover-image-url` hook + `queries.ts`: Fixed cover image URLs. Uploader now stores Convex storageId instead of a constructed fake URL. Added `useCoverImageUrl` hook for client-side resolution and server-side resolution in `listHeroSlides`. Cover images render correctly across sessions.

**Medium fixes:**
- **Bug 4** — `discussionRoute.ts`: Increased comment load cap from 50 to 200 for regular posts.
- **Bug 5** — Deleted orphaned `stores/composer-store.ts` (Zustand store was never imported; composer uses direct localStorage).
- **Bug 6** — `GigsComposeForm.tsx`: Added `duration`, `preferredSkills`, `posterNote` fields + auto-generated defaults (`isOpen`, `applicantCount`, `processStage`, `stages`).
- **Bug 7** — `ReviewComposeForm.tsx` + `ReviewBody.tsx`: Added `reviewerContextNote`, `verdictRationale`, `criteria` (dynamic list with score) fields. Fixed crash in `ReviewBody` where `b.criteria` and `b.reviewerContextMax` were accessed without null guards.
- **Bug 8** — `convex/schema.ts`: Replaced `v.any()` on `forumCategoryPayloads.payload` with per-category validators (gigs + review + fallback).

**Files affected:** `apps/forum` (frontend), `convex` (backend). New files: `apps/forum/src/hooks/use-cover-image-url.ts`. Deleted: `apps/forum/src/stores/composer-store.ts`.

## 2026-04-16 (forum: scale readiness, performance, ecosystem foundation — Part 5)

- **`convex/schema.ts`**: Added `forumCounterShards` (sharded upvote/view counters), `forumAnalyticsEvents`, `forumDailyStats` tables. Added `searchTags` optional field to `forumPosts` for category-aware search.
- **`convex/forum/mutations.ts`**: `toggleUpvote` now uses sharded counter writes (10 shards) instead of direct `forumPosts.upvotes` patch — eliminates OCC conflicts on viral posts. Added `incrementViewCount` mutation (5 shards). Added `trackEvent` inline analytics in `createPost`, `createComment`, `toggleUpvote`, `toggleFavorite`. Added `extractSearchTags` helper for denormalizing gigs skills and review product names into `searchTags`.
- **`convex/forum/queries.ts`**: Added `getPostUpvoteCount` query (sums all upvote shards). Extended `searchPostsAndUsers` with optional `categoryFilter` arg using Convex search index field filters.
- **`convex/forum/jobs.ts`**: Added `reconcileUpvoteCounts` internal mutation (cursor-based shard sum → post patch, self-chains). Added `aggregateDailyAnalytics` internal mutation (groups past-24h events by type + category, writes to `forumDailyStats`).
- **`convex/crons.ts`**: Added reconcile cron (10-min interval) and daily analytics cron (3 AM UTC).
- **`apps/forum/src/components/discussion/thread-comments.tsx`**: Virtual scrolling via `@tanstack/react-virtual` when root comment count exceeds 100 (800px max-height scroll container, 120px estimated row height, 5 overscan).
- **`apps/forum/src/components/feed/feed-client.tsx`**: Added `@vercel/analytics` `track("post_clicked")` on post card click.
- **`apps/forum/src/components/discussion/discussion-page-client.tsx`**: Added `incrementViewCount` on mount (ref-gated for StrictMode). Added `track("thread_viewed")` on mount.
- **`apps/forum/src/components/feed/post-card.tsx`**: Added `onPostClick` optional prop for analytics tracking.
- **`apps/forum/src/components/layout/top-nav.tsx`**: Search form passes current `category` as hidden field when browsing a category-filtered feed; placeholder updates to show category name.
- **`apps/forum/src/app/(app)/search/page.tsx`**: Accepts optional `category` search param; passes to `SearchPageClient`.
- **`apps/forum/src/app/(app)/search/search-page-client.tsx`**: Passes `categoryFilter` to `searchPostsAndUsers` query.
- **NEW `apps/forum/src/types/platform.ts`**: `PlatformIdentity` and `ContentReference` types for future cross-app identity and content linking.
- **`apps/forum/src/types/discussion.ts`**: Added `contentReferences?: ContentReference[]` to `DiscussionThreadBase`.
- **NEW `apps/forum/vitest.config.ts`**: Vitest config with jsdom environment, React plugin, `@` alias.
- **NEW `apps/forum/src/test/setup.ts`**: Test setup with `@testing-library/jest-dom/vitest`.
- **NEW `apps/forum/src/components/discussion/categories/__tests__/registry.test.ts`**: Category registry tests — validates all 9 keys return templates, unknown keys return null.
- **NEW `convex/forum/__tests__/feedCache.test.ts`**: Virality score unit tests — comment weight > upvote weight, zero baseline, linear scaling.
- **NEW `docs/ecosystem-integration.md`**: Ecosystem integration boundary — identity mapping, content references, single-deployment strategy, table ownership, migration path.
- **`apps/forum/package.json`**: Added `@tanstack/react-virtual` dependency. Added vitest/testing devDependencies. Added `test` and `test:run` scripts.
- **`package.json`**: Added `test` and `test:run` root scripts.
- **Typecheck + lint**: Clean (0 errors, 6 warnings — pre-existing + React Compiler compatibility note for `useVirtualizer`).
- **Tests**: 2 passing (registry + virality score).

## 2026-04-16 (forum: moderation, notifications, media upload, stores, ISR — Part 4)

- **`convex/schema.ts`**: Added `forumReports` and `forumModActions` tables. Added `moderationStatus` field to `forumPosts`. Added `createReport` kind to `forumWriteBuckets`.
- **`convex/forum/limits.ts`**: Added `createReport` rate limit (10/hour).
- **`convex/forum/mutations.ts`**: Added `createReport` (with duplicate check), `moderateContent` (mod/admin), `generateUploadUrl` (storage). Added notification emission in `createComment` and `toggleUpvote`.
- **`convex/forum/queries.ts`**: Added `getModQueue` (mod/admin, paginated) and `getStorageUrl`.
- **`convex/forum/feedQueries.ts`**: Filter removed/shadow-removed posts from feed bundles and hot ranking.
- **`convex/forum/discussionRoute.ts`**: Return `not_found` for removed/shadow-removed posts.
- **`apps/forum/src/components/feed/report-post-dialog.tsx`**: Updated reasons to match backend enum values.
- **`apps/forum/src/components/feed/feed-client.tsx`**: Wired `onReport` to `createReport` backend mutation.
- **`apps/forum/src/components/layout/top-nav.tsx`**: Notification panel now marks notifications as read on click and navigates to `postSlug`.
- **NEW `apps/forum/src/components/ui/image-uploader.tsx`**: Drag-and-drop image upload with client-side resize, Convex storage integration, preview.
- **`apps/forum/src/components/new-post/new-post-composer.tsx`**: Integrated `ImageUploader` for cover image. Added `coverImage` state persisted to draft.
- **NEW `apps/forum/src/stores/composer-store.ts`**: Zustand store with localStorage persist for composer drafts.
- **NEW `apps/forum/src/stores/ui-preferences-store.ts`**: Zustand store with localStorage persist for feed sort and sidebar state.
- **`apps/forum/src/components/feed/feed-route-client.tsx`**: Uses `useUIPreferences` for persistent feed sort across sessions.
- **`apps/forum/src/app/(app)/feed/page.tsx`**: Added `revalidate = 60` for ISR.
- **Typecheck + lint**: Clean (0 errors, 5 warnings — all pre-existing or `<img>` in uploader preview).

## 2026-04-16 (forum: CategoryTemplate contract — Part 3)
- **`apps/forum/src/components/discussion/categories/types.ts`**: Added `ComposeForm` and `CardExtras` optional slots to `CategoryTemplate` interface.
- **`apps/forum/src/components/discussion/categories/registry.ts`**: Kept eager imports for synchronous API compatibility; Suspense boundary added in body rendering.
- **`apps/forum/src/components/discussion/category-bodies.tsx`**: Wrapped `tpl.Body` in `<Suspense>` with pulse fallback.
- **NEW `categories/gigs/GigsComposeForm.tsx`**: Structured fields — role title, employment type, location, budget, required skills (tags input).
- **NEW `categories/review/ReviewComposeForm.tsx`**: Structured fields — product name, URL, verdict selector, star rating.
- **NEW `categories/help/HelpComposeForm.tsx`**: Structured fields — goal, environment tags, what was tried.
- **NEW `categories/debate/DebateComposeForm.tsx`**: Structured fields — motion statement, initial position (for/against/neutral).
- **NEW `categories/gigs/GigsCardExtras.tsx`**: Feed card metadata strip — role + employment + location + budget.
- **NEW `categories/review/ReviewCardExtras.tsx`**: Feed card verdict badge + star rating.
- **NEW `categories/debate/DebateCardExtras.tsx`**: Feed card vote counts or motion text.
- **`categories/{gigs,review,help,debate}/index.tsx`**: Registered `ComposeForm` and `CardExtras` in templates.
- **`apps/forum/src/components/new-post/new-post-composer.tsx`**: Renders `ComposeForm` below TipTap editor; passes `categoryFields` to `createPost` mutation and localStorage drafts; clears fields on category change.
- **`apps/forum/src/components/feed/post-card.tsx`**: Added `CardExtras` slot below title/summary (no layout/style changes to existing elements).
- **`apps/forum/src/types/post.ts`**: Added optional `categoryBody` field to `Post` type.
- **`convex/schema.ts`**: Added `forumCategoryPayloads` table (`postId`, `category`, `payload`, `version`) with `by_post` index.
- **`convex/forum/mutations.ts`**: `createPost` accepts optional `categoryFields`; stores structured payload in `forumCategoryPayloads`.
- **`convex/forum/discussionRoute.ts`**: Loads `categoryPayload` for real posts and merges into `thread.categoryBody`.
- **`convex/forum/feedQueries.ts`**: `buildFeedBundleFromPosts` loads per-post category payloads for feed card extras.
- **`convex/forum/helpers.ts`**: `postDocToPost` accepts optional `categoryBody` and includes it in output.
- **Typecheck + lint**: Clean (0 errors).

## 2026-04-16 (forum: comment threading & interaction wiring — Part 2)
- **`convex/schema.ts`**: Added `parentId` (optional `forumPostComments` id) + `by_parent` index to `forumPostComments` table for two-tier threading.
- **`convex/forum/mutations.ts`**: `createComment` accepts optional `parentId`; validates parent exists on same post and enforces max depth 2 (no replies to replies).
- **`convex/forum/queries.ts`**: New `getCommentReplies` query loads direct replies to a comment via `by_parent` index.
- **`convex/forum/discussionRoute.ts`**: Returns real `parentId` from DB (no longer hardcoded `null`). Added `viewerHasUpvoted`, `viewerHasBookmarked`, `postId` to thread shape for both regular posts and rich threads.
- **`apps/forum/src/types/discussion.ts`**: Added `postId`, `viewerHasUpvoted`, `viewerHasBookmarked` to `DiscussionThreadBase`.
- **`apps/forum/src/components/discussion/thread-comments.tsx`**: Two-tier enforcement — Reply button hidden on replies (comments with `parentId`) for real posts; rich thread rendering unchanged.
- **`apps/forum/src/components/discussion/thread-composer.tsx`**: Accepts optional `parentId` prop, passes it to `createComment` mutation for inline replies.
- **`apps/forum/src/components/discussion/discussion-page-client.tsx`**: Wired `toggleUpvote`/`toggleFavorite` mutations with optimistic updates. State initialized from `thread.viewerHasUpvoted`/`thread.viewerHasBookmarked` server data.
- **Typecheck + lint**: Clean (0 errors).

## 2026-04-16 (forum: backend integrity & performance fixes — Part 1)
- **`convex/schema.ts`**: Replaced `v.any()` on `forumRichThreads.payload` with discriminated union validator across all 9 categories. Added `richThreadBase` shared validator object.
- **`convex/forum/feedQueries.ts`**: Replaced unbounded `.collect()` in `viewerFlagsForPostIds` with per-postId targeted lookups via `by_user_post` index (max 96 reads vs thousands).
- **`convex/forum/queries.ts`**: Changed `getCommentsByPostId` from `.take(50)` to `.paginate()` with cursor support for proper pagination.
- **`convex/forum/mutations.ts`**: `updateProfile` now schedules batched internal job instead of direct `.collect()` + patch loop (avoids timeout for prolific authors).
- **`convex/forum/jobs.ts`**: NEW — `syncAuthorDenormalization` internal mutation with cursor-based self-chaining (100 posts per batch).
- **`apps/forum/src/components/feed/feed-client.tsx`**: Removed client-side virality score secondary sort; posts render in server-delivered order.
- **`apps/forum/src/providers/shared-data-context.tsx`**: Removed client-side `ensureForumCategories` mutation call; categories are admin-seeded only.
- **`convex/forum/discussionRouteHelpers.ts`**: Added `unknown` intermediate cast for discriminated union type narrowing.
- **`convex/forum/seed.ts`**: Added type assertion for remapped payload insert.
- **`convex/_generated/api.d.ts`**: Added `forum/jobs` module to generated API types.
- **Typecheck + lint**: Clean.

## 2026-04-15 (forum: category template registry — extract plugin architecture)
- **`apps/forum/src/components/discussion/categories/`**: New directory with per-category modules — 9 body components, 4 insight components, 9 index files wiring `CategoryTemplate` interface, plus `types.ts`, `registry.ts`, and `GenericBody.tsx`.
- **`apps/forum/src/components/discussion/category-bodies.tsx`**: Slimmed from 1161 lines to ~20 lines — thin dispatcher using `getCategoryTemplate()` registry lookup.
- **`apps/forum/src/components/discussion/insight-rail-extras.tsx`**: Slimmed from 129 lines to ~12 lines — thin dispatcher using registry `Insights` slot.
- **`apps/forum/src/components/discussion/thread-composer.tsx`**: Replaced hardcoded `NUDGES` map with `getCategoryTemplate().nudge` lookup from registry.
- **`apps/forum/src/components/discussion/discussion-page-client.tsx`**: Replaced inline `feedbackChips` logic with `getCategoryTemplate().getFeedbackChips()` from registry.
- Adding a new category now requires only: create a body component, create an index.tsx, add one import + registry entry. No core files touched.
- **Typecheck + build**: Clean.

## 2026-04-15 (forum: unified thread template — every post gets its own page)
- **`apps/forum/src/lib/discussion/feed-post-discussion-slug.ts`**: Simplified — every post navigates to `/discussions/{slug}` directly (removed MVP thread mapping).
- **`apps/forum/src/lib/discussion/category-mvp-slugs.ts`**: Deleted — no more canonical MVP thread slug mapping.
- **`convex/forum/constants.ts`**: Simplified `discussionHrefForPostShape` to always use the post's own slug.
- **`convex/forum/discussionRoute.ts`**: Both rich threads and regular posts now return a unified `kind: "rich"` response. Regular posts construct a thread-shaped object with comments. Removed `feedOverlay` and redirect logic.
- **`apps/forum/src/components/discussion/discussion-page-loader.tsx`**: Single render path through `DiscussionPageClient` for all posts. Removed `feedPostSlug`, redirect handling, and simple-post card fallback.
- **`apps/forum/src/components/discussion/discussion-page-client.tsx`**: Removed `FeedThreadOverlay` type and all overlay-swapping logic.
- **`apps/forum/src/components/discussion/category-bodies.tsx`**: Added `GenericBody` fallback for posts without category-specific structured data. Added type assertions for category body narrowing.
- **`apps/forum/src/components/discussion/insight-rail-extras.tsx`**: Added null guards for `categoryBody` access with explicit type casts.
- **`apps/forum/src/types/discussion.ts`**: Added generic union member `(DiscussionThreadBase & { categoryBody?: Record<string, unknown> })`. Removed `DISCUSSION_MVP_SLUGS` and `DiscussionMvpSlug`.
- **`apps/forum/src/app/(app)/discussions/mvp/page.tsx`**: Deleted (dev index page for 9 hardcoded slugs).
- **`apps/forum/src/app/(app)/discussions/[slug]/page.tsx`**: Removed `searchParams` and `feedPostSlug` — clean slug-only routing.
- **`convex/forum/queries.ts`**: Updated `discussionHrefForPostShape` call to use simplified signature.
- **Typecheck**: Clean.

## 2026-04-15 (auth-ui: inline email verification flow in signup)
- **`packages/auth-ui/src/signup-form.tsx`**: Added inline email verification — "Verify" button inside email input, crossfades to 6-digit OTP input with auto-advance, paste support, shake animation on error, verified badge. Frontend-only with placeholder functions for backend wiring. Form submission now requires verified email.
- **`packages/auth-ui/src/ui/input.tsx`**: Added subtle primary blue outline on focus (`border-brand-primary/50`, `ring-2 ring-brand-primary/20`).
- **`apps/forum/src/app/globals.css`**: Added `@keyframes auth-otp-shake` for OTP error animation.
- **`apps/forum/src/components/layout/top-nav.tsx`**: Fixed NavTooltip blur — replaced spring `y` animation with CSS-positioned opacity+scale transition; fixed dark mode border.

## 2026-04-15 (forum: top nav — crisp Create hover)
- **`top-nav.tsx`**: Removed hover `translate-y` on the Create (new post) control so the icon stays sharp over the glass header; `NavTooltip` no longer animates with `filter: blur()` so the “Create” label stays crisp.

## 2026-04-12 (thread page polish: layout, header, composer, comments, sidebar)
- **`discussion-page-client.tsx`**: 3-column layout at `lg` (was `xl`); main thread body capped at `max-w-[720px]`.
- **`thread-header.tsx`**: Restructured header — category badge, bold title, subtitle line, author row with relative time, stats row (reads/comments/upvotes), `--border-default` divider, action bar with cyan glow on active upvote/bookmark, Share/More right-aligned.
- **`thread-composer.tsx`**: Wired to `createComment` Convex mutation with loading spinner and inline error; expand-on-focus textarea; toolbar shows only on focus; "Login to reply" for unauthenticated users.
- **`thread-comments.tsx`**: Sort tabs match TrendSorter pill style (sliding cyan indicator); comment cards use `rounded-xl` with author/time row and action divider; nested replies use `border-l-2` thread line at `ml-6/8`; polished empty state.
- **`thread-sidebar.tsx`**: Three card-wrapped sections — Author (bio, points badge, Follow), Related (max 5), Trending (max 5); breakpoint `xl` → `lg`; Insight sheet button matches.
- **Validation:** `pnpm --filter ./apps/forum typecheck`, `lint` (1 pre-existing warning only).

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

