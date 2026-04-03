"use client";

import { useQuery } from "convex/react";

import { NewPostComposer } from "@/components/new-post/new-post-composer";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { Category } from "@/types";

function NewPostPageWithConvex() {
  const categories = useQuery(api.forum.queries.listCategories, {});

  if (categories === undefined) {
    return null;
  }

  return <NewPostComposer categories={categories as Category[]} />;
}

export function NewPostPageClient() {
  if (!isConvexConfigured()) {
    return (
      <p className="px-4 text-sm text-(--text-muted)">
        Connect Convex to load categories and publish posts.
      </p>
    );
  }

  return <NewPostPageWithConvex />;
}
