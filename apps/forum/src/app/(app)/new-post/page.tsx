/**
 * Route: /new-post
 * Auth requirement: Member recommended
 * Client editor: TipTap (Medium-style) + category strip from mock catalog.
 * Backend endpoints needed:
 * - GET /api/me
 * - POST /api/posts
 * - POST /api/posts/draft
 * - GET /api/categories
 */
import { NewPostComposer } from "@/components/new-post/new-post-composer";
import { getCategories } from "@/lib/adapters/content";

export default function NewPostPage() {
  const categories = getCategories();
  return <NewPostComposer categories={categories} />;
}
