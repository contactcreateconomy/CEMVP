# Ecosystem Integration Boundary

This document outlines how the forum app integrates with the broader Createconomy ecosystem (seller, marketplace, creator apps).

## Identity Mapping

- **Current**: Forum uses `forumProfiles` table with fields: `userId`, `handle`, `name`, `image`, `bio`, `level`, `points`, `streakDays`, `role`.
- **Future**: `PlatformIdentity` type (see `apps/forum/src/types/platform.ts`) will bridge forum profiles to cross-app identity.
- **Mapping strategy**: `forumProfiles.userId` maps to `users._id`. When seller/marketplace apps launch, a shared `users` table (already exists in the Convex schema) becomes the single source of truth. Each app adds its own profile table (`forumProfiles`, `sellerProfiles`, etc.).

## Content References

- **Type**: `ContentReference` (see `apps/forum/src/types/platform.ts`)
- **Usage**: Category payloads can include `contentReferences` to link to cross-app entities:
  - Gigs posts can reference marketplace listings
  - Review posts can reference seller products
  - Launch-pad posts can reference creator portfolios
- **Added to**: `DiscussionThreadBase.contentReferences` (optional array)

## Convex Deployment Strategy

**Decision: Single Convex deployment with domain-separated table prefixes.**

- All apps share one Convex deployment (current: `watchful-chameleon-570` / `energetic-kangaroo-55`).
- Tables are prefixed by domain: `forum*`, `seller*`, `marketplace*`, `creator*`.
- Cross-app queries are possible (e.g., a forum post can look up a marketplace listing by ID).
- Shared infrastructure tables: `users`, `memberships`, and any future `notifications`, `analytics` tables.

### Why not separate deployments?

- Cross-app references (`ContentReference`) need to resolve in real time.
- Shared auth (`users` table, Convex Auth) keeps login sessions consistent.
- Lower operational complexity at the current stage.

## Table Ownership

| Prefix | Owner App | Notes |
|--------|-----------|-------|
| `forum*` | Forum | Full CRUD ownership |
| `seller*` | Seller | Not yet created |
| `marketplace*` | Marketplace | Not yet created |
| `creator*` | Creator | Not yet created |
| `users` | Shared | Auth identity, managed by Convex Auth |
| `memberships` | Shared | App-role mappings |

## Migration Path

When a new app joins the ecosystem:

1. Add new `seller*` / `marketplace*` tables to the shared schema.
2. Create the app's profile table with a `userId` foreign key to `users`.
3. Add app-specific routes and permissions.
4. Cross-app content references just work (same deployment, same query runtime).
