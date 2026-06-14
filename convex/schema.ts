import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/** Shared validator fields for all rich thread payload variants. Deeply nested
 *  structures (comments, insightRail, categoryBody) remain `v.any()` since they
 *  vary widely and are only written by seed scripts. */
const richThreadBase = {
  id: v.string(),
  slug: v.string(),
  title: v.string(),
  body: v.string(),
  authorId: v.string(),
  createdAt: v.string(),
  updatedAt: v.optional(v.string()),
  views: v.number(),
  upvotes: v.number(),
  bookmarks: v.number(),
  tags: v.array(v.string()),
  aiSummary: v.string(),
  comments: v.array(v.any()),
  insightRail: v.any(),
  relatedSlugs: v.array(v.string()),
  trendingSlugs: v.array(v.string()),
  categoryBody: v.any(),
};

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
    moderationStatus: v.optional(v.union(
      v.literal("visible"),
      v.literal("flagged"),
      v.literal("removed"),
      v.literal("shadow_removed"),
    )),
    /** Denormalized searchable tags from category payloads (e.g. gigs skills, review product names). */
    searchTags: v.optional(v.array(v.string())),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_author", ["authorProfileId"])
    .index("by_legacy_key", ["legacyKey"])
    .index("by_createdAt", ["createdAt"])
    .index("by_category_createdAt", ["category", "createdAt"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["category"] })
    .searchIndex("search_body", { searchField: "body", filterFields: ["category"] }),

  /** Rich threads written only by seed scripts — payload shape validated by discriminated union on `category`. */
  forumRichThreads: defineTable({
    slug: v.string(),
    payload: v.union(
      v.object({ ...richThreadBase, category: v.literal("news") }),
      v.object({ ...richThreadBase, category: v.literal("review") }),
      v.object({ ...richThreadBase, category: v.literal("compare") }),
      v.object({ ...richThreadBase, category: v.literal("launch-pad") }),
      v.object({ ...richThreadBase, category: v.literal("debate") }),
      // Temporary widen for the help -> qa migration. Remove after all old rows are migrated.
      v.object({ ...richThreadBase, category: v.literal("help") }),
      v.object({ ...richThreadBase, category: v.literal("qa") }),
      v.object({ ...richThreadBase, category: v.literal("list") }),
      v.object({ ...richThreadBase, category: v.literal("showcase") }),
      v.object({ ...richThreadBase, category: v.literal("gigs") }),
    ),
  }).index("by_slug", ["slug"]),

  forumPostComments: defineTable({
    postId: v.id("forumPosts"),
    authorProfileId: v.id("forumProfiles"),
    body: v.string(),
    createdAt: v.number(),
    upvotes: v.number(),
    parentId: v.optional(v.id("forumPostComments")),
  })
    .index("by_post", ["postId"])
    .index("by_post_createdAt", ["postId", "createdAt"])
    .index("by_parent", ["parentId"]),

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
      v.literal("createComment"),
      v.literal("toggleUpvote"),
      v.literal("toggleFavorite"),
      v.literal("createReport"),
    ),
    count: v.number(),
    windowStartMs: v.number(),
  }).index("by_user_kind", ["userId", "kind"]),

  forumFeedCache: defineTable({
    cacheKey: v.string(),
    postIds: v.array(v.string()),
    computedAt: v.number(),
  }).index("by_key", ["cacheKey"]),

  forumReports: defineTable({
    reporterId: v.id("forumProfiles"),
    contentType: v.union(v.literal("post"), v.literal("comment")),
    contentId: v.string(),
    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("misinformation"),
      v.literal("off_topic"),
      v.literal("other"),
    ),
    details: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("reviewed"), v.literal("dismissed")),
    createdAt: v.number(),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_content", ["contentType", "contentId"])
    .index("by_status_createdAt", ["status", "createdAt"]),

  forumModActions: defineTable({
    moderatorId: v.id("forumProfiles"),
    action: v.union(
      v.literal("remove_post"),
      v.literal("restore_post"),
      v.literal("remove_comment"),
      v.literal("flag_post"),
      v.literal("dismiss_report"),
    ),
    contentId: v.string(),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_moderator", ["moderatorId"])
    .index("by_content", ["contentId"]),

  /** Per-category structured payloads for real user posts. */
  forumCategoryPayloads: defineTable({
    postId: v.id("forumPosts"),
    category: v.string(),
    payload: v.union(
      // Gigs payload
      v.object({
        roleTitle: v.string(),
        employment: v.string(),
        location: v.string(),
        budget: v.optional(v.string()),
        duration: v.optional(v.string()),
        requiredSkills: v.array(v.string()),
        preferredSkills: v.optional(v.array(v.string())),
        posterNote: v.optional(v.string()),
        isOpen: v.optional(v.boolean()),
        applicantCount: v.optional(v.number()),
        processStage: v.optional(v.string()),
        stages: v.optional(v.array(v.string())),
      }),
      // Review payload
      v.object({
        productName: v.string(),
        productUrl: v.optional(v.string()),
        verdict: v.string(),
        starRating: v.number(),
        reviewerContextNote: v.optional(v.string()),
        verdictRationale: v.optional(v.string()),
        criteria: v.optional(v.array(v.object({
          id: v.string(),
          label: v.string(),
          score: v.number(),
          maxScore: v.number(),
          weightPercent: v.number(),
        }))),
        reviewerContextMax: v.optional(v.any()),
        sentiment: v.optional(v.any()),
        productLogo: v.optional(v.string()),
      }),
      // Fallback for other categories
      v.any(),
    ),
    version: v.number(),
  }).index("by_post", ["postId"]),

  /** Sharded counters to avoid OCC conflicts on high-churn fields (upvotes, views). */
  forumCounterShards: defineTable({
    entityId: v.string(),
    entityType: v.string(),    // "post"
    counterType: v.string(),   // "upvotes" or "views"
    shardKey: v.number(),      // 0–9 for upvotes, 0–4 for views
    count: v.number(),
  })
    .index("by_entity_counter_shard", ["entityId", "counterType", "shardKey"])
    .index("by_entity_counter", ["entityId", "counterType"]),

  /** Analytics events for tracking user behavior. */
  forumAnalyticsEvents: defineTable({
    eventType: v.string(),
    profileId: v.optional(v.id("forumProfiles")),
    postId: v.optional(v.id("forumPosts")),
    category: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    sessionId: v.optional(v.string()),
  })
    .index("by_eventType_createdAt", ["eventType", "createdAt"])
    .index("by_post_eventType", ["postId", "eventType"]),

  /** Daily aggregated analytics for admin dashboards. */
  forumDailyStats: defineTable({
    date: v.string(),          // YYYY-MM-DD
    category: v.optional(v.string()),
    eventType: v.string(),
    count: v.number(),
  })
    .index("by_date_category", ["date", "category"])
    .index("by_date_eventType", ["date", "eventType"]),
});
