# Documentation index

Use this folder when onboarding, debugging, or (for AI agents) grounding work in the repo. Paths are relative to the repository root.

| Document | Purpose |
|----------|---------|
| [overview.md](overview.md) | What this monorepo is, main apps, how forum + Convex fit together. |
| [architecture.md](architecture.md) | **Architecture diagram**, deployment context, **software stack and declared versions** (Next, React, Convex, Tailwind, TipTap, ESLint, pnpm, Node). |
| [quick-start.md](quick-start.md) | Install, env vars, local dev, Convex push, forum seed — minimal steps to run. |
| [schema-forum.md](schema-forum.md) | Convex `forum*` tables, indexes, relationships; auth-linked vs seed-only data. |
| [forum-capacity.md](forum-capacity.md) | Scaling posture, force-seed after schema changes, operations checklist. |
| [production-convex.md](production-convex.md) | **Prod deploy**, category-only bootstrap (`ensureForumCategories`), no full seed on prod. |

**Convex generated agent rules:** `convex/_generated/ai/guidelines.md` (read before editing Convex functions).

**Root README:** [../README.md](../README.md) — environment variables, OAuth, deployment notes.

**Repo agent instructions:** [../CLAUDE.md](../CLAUDE.md), [../AGENTS.md](../AGENTS.md).
