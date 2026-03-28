import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function deriveHandle(email: string, name?: string): string {
  if (name?.trim()) {
    const h = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (h) return h.slice(0, 40);
  }
  const local = email.split("@")[0] ?? "user";
  const fromEmail = local.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(0, 40);
  return fromEmail || "user";
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = String(params.email ?? "")
          .trim()
          .toLowerCase();
        const out: { email: string; name?: string } = { email };
        if (typeof params.name === "string" && params.name.trim()) {
          out.name = params.name.trim();
        }
        return out;
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId, existingUserId, profile }) {
      const now = Date.now();
      const email = typeof profile.email === "string" ? profile.email.trim().toLowerCase() : "";
      const name = typeof profile.name === "string" ? profile.name : undefined;
      const handle = deriveHandle(email || "user@local", name);

      if (existingUserId === null) {
        await ctx.db.patch(userId, {
          handle,
          createdAt: now,
          updatedAt: now,
        });

        await ctx.db.insert("memberships", {
          userId,
          app: "forum",
          role: "member",
          createdAt: now,
        });
        await ctx.db.insert("memberships", {
          userId,
          app: "seller",
          role: "member",
          createdAt: now,
        });
        await ctx.db.insert("memberships", {
          userId,
          app: "marketplace",
          role: "member",
          createdAt: now,
        });

        const admins = parseAdminEmails();
        if (email && admins.has(email)) {
          await ctx.db.insert("memberships", {
            userId,
            app: "admin",
            role: "admin",
            createdAt: now,
          });
        }
      } else {
        await ctx.db.patch(userId, { updatedAt: now });
      }
    },
  },
});
