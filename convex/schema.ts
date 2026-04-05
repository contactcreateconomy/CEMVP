import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const appId = v.union(
  v.literal("forum"),
  v.literal("seller"),
  v.literal("admin"),
  v.literal("marketplace"),
);

export default defineSchema({
  ...authTables,
  // Extends Convex Auth `users` — must keep auth fields + email/phone indexes.
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    handle: v.optional(v.string()),
    defaultApp: v.optional(appId),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_handle", ["handle"]),
  memberships: defineTable({
    userId: v.id("users"),
    app: appId,
    role: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_app", ["app"])
    .index("by_app_role", ["app", "role"]),

  forumProfiles: defineTable({
    userId: v.optional(v.id("users")),
    /** Stable seed key e.g. u1 — used only when remapping thread payloads */
    seedKey: v.optional(v.string()),
    handle: v.string(),
    name: v.string(),
    image: v.string(),
    bio: v.string(),
    level: v.number(),
    points: v.number(),
    streakDays: v.number(),
    verified: v.optional(v.boolean()),
    role: v.union(v.literal("member"), v.literal("moderator"), v.literal("admin")),
  })
    .index("by_handle", ["handle"])
    .index("by_user", ["userId"])
    .index("by_seed_key", ["seedKey"])
    .searchIndex("search_name", { searchField: "name" }),

  forumCategories: defineTable({
    key: v.string(),
    name: v.string(),
    icon: v.string(),
    description: v.string(),
    primaryColor: v.string(),
    lockedByDefault: v.boolean(),
    pointsToUnlock: v.optional(v.number()),
  }).index("by_key", ["key"]),

  forumPosts: defineTable({
    slug: v.string(),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    coverImage: v.optional(v.string()),
    category: v.string(),
    authorProfileId: v.id("forumProfiles"),
    /** Denormalized for feed cards — avoids loading all profiles. */
    authorName: v.optional(v.string()),
    authorHandle: v.optional(v.string()),
    authorImage: v.optional(v.string()),
    upvotes: v.number(),
    commentsCount: v.number(),
    views: v.number(),
    createdAt: v.number(),
    trending: v.union(v.literal("hot"), v.literal("recent"), v.literal("evergreen")),
    locked: v.boolean(),
    isRichThread: v.boolean(),
    /** Matches old mock id (p1, …) for hero carousel join */
    legacyKey: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_author", ["authorProfileId"])
    .index("by_legacy_key", ["legacyKey"])
    .index("by_createdAt", ["createdAt"])
    .index("by_category_createdAt", ["category", "createdAt"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["category"] })
    .searchIndex("search_body", { searchField: "body", filterFields: ["category"] }),

  forumRichThreads: defineTable({
    slug: v.string(),
    payload: v.any(),
  }).index("by_slug", ["slug"]),

  forumPostComments: defineTable({
    postId: v.id("forumPosts"),
    authorProfileId: v.id("forumProfiles"),
    body: v.string(),
    createdAt: v.number(),
    upvotes: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_post_createdAt", ["postId", "createdAt"]),

  forumFavorites: defineTable({
    userId: v.id("users"),
    postId: v.id("forumPosts"),
    /** For paginated saved feed; set on insert. */
    favoritedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_post", ["userId", "postId"])
    .index("by_user_favoritedAt", ["userId", "favoritedAt"]),

  forumUpvotes: defineTable({
    userId: v.id("users"),
    postId: v.id("forumPosts"),
  })
    .index("by_user", ["userId"])
    .index("by_user_post", ["userId", "postId"]),

  forumCampaigns: defineTable({
    title: v.string(),
    description: v.string(),
    rewardPoints: v.number(),
    endsAt: v.string(),
    participants: v.number(),
  }).index("by_endsAt", ["endsAt"]),

  forumLeaderboard: defineTable({
    rank: v.number(),
    profileId: v.id("forumProfiles"),
    points: v.number(),
    weeklyDelta: v.number(),
  }).index("by_rank", ["rank"]),

  forumNotifications: defineTable({
    profileId: v.id("forumProfiles"),
    type: v.union(v.literal("comment"), v.literal("upvote"), v.literal("follow"), v.literal("system")),
    title: v.string(),
    message: v.string(),
    createdAt: v.string(),
    read: v.boolean(),
    postSlug: v.optional(v.string()),
  })
    .index("by_profile", ["profileId"])
    .index("by_profile_createdAt", ["profileId", "createdAt"]),

  forumVibingItems: defineTable({
    kind: v.union(
      v.literal("campaign"),
      v.literal("post"),
      v.literal("discussion"),
      v.literal("update"),
      v.literal("creator"),
    ),
    label: v.string(),
    href: v.string(),
    engagedUsers: v.number(),
    sortOrder: v.number(),
  }).index("by_sort", ["sortOrder"]),

  forumUserSettings: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    hideMatureContent: v.boolean(),
  }).index("by_user", ["userId"]),

  forumHeroSlides: defineTable({
    legacyPostKey: v.string(),
    shares: v.number(),
    eyebrow: v.string(),
    ctaLabel: v.string(),
    accentRgb: v.string(),
    sortOrder: v.number(),
  }).index("by_sort", ["sortOrder"]),

  forumWriteBuckets: defineTable({
    userId: v.id("users"),
    kind: v.union(
      v.literal("createPost"),
      v.literal("toggleUpvote"),
      v.literal("toggleFavorite"),
    ),
    count: v.number(),
    windowStartMs: v.number(),
  }).index("by_user_kind", ["userId", "kind"]),

  forumFeedCache: defineTable({
    cacheKey: v.string(),
    postIds: v.array(v.string()),
    computedAt: v.number(),
  }).index("by_key", ["cacheKey"]),
});
