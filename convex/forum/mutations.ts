import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation } from "../_generated/server";
import { slugify } from "./seed/generatePosts";
import {
  MAX_POST_BODY_LEN,
  MAX_POST_SUMMARY_LEN,
  MAX_POST_TITLE_LEN,
} from "./limits";
import { consumeWriteBucket } from "./rateLimit";

export const ensureForumProfile = mutation({
  args: {},
  returns: v.union(v.id("forumProfiles"), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const existing = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      return existing._id;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    const handle = (user.handle ?? `user-${userId.slice(-6)}`).toLowerCase();
    const name = user.name?.trim() || handle;
    const image = typeof user.image === "string" ? user.image : "";
    return await ctx.db.insert("forumProfiles", {
      userId,
      handle,
      name,
      image,
      bio: "",
      level: 1,
      points: 0,
      streakDays: 0,
      role: "member",
    });
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    category: v.string(),
    coverImage: v.optional(v.string()),
  },
  returns: v.id("forumPosts"),
  handler: async (ctx, { title, summary, body, category, coverImage }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to publish.");
    }
    await consumeWriteBucket(ctx, userId, "createPost");

    const t = title.trim();
    const s = summary.trim() || t;
    const b = body.trim();
    if (!t.length) {
      throw new Error("Title is required.");
    }
    if (t.length > MAX_POST_TITLE_LEN) {
      throw new Error(`Title must be at most ${MAX_POST_TITLE_LEN} characters.`);
    }
    if (s.length > MAX_POST_SUMMARY_LEN) {
      throw new Error(`Summary must be at most ${MAX_POST_SUMMARY_LEN} characters.`);
    }
    if (b.length > MAX_POST_BODY_LEN) {
      throw new Error(`Body must be at most ${MAX_POST_BODY_LEN} characters.`);
    }

    const catKey = category.trim();
    const categoryRow = await ctx.db
      .query("forumCategories")
      .withIndex("by_key", (q) => q.eq("key", catKey))
      .unique();
    if (!categoryRow) {
      throw new Error("Unknown category.");
    }

    let profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) {
      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error("User record missing.");
      }
      const handle = (user.handle ?? `user-${userId.slice(-6)}`).toLowerCase();
      const pid = await ctx.db.insert("forumProfiles", {
        userId,
        handle,
        name: user.name?.trim() || handle,
        image: typeof user.image === "string" ? user.image : "",
        bio: "",
        level: 1,
        points: 0,
        streakDays: 0,
        role: "member",
      });
      profile = await ctx.db.get(pid);
      if (!profile) {
        throw new Error("Could not create forum profile.");
      }
    }

    const base = slugify(t);
    let slug = base || "post";
    let suffix = 0;
    while (
      await ctx.db
        .query("forumPosts")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique()
    ) {
      suffix += 1;
      slug = `${base}-${suffix}`;
    }
    const now = Date.now();
    return await ctx.db.insert("forumPosts", {
      slug,
      title: t,
      summary: s,
      body: b,
      coverImage,
      category: catKey,
      authorProfileId: profile._id,
      authorName: profile.name,
      authorHandle: profile.handle,
      authorImage: profile.image,
      upvotes: 0,
      commentsCount: 0,
      views: 0,
      createdAt: now,
      trending: "recent",
      locked: false,
      isRichThread: false,
    });
  },
});

export const toggleFavorite = mutation({
  args: { postId: v.id("forumPosts") },
  returns: v.object({ favorited: v.boolean() }),
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to save favorites.");
    }
    await consumeWriteBucket(ctx, userId, "toggleFavorite");
    const existing = await ctx.db
      .query("forumFavorites")
      .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", postId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }
    await ctx.db.insert("forumFavorites", {
      userId,
      postId,
      favoritedAt: Date.now(),
    });
    return { favorited: true };
  },
});

export const toggleUpvote = mutation({
  args: { postId: v.id("forumPosts") },
  returns: v.object({ upvoted: v.boolean() }),
  handler: async (ctx, { postId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to upvote.");
    }
    await consumeWriteBucket(ctx, userId, "toggleUpvote");
    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    const existing = await ctx.db
      .query("forumUpvotes")
      .withIndex("by_user_post", (q) => q.eq("userId", userId).eq("postId", postId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      await ctx.db.patch(postId, { upvotes: Math.max(0, post.upvotes - 1) });
      return { upvoted: false };
    }
    await ctx.db.insert("forumUpvotes", { userId, postId });
    await ctx.db.patch(postId, { upvotes: post.upvotes + 1 });
    return { upvoted: true };
  },
});

export const updateViewerSettings = mutation({
  args: {
    theme: v.optional(v.union(v.literal("dark"), v.literal("light"), v.literal("system"))),
    emailNotifications: v.optional(v.boolean()),
    pushNotifications: v.optional(v.boolean()),
    hideMatureContent: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to update settings.");
    }
    const existing = await ctx.db
      .query("forumUserSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    const patch = {
      theme: args.theme,
      emailNotifications: args.emailNotifications,
      pushNotifications: args.pushNotifications,
      hideMatureContent: args.hideMatureContent,
    };
    const cleaned = Object.fromEntries(
      Object.entries(patch).filter(([, val]) => val !== undefined),
    ) as Record<string, unknown>;
    if (existing) {
      await ctx.db.patch(existing._id, cleaned);
    } else {
      await ctx.db.insert("forumUserSettings", {
        userId,
        theme: (args.theme ?? "dark") as "dark" | "light" | "system",
        emailNotifications: args.emailNotifications ?? true,
        pushNotifications: args.pushNotifications ?? true,
        hideMatureContent: args.hideMatureContent ?? false,
      });
    }
    return null;
  },
});

export const markNotificationRead = mutation({
  args: { notificationId: v.id("forumNotifications") },
  returns: v.null(),
  handler: async (ctx, { notificationId }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in required.");
    }
    const profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) {
      return null;
    }
    const n = await ctx.db.get(notificationId);
    if (!n || n.profileId !== profile._id) {
      return null;
    }
    await ctx.db.patch(notificationId, { read: true });
    return null;
  },
});
