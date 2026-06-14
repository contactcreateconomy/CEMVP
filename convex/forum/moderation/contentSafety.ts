import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

export type BlockedKeywordSeverity = "block" | "flag";

export type ContentSafetyResult = {
  blocked: boolean;
  flagged: boolean;
  matchedTerms: string[];
  maxSeverity: BlockedKeywordSeverity | null;
};

const STARTER_KEYWORDS: Array<{ term: string; severity: BlockedKeywordSeverity; category: string }> = [
  { term: "terrorism", severity: "block", category: "violence" },
  { term: "terrorist", severity: "block", category: "violence" },
  { term: "bomb making", severity: "block", category: "violence" },
  { term: "child porn", severity: "block", category: "csam" },
  { term: "cp ", severity: "block", category: "csam" },
  { term: "rape", severity: "block", category: "sexual" },
  { term: "pornography", severity: "flag", category: "sexual" },
  { term: "porn", severity: "flag", category: "sexual" },
  { term: "nazi", severity: "block", category: "hate" },
  { term: "kill yourself", severity: "block", category: "harassment" },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termMatches(normalizedHaystack: string, term: string): boolean {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;
  if (normalizedTerm.includes(" ")) {
    return normalizedHaystack.includes(normalizedTerm);
  }
  const words = normalizedHaystack.split(" ");
  return words.includes(normalizedTerm);
}

export async function ensureStarterBlockedKeywords(ctx: MutationCtx): Promise<void> {
  const existing = await ctx.db.query("forumBlockedKeywords").first();
  if (existing) return;

  const now = Date.now();
  for (const row of STARTER_KEYWORDS) {
    await ctx.db.insert("forumBlockedKeywords", {
      term: row.term,
      severity: row.severity,
      category: row.category,
      createdAt: now,
    });
  }
}

export async function checkBlockedKeywords(
  ctx: QueryCtx | MutationCtx,
  texts: string[],
): Promise<ContentSafetyResult> {
  const keywords = await ctx.db.query("forumBlockedKeywords").collect();
  const normalizedHaystack = normalizeText(texts.filter(Boolean).join(" "));

  const matchedTerms: string[] = [];
  let maxSeverity: BlockedKeywordSeverity | null = null;

  for (const kw of keywords) {
    if (termMatches(normalizedHaystack, kw.term)) {
      matchedTerms.push(kw.term);
      if (kw.severity === "block") {
        maxSeverity = "block";
      } else if (maxSeverity !== "block") {
        maxSeverity = "flag";
      }
    }
  }

  return {
    blocked: maxSeverity === "block",
    flagged: maxSeverity === "flag" || maxSeverity === "block",
    matchedTerms,
    maxSeverity,
  };
}

export function assertContentSafe(result: ContentSafetyResult): void {
  if (result.blocked) {
    throw new Error(
      `Content blocked by policy (${result.matchedTerms.slice(0, 3).join(", ")}).`,
    );
  }
}

export async function listBlockedKeywordsForAdmin(ctx: QueryCtx) {
  const rows = await ctx.db.query("forumBlockedKeywords").collect();
  return rows
    .map((row) => ({
      id: row._id as string,
      term: row.term,
      severity: row.severity,
      category: row.category,
      createdAt: row.createdAt,
    }))
    .sort((a, b) => a.term.localeCompare(b.term));
}

export async function addBlockedKeywordRow(
  ctx: MutationCtx,
  args: { term: string; severity: BlockedKeywordSeverity; category: string; userId: Id<"users"> },
): Promise<Id<"forumBlockedKeywords">> {
  const term = args.term.trim().toLowerCase();
  if (!term) throw new Error("Term is required.");

  const dup = await ctx.db
    .query("forumBlockedKeywords")
    .withIndex("by_term", (q) => q.eq("term", term))
    .unique();
  if (dup) throw new Error("Term already exists.");

  return await ctx.db.insert("forumBlockedKeywords", {
    term,
    severity: args.severity,
    category: args.category.trim() || "general",
    createdByUserId: args.userId,
    createdAt: Date.now(),
  });
}
