/**
 * Category-aware copy for the new-post TipTap surface (hints, placeholder, optional empty scaffolds).
 * Aligned in spirit with discussion seed payloads in `convex/forum/seed/discussionThreads.ts` — not enforced.
 */
import type { CategoryKey } from "@/types/category";

export const NEW_POST_DRAFT_STORAGE_KEY = "cemvp-forum-new-post-draft";

export interface NewPostDraftPayload {
  categoryKey: CategoryKey;
  title: string;
  summary: string;
  editorHtml: string;
  updatedAt: number;
}

/** One-line guidance above the editor. */
export const categoryWritingHints: Record<CategoryKey, string> = {
  news: "Lead with what happened; name your source and paste the primary link in the body.",
  review: "Name the product or tool, link to it if you can, and explain who it’s for and your verdict.",
  compare: "State what you’re comparing, criteria that matter, and trade-offs — readers should see a clear takeaway.",
  "launch-pad": "Pitch the offer, who it helps, stage (idea / beta / live), and what feedback you want.",
  debate: "State your motion clearly, then argue for it; invite counterpoints in the thread.",
  help: "Describe your goal, what you already tried, and where you’re stuck so others can reproduce or advise.",
  qa: "Describe your goal, what you already tried, and where you’re stuck so others can reproduce or advise.",
  list: "Say who the list is for, inclusion rules, and add items — context beats bare links.",
  showcase: "Explain what you built or changed, what problem it solves, and what kind of feedback you want.",
  gigs: "Role, compensation or budget, duration, location or timezone, and how to apply — keep it concrete.",
};

/** TipTap placeholder text per category. */
export const categoryEditorPlaceholders: Record<CategoryKey, string> = {
  news: "Write the story, timeline, and link your sources…",
  review: "Review: setup, pros, cons, and who should use this…",
  compare: "Compare options, criteria, and your recommendation…",
  "launch-pad": "Describe the launch, audience, and what you need from the community…",
  debate: "Lay out the thesis, evidence, and where you’re uncertain…",
  help: "Goal, what you tried, error or blocker, environment if relevant…",
  qa: "Goal, what you tried, error or blocker, environment if relevant…",
  list: "Purpose, audience, then list items with short blurbs…",
  showcase: "Intent, screenshots or links in the text, open questions…",
  gigs: "Role, scope, budget, duration, how to reach you…",
};

/**
 * Light HTML outline inserted only when the document is still empty and the user picks a category.
 * User can delete any of it. Uses h2 to match StarterKit heading levels in the composer.
 */
export function categoryScaffoldHtml(category: CategoryKey): string {
  const map: Record<CategoryKey, string> = {
    news: "<h2>What changed</h2><p></p><h2>Sources</h2><p></p>",
    review: "<h2>What I’m reviewing</h2><p></p><h2>Verdict</h2><p></p>",
    compare: "<h2>Options</h2><p></p><h2>Criteria</h2><p></p><h2>Takeaway</h2><p></p>",
    "launch-pad": "<h2>What it is</h2><p></p><h2>Who it’s for</h2><p></p><h2>Ask</h2><p></p>",
    debate: "<h2>Motion</h2><p></p><h2>Why I believe this</h2><p></p>",
    help: "<h2>Goal</h2><p></p><h2>What I tried</h2><p></p><h2>Where I’m stuck</h2><p></p>",
    qa: "<h2>Goal</h2><p></p><h2>What I tried</h2><p></p><h2>Where I’m stuck</h2><p></p>",
    list: "<h2>List topic</h2><p></p><h2>Audience</h2><p></p><h2>Items</h2><ul><li></li></ul>",
    showcase: "<h2>What I built</h2><p></p><h2>Feedback I want</h2><p></p>",
    gigs: "<h2>Role</h2><p></p><h2>Budget & duration</h2><p></p><h2>How to apply</h2><p></p>",
  };
  return map[category] ?? "<p></p>";
}

export function isEditorDocumentBare(html: string, text: string): boolean {
  const t = text.trim();
  if (t.length > 0) return false;
  const compact = html.replace(/\s/g, "");
  return (
    compact === "" ||
    compact === "<p></p>" ||
    compact === "<p><br></p>" ||
    /^<p><br[^>]*><\/p>$/i.test(compact)
  );
}
