/**
 * Route: /category/[slug]
 * Design preview sandbox — renders the most recent real thread for a given category.
 * Changes to any category template component (Body, Insights, ComposeForm, CardExtras)
 * are reflected here AND on every real /discussions/[slug] page automatically.
 */
import { notFound } from "next/navigation";

import { CategoryPreviewLoader } from "./category-preview-loader";

const KNOWN_CATEGORIES = new Set([
  "news",
  "review",
  "compare",
  "launch-pad",
  "debate",
  "help",
  "qa",
  "list",
  "showcase",
  "gigs",
]);

interface CategoryPreviewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPreviewPage({ params }: CategoryPreviewPageProps) {
  const { slug } = await params;

  if (!KNOWN_CATEGORIES.has(slug)) {
    notFound();
  }

  return <CategoryPreviewLoader categoryKey={slug} />;
}
