import { v } from "convex/values";

import { internal } from "../../_generated/api";
import { internalMutation } from "../../_generated/server";
import { incrementPersonaPostCount, incrementPostsGeneratedToday } from "./configHelpers";
import { insertCommentAsProfile, insertPostAsProfile } from "./publishHelpers";

export const publishApprovedDraftInternal = internalMutation({
  args: {
    draftId: v.id("forumContentDrafts"),
    reviewedByUserId: v.optional(v.id("users")),
  },
  returns: v.object({
    postId: v.union(v.id("forumPosts"), v.null()),
    commentId: v.union(v.id("forumPostComments"), v.null()),
  }),
  handler: async (ctx, { draftId, reviewedByUserId }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) {
      throw new Error("Draft not found.");
    }
    if (draft.status !== "approved") {
      throw new Error("Draft must be approved before publishing.");
    }

    const persona = await ctx.db.get(draft.personaId);
    if (!persona) {
      throw new Error("Persona not found.");
    }

    const now = Date.now();
    let postId = draft.publishedPostId ?? null;
    let commentId = draft.publishedCommentId ?? null;

    if (draft.kind === "post") {
      if (!draft.title || !draft.category) {
        throw new Error("Post draft missing title or category.");
      }
      postId = await insertPostAsProfile(ctx, {
        profileId: persona.profileId,
        title: draft.title,
        summary: draft.summary ?? draft.title,
        body: draft.body,
        category: draft.category,
      });
      await incrementPersonaPostCount(ctx, persona._id);

      const config = await ctx.db
        .query("forumAutomationConfig")
        .withIndex("by_key", (q) => q.eq("key", "default"))
        .unique();
      if (config) {
        await incrementPostsGeneratedToday(ctx, config._id);
      }

      await ctx.db.patch(draftId, {
        status: "published",
        publishedPostId: postId,
        reviewedByUserId,
        reviewedAt: now,
        updatedAt: now,
      });

      await ctx.scheduler.runAfter(0, internal.forum.personas.scheduler.scheduleCommentDraftsForPost, {
        postId,
        authorPersonaId: persona._id,
      });
    } else {
      if (!draft.targetPostId) {
        throw new Error("Comment draft missing target post.");
      }
      commentId = await insertCommentAsProfile(ctx, {
        profileId: persona.profileId,
        postId: draft.targetPostId,
        body: draft.body,
      });
      await ctx.db.patch(draftId, {
        status: "published",
        publishedCommentId: commentId,
        reviewedByUserId,
        reviewedAt: now,
        updatedAt: now,
      });
    }

    await ctx.db.insert("forumAutomationRuns", {
      runType: "publish_draft",
      personaId: persona._id,
      draftId,
      success: true,
      createdAt: now,
    });

    return { postId, commentId };
  },
});
