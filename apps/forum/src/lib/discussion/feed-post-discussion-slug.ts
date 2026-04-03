import type { Post } from "@/types";
import type { CategoryKey } from "@/types/category";

import { CATEGORY_TO_MVP_THREAD_SLUG } from "./category-mvp-slugs";

/**
 * URL slug for `/discussions/[slug]` from a feed card: use the post's slug when it is a real
 * discussion thread; otherwise map by category to the designed MVP thread for that type.
 */
export function getFeedPostDiscussionSlug(post: Post): string {
  if (post.isRichThread) {
    return post.slug;
  }
  return CATEGORY_TO_MVP_THREAD_SLUG[post.category as CategoryKey];
}

/** Path for navigation from a feed card (includes `?post=` when the card is not the canonical thread). */
export function getDiscussionHrefForPost(post: Post): string {
  const slug = getFeedPostDiscussionSlug(post);
  if (post.slug === slug) {
    return `/discussions/${slug}`;
  }
  return `/discussions/${slug}?post=${encodeURIComponent(post.slug)}`;
}
