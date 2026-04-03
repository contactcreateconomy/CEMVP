import type { CategoryKey } from "@/types/category";

/** Canonical MVP thread slug per category when the feed post is not itself a rich thread. */
export const CATEGORY_TO_MVP_THREAD_SLUG: Record<CategoryKey, string> = {
  news: "news-001",
  review: "review-001",
  compare: "compare-001",
  "launch-pad": "launchpad-001",
  debate: "debate-001",
  help: "help-001",
  list: "list-001",
  showcase: "showcase-001",
  gigs: "gigs-001",
};
