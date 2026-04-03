import type { CategoryKey } from "@/types";
import { DISCUSSION_MVP_SLUGS } from "@/types/discussion";

const PREFIX_TO_CATEGORY: Record<string, CategoryKey> = {
  news: "news",
  review: "review",
  compare: "compare",
  launchpad: "launch-pad",
  debate: "debate",
  help: "help",
  list: "list",
  showcase: "showcase",
  gigs: "gigs",
};

export function getCategoryKeyFromDiscussionSlug(slug: string): CategoryKey | null {
  const prefix = slug.split("-")[0];
  return PREFIX_TO_CATEGORY[prefix] ?? null;
}

export function isDiscussionMvpSlug(slug: string): slug is (typeof DISCUSSION_MVP_SLUGS)[number] {
  return (DISCUSSION_MVP_SLUGS as readonly string[]).includes(slug);
}
