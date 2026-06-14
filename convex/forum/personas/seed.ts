import { v } from "convex/values";

import { internalMutation } from "../../_generated/server";
import { getOrCreateAutomationConfig } from "./configHelpers";
import { personaProfileSeeds, personaSkillSeeds } from "./seedData";
import { insertMissingForumCategories } from "../seed/ensureCategoryRows";

export const seedPersonasAndSkills = internalMutation({
  args: { forceProfiles: v.optional(v.boolean()) },
  returns: v.object({
    skillsInserted: v.number(),
    personasInserted: v.number(),
    profilesCreated: v.number(),
  }),
  handler: async (ctx, { forceProfiles = false }) => {
    await insertMissingForumCategories(ctx);

    let skillsInserted = 0;
    const skillIdByKey = new Map<string, import("../../_generated/dataModel").Id<"forumPersonaSkills">>();

    for (const skill of personaSkillSeeds) {
      const existing = await ctx.db
        .query("forumPersonaSkills")
        .withIndex("by_key", (q) => q.eq("key", skill.key))
        .unique();
      if (existing) {
        skillIdByKey.set(skill.key, existing._id);
        continue;
      }
      const id = await ctx.db.insert("forumPersonaSkills", { ...skill, enabled: true });
      skillIdByKey.set(skill.key, id);
      skillsInserted += 1;
    }

    let personasInserted = 0;
    let profilesCreated = 0;

    for (const seed of personaProfileSeeds) {
      const skillId = skillIdByKey.get(seed.skillKey);
      if (!skillId) continue;

      let profile = await ctx.db
        .query("forumProfiles")
        .withIndex("by_seed_key", (q) => q.eq("seedKey", seed.seedKey))
        .unique();

      if (!profile) {
        const profileId = await ctx.db.insert("forumProfiles", {
          seedKey: seed.seedKey,
          handle: seed.handle,
          name: seed.name,
          image: seed.image,
          bio: seed.bio,
          level: seed.level,
          points: seed.points,
          streakDays: seed.streakDays,
          role: "member",
          managedByAutomation: true,
        });
        profile = await ctx.db.get(profileId);
        profilesCreated += 1;
      } else if (forceProfiles) {
        await ctx.db.patch(profile._id, {
          name: seed.name,
          handle: seed.handle,
          image: seed.image,
          bio: seed.bio,
          managedByAutomation: true,
        });
      }

      if (!profile) continue;

      const existingPersona = await ctx.db
        .query("forumPersonas")
        .withIndex("by_profile", (q) => q.eq("profileId", profile._id))
        .unique();

      if (existingPersona) {
        await ctx.db.patch(existingPersona._id, {
          skillId,
          displayName: seed.name,
          active: seed.active,
        });
        continue;
      }

      await ctx.db.insert("forumPersonas", {
        profileId: profile._id,
        seedKey: seed.seedKey,
        displayName: seed.name,
        skillId,
        active: seed.active,
        postsTodayCount: 0,
        dailyPostLimit: 1,
      });
      personasInserted += 1;
    }

    await getOrCreateAutomationConfig(ctx);

    return { skillsInserted, personasInserted, profilesCreated };
  },
});
