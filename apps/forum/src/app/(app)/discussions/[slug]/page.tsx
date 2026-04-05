/**
 * Route: /discussions/[slug]
 * Data: Convex forum.discussionRoute.getDiscussionRouteState
 */
import { notFound } from "next/navigation";

import { DiscussionPageLoader } from "@/components/discussion/discussion-page-loader";

interface DiscussionPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ post?: string }>;
}

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function DiscussionPage({ params, searchParams }: DiscussionPageProps) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const feedPostSlug = firstSearchParam(resolvedSearch?.post);

  if (!slug) {
    notFound();
  }

  return <DiscussionPageLoader pathSlug={slug} feedPostSlug={feedPostSlug} />;
}
