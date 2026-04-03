import { getDiscussionThreadBySlug } from "@/lib/mock-data/discussion-threads";
import type { Post } from "@/types";
import type { CategoryKey } from "@/types/category";

/** Canonical mock thread slug per category when the feed post slug is not a full thread id. */
const CATEGORY_TO_MVP_THREAD_SLUG: Record<CategoryKey, string> = {
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

/**
 * URL slug for `/discussions/[slug]` from a feed card: use the post's slug when it is a real
 * discussion thread; otherwise map by category to the designed MVP thread for that type.
 */
export function getFeedPostDiscussionSlug(post: Post): string {
  if (getDiscussionThreadBySlug(post.slug)) {
    return post.slug;
  }
  return CATEGORY_TO_MVP_THREAD_SLUG[post.category];
}

/** Path for navigation from a feed card (includes `?post=` when the card is not the canonical thread). */
export function getDiscussionHrefForPost(post: Post): string {
  const slug = getFeedPostDiscussionSlug(post);
  if (post.slug === slug) {
    return `/discussions/${slug}`;
  }
  return `/discussions/${slug}?post=${encodeURIComponent(post.slug)}`;
}
