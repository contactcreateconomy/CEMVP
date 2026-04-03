/**
 * Route: /feed
 * Data: Convex listFeedPage + listCategories
 */
import { FeedRouteClient } from "@/components/feed/feed-route-client";

interface FeedPageProps {
  searchParams?: Promise<{
    category?: string;
    sort?: "top" | "hot" | "new" | "fav";
  }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const resolvedSearchParams = await searchParams;
  const selectedCategory = resolvedSearchParams?.category;
  const selectedSort = resolvedSearchParams?.sort ?? "top";

  return <FeedRouteClient selectedCategory={selectedCategory} selectedSort={selectedSort} />;
}
