import { v } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import { mutation, query } from "../../_generated/server";
import { requirePersonaAdmin } from "./auth";
import { insertPostAsProfile } from "./publishHelpers";
import { adminPostValidator, adminReportValidator } from "./validators";

export const listPostsForAdmin = query({
  args: {
    limit: v.optional(v.number()),
    moderationStatus: v.optional(
      v.union(
        v.literal("visible"),
        v.literal("flagged"),
        v.literal("removed"),
        v.literal("shadow_removed"),
      ),
    ),
  },
  returns: v.array(adminPostValidator),
  handler: async (ctx, { limit = 50, moderationStatus }) => {
    await requirePersonaAdmin(ctx);
    const cap = Math.min(Math.max(limit, 1), 200);
    const rows = await ctx.db
      .query("forumPosts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(cap);

    const filtered = moderationStatus
      ? rows.filter((r) => (r.moderationStatus ?? "visible") === moderationStatus)
      : rows;

    const out = [];
    for (const row of filtered) {
      const profile = await ctx.db.get(row.authorProfileId);
      out.push({
        id: row._id as string,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        category: row.category,
        authorName: row.authorName ?? profile?.name ?? "Unknown",
        authorHandle: row.authorHandle ?? profile?.handle ?? "unknown",
        moderationStatus: row.moderationStatus ?? "visible",
        upvotes: row.upvotes,
        commentsCount: row.commentsCount,
        views: row.views,
        createdAt: row.createdAt,
        managedByAutomation: profile?.managedByAutomation ?? false,
      });
    }
    return out;
  },
});

export const listReportsForAdmin = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(adminReportValidator),
  handler: async (ctx, { limit = 50 }) => {
    await requirePersonaAdmin(ctx);
    const cap = Math.min(Math.max(limit, 1), 200);
    const rows = await ctx.db
      .query("forumReports")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(cap);

    const out = [];
    for (const report of rows) {
      const reporter = await ctx.db.get(report.reporterId);
      let contentPreview: string | null = null;
      if (report.contentType === "post") {
        const post = await ctx.db.get(report.contentId as Id<"forumPosts">);
        contentPreview = post ? `${post.title}: ${post.summary}` : null;
      } else {
        const comment = await ctx.db.get(report.contentId as Id<"forumPostComments">);
        contentPreview = comment?.body.slice(0, 200) ?? null;
      }
      out.push({
        id: report._id as string,
        contentType: report.contentType,
        contentId: report.contentId as string,
        reason: report.reason,
        details: report.details ?? null,
        status: report.status,
        createdAt: report.createdAt,
        reporterName: reporter?.name ?? null,
        contentPreview,
      });
    }
    return out;
  },
});

export const adminCreatePost = mutation({
  args: {
    personaId: v.optional(v.id("forumPersonas")),
    profileId: v.optional(v.id("forumProfiles")),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    category: v.string(),
  },
  returns: v.id("forumPosts"),
  handler: async (ctx, args) => {
    await requirePersonaAdmin(ctx);

    let profileId = args.profileId;
    if (args.personaId) {
      const persona = await ctx.db.get(args.personaId);
      if (!persona) throw new Error("Persona not found.");
      profileId = persona.profileId;
    }
    if (!profileId) throw new Error("Provide personaId or profileId.");

    return await insertPostAsProfile(ctx, {
      profileId,
      title: args.title,
      summary: args.summary,
      body: args.body,
      category: args.category,
    });
  },
});

export const adminSetPostModeration = mutation({
  args: {
    postId: v.id("forumPosts"),
    moderationStatus: v.union(
      v.literal("visible"),
      v.literal("flagged"),
      v.literal("removed"),
      v.literal("shadow_removed"),
    ),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { postId, moderationStatus, reason }) => {
    const { userId } = await requirePersonaAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found.");

    await ctx.db.patch(postId, { moderationStatus });

    const profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      const modAction =
        moderationStatus === "visible"
          ? "restore_post"
          : moderationStatus === "flagged"
            ? "flag_post"
            : "remove_post";
      await ctx.db.insert("forumModActions", {
        moderatorId: profile._id,
        action: modAction,
        contentId: postId as string,
        reason: reason ?? "Admin console action",
        createdAt: Date.now(),
      });
    }

    return null;
  },
});

export const adminDeletePost = mutation({
  args: { postId: v.id("forumPosts"), reason: v.optional(v.string()) },
  returns: v.null(),
  handler: async (ctx, { postId, reason }) => {
    const { userId } = await requirePersonaAdmin(ctx);
    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found.");

    await ctx.db.patch(postId, { moderationStatus: "removed" });

    const profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.insert("forumModActions", {
        moderatorId: profile._id,
        action: "remove_post",
        contentId: postId as string,
        reason: reason ?? "Deleted by admin",
        createdAt: Date.now(),
      });
    }

    return null;
  },
});

export const adminModerateReport = mutation({
  args: {
    reportId: v.id("forumReports"),
    action: v.union(
      v.literal("remove_post"),
      v.literal("restore_post"),
      v.literal("flag_post"),
      v.literal("dismiss_report"),
    ),
    reason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { reportId, action, reason }) => {
    const { userId } = await requirePersonaAdmin(ctx);
    const report = await ctx.db.get(reportId);
    if (!report) throw new Error("Report not found.");

    const profile = await ctx.db
      .query("forumProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (action === "remove_post" && report.contentType === "post") {
      await ctx.db.patch(report.contentId as Id<"forumPosts">, { moderationStatus: "removed" });
      await ctx.db.patch(reportId, { status: "reviewed" });
    } else if (action === "restore_post" && report.contentType === "post") {
      await ctx.db.patch(report.contentId as Id<"forumPosts">, { moderationStatus: "visible" });
      await ctx.db.patch(reportId, { status: "reviewed" });
    } else if (action === "flag_post" && report.contentType === "post") {
      await ctx.db.patch(report.contentId as Id<"forumPosts">, { moderationStatus: "flagged" });
      await ctx.db.patch(reportId, { status: "reviewed" });
    } else if (action === "dismiss_report") {
      await ctx.db.patch(reportId, { status: "dismissed" });
    }

    if (profile) {
      await ctx.db.insert("forumModActions", {
        moderatorId: profile._id,
        action,
        contentId: report.contentId,
        reason,
        createdAt: Date.now(),
      });
    }

    return null;
  },
});
