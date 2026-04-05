/** Maps feed post category to canonical MVP discussion slug when the post is not itself a rich thread. */
export const CATEGORY_TO_MVP_THREAD_SLUG: Record<string, string> = {
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

export function discussionHrefForPostShape(post: {
  slug: string;
  category: string;
  isRichThread: boolean;
}): string {
  const slug = post.isRichThread ? post.slug : CATEGORY_TO_MVP_THREAD_SLUG[post.category] ?? post.slug;
  if (post.slug === slug) {
    return `/discussions/${slug}`;
  }
  return `/discussions/${slug}?post=${encodeURIComponent(post.slug)}`;
}
