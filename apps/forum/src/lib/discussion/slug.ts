import type { CategoryKey } from "@/types";

const PREFIX_TO_CATEGORY: Record<string, CategoryKey> = {
  news: "news",
  review: "review",
  compare: "compare",
  launchpad: "launch-pad",
  debate: "debate",
  help: "help",
  qa: "qa",
  list: "list",
  showcase: "showcase",
  gigs: "gigs",
};

export function getCategoryKeyFromDiscussionSlug(slug: string): CategoryKey | null {
  const prefix = slug.split("-")[0];
  return PREFIX_TO_CATEGORY[prefix] ?? null;
}
