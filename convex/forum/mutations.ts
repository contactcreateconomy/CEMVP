import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { mutation } from "../_generated/server";
import { insertMissingForumCategories } from "./seed/ensureCategoryRows";
import { slugify } from "./seed/generatePosts";
import {
  MAX_COMMENT_BODY_LEN,
  MAX_POST_BODY_LEN,
  MAX_POST_SUMMARY_LEN,
  MAX_POST_TITLE_LEN,
  MAX_PROFILE_BIO_LEN,
  MAX_PROFILE_HANDLE_LEN,
  MAX_PROFILE_NAME_LEN,
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
    let categoryRow = await ctx.db
      .query("forumCategories")
      .withIndex("by_key", (q) => q.eq("key", catKey))
      .unique();
    if (!categoryRow) {
      await insertMissingForumCategories(ctx);
      categoryRow = await ctx.db
        .query("forumCategories")
        .withIndex("by_key", (q) => q.eq("key", catKey))
        .unique();
    }
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

/**
 * Same catalog insert as `forum/seed:ensureForumCategories` (CLI / internal).
 * Callable from the forum client so production self-heals when `forumCategories` is empty.
 * Idempotent; no auth required (static taxonomy only).
 */
export const ensureForumCategories = mutation({
  args: {},
  returns: v.object({ inserted: v.number(), skipped: v.number() }),
  handler: async (ctx) => insertMissingForumCategories(ctx),
});

export const createComment = mutation({
  args: {
    postId: v.id("forumPosts"),
    body: v.string(),
  },
  returns: v.id("forumPostComments"),
  handler: async (ctx, { postId, body }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to comment.");
    }
    await consumeWriteBucket(ctx, userId, "createComment");

    const b = body.trim();
    if (!b.length) {
      throw new Error("Comment body is required.");
    }
    if (b.length > MAX_COMMENT_BODY_LEN) {
      throw new Error(`Comment must be at most ${MAX_COMMENT_BODY_LEN} characters.`);
    }

    const post = await ctx.db.get(postId);
    if (!post) {
      throw new Error("Post not found.");
    }
    if (post.locked) {
      throw new Error("This discussion is locked.");
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

    const commentId = await ctx.db.insert("forumPostComments", {
      postId,
      authorProfileId: profile._id,
      body: b,
      createdAt: Date.now(),
      upvotes: 0,
    });

    await ctx.db.patch(postId, { commentsCount: post.commentsCount + 1 });

    return commentId;
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
    handle: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Sign in to update your profile.");
    }

    const profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) {
      throw new Error("Profile not found.");
    }

    const patch: Record<string, unknown> = {};

    if (args.name !== undefined) {
      const n = args.name.trim();
      if (!n.length) {
        throw new Error("Name cannot be empty.");
      }
      if (n.length > MAX_PROFILE_NAME_LEN) {
        throw new Error(`Name must be at most ${MAX_PROFILE_NAME_LEN} characters.`);
      }
      patch.name = n;
    }

    if (args.bio !== undefined) {
      const b = args.bio.trim();
      if (b.length > MAX_PROFILE_BIO_LEN) {
        throw new Error(`Bio must be at most ${MAX_PROFILE_BIO_LEN} characters.`);
      }
      patch.bio = b;
    }

    if (args.image !== undefined) {
      patch.image = args.image.trim();
    }

    if (args.handle !== undefined) {
      const h = args.handle.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/^-|-$/g, "");
      if (!h.length) {
        throw new Error("Handle cannot be empty.");
      }
      if (h.length > MAX_PROFILE_HANDLE_LEN) {
        throw new Error(`Handle must be at most ${MAX_PROFILE_HANDLE_LEN} characters.`);
      }
      if (h !== profile.handle) {
        const taken = await ctx.db
          .query("forumProfiles")
          .withIndex("by_handle", (q) => q.eq("handle", h))
          .unique();
        if (taken && taken._id !== profile._id) {
          throw new Error("Handle is already taken.");
        }
        patch.handle = h;
      }
    }

    if (Object.keys(patch).length === 0) {
      return null;
    }

    await ctx.db.patch(profile._id, patch);

    // Sync denormalized author fields on existing posts if name/image changed
    if (patch.name || patch.image || patch.handle) {
      const posts = await ctx.db
        .query("forumPosts")
        .withIndex("by_author", (q) => q.eq("authorProfileId", profile._id))
        .collect();
      const authorPatch: Record<string, string> = {};
      if (patch.name) authorPatch.authorName = patch.name as string;
      if (patch.handle) authorPatch.authorHandle = patch.handle as string;
      if (patch.image !== undefined) authorPatch.authorImage = patch.image as string;
      if (Object.keys(authorPatch).length > 0) {
        await Promise.all(posts.map((p) => ctx.db.patch(p._id, authorPatch)));
      }
    }

    return null;
  },
});
