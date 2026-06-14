import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { insertMissingForumCategories } from "../seed/ensureCategoryRows";
import { slugify } from "../seed/generatePosts";
import {
  MAX_COMMENT_BODY_LEN,
  MAX_POST_BODY_LEN,
  MAX_POST_SUMMARY_LEN,
  MAX_POST_TITLE_LEN,
} from "../limits";

export interface InsertPostAsProfileArgs {
  profileId: Id<"forumProfiles">;
  title: string;
  summary: string;
  body: string;
  category: string;
  coverImage?: string;
}

export async function insertPostAsProfile(
  ctx: MutationCtx,
  args: InsertPostAsProfileArgs,
): Promise<Id<"forumPosts">> {
  const profile = await ctx.db.get(args.profileId);
  if (!profile) {
    throw new Error("Persona profile not found.");
  }

  const t = args.title.trim();
  const s = args.summary.trim() || t;
  const b = args.body.trim();
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

  const requestedCategory = args.category.trim();
  const catKey = requestedCategory === "help" ? "qa" : requestedCategory;
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
  const newPostId = await ctx.db.insert("forumPosts", {
    slug,
    title: t,
    summary: s,
    body: b,
    coverImage: args.coverImage,
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
    moderationStatus: "visible",
  });

  await ctx.db.insert("forumAnalyticsEvents", {
    eventType: "post_created",
    profileId: profile._id,
    postId: newPostId,
    category: catKey,
    createdAt: now,
    metadata: { source: "persona_automation" },
  });

  return newPostId;
}

export interface InsertCommentAsProfileArgs {
  profileId: Id<"forumProfiles">;
  postId: Id<"forumPosts">;
  body: string;
  parentId?: Id<"forumPostComments">;
}

export async function insertCommentAsProfile(
  ctx: MutationCtx,
  args: InsertCommentAsProfileArgs,
): Promise<Id<"forumPostComments">> {
  const profile = await ctx.db.get(args.profileId);
  if (!profile) {
    throw new Error("Persona profile not found.");
  }

  const b = args.body.trim();
  if (!b.length) {
    throw new Error("Comment body is required.");
  }
  if (b.length > MAX_COMMENT_BODY_LEN) {
    throw new Error(`Comment must be at most ${MAX_COMMENT_BODY_LEN} characters.`);
  }

  const post = await ctx.db.get(args.postId);
  if (!post) {
    throw new Error("Post not found.");
  }
  if (post.locked) {
    throw new Error("This discussion is locked.");
  }

  if (args.parentId !== undefined) {
    const parent = await ctx.db.get(args.parentId);
    if (!parent || parent.postId !== args.postId) {
      throw new Error("Reply target not found or belongs to a different post");
    }
    if (parent.parentId !== undefined) {
      throw new Error("Cannot reply to a reply — maximum depth is 2");
    }
  }

  const commentId = await ctx.db.insert("forumPostComments", {
    postId: args.postId,
    authorProfileId: profile._id,
    body: b,
    createdAt: Date.now(),
    upvotes: 0,
    parentId: args.parentId,
  });

  await ctx.db.patch(args.postId, { commentsCount: post.commentsCount + 1 });

  if (post.authorProfileId !== profile._id) {
    await ctx.db.insert("forumNotifications", {
      profileId: post.authorProfileId,
      type: "comment",
      title: "New comment on your post",
      message: `${profile.name} commented on "${post.title}"`,
      createdAt: new Date().toISOString(),
      read: false,
      postSlug: post.slug,
    });
  }

  await ctx.db.insert("forumAnalyticsEvents", {
    eventType: "comment_created",
    profileId: profile._id,
    postId: args.postId,
    category: post.category,
    createdAt: Date.now(),
    metadata: { source: "persona_automation" },
  });

  return commentId;
}
