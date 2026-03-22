import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    authSubject: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    defaultApp: v.optional(v.union(v.literal("forum"), v.literal("seller"), v.literal("admin"), v.literal("marketplace"))),
    roles: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_auth_subject", ["authSubject"]),
  memberships: defineTable({
    userId: v.id("users"),
    app: v.union(v.literal("forum"), v.literal("seller"), v.literal("admin"), v.literal("marketplace")),
    role: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_app", ["app"])
    .index("by_app_role", ["app", "role"]),
});
