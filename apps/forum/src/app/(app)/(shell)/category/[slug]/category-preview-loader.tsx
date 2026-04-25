"use client";

import { useQuery } from "convex/react";

import { DiscussionPageClient } from "@/components/discussion/discussion-page-client";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";
import type { DiscussionThread } from "@/types/discussion";
import type { User, Category } from "@/types";

interface CategoryPreviewLoaderProps {
  categoryKey: string;
}

function CategoryPreviewLoaderWithConvex({ categoryKey }: CategoryPreviewLoaderProps) {
  const state = useQuery(api.forum.discussionRoute.getRepresentativeThreadByCategory, { categoryKey });

  if (state === undefined) {
    return null;
  }

  if (state === null) {
    return (
      <section className="animate-route-emerge space-y-2">
        <h1 className="text-xl font-semibold text-(--text-primary)">No threads yet for &ldquo;{categoryKey}&rdquo;</h1>
        <p className="text-sm text-(--text-muted)">
          Seed the database or create a published thread in this category to preview its design here.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-0">
      {process.env.NODE_ENV === "development" && (
        <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
          Design Preview — {categoryKey} &nbsp;·&nbsp; Edit{" "}
          <code className="font-mono">
            src/components/discussion/categories/{categoryKey}/
          </code>{" "}
          to update this page and all real threads simultaneously.
        </div>
      )}
      <DiscussionPageClient
        thread={state.thread as unknown as DiscussionThread}
        author={state.author}
        category={state.category as Category | null}
        related={state.related}
        trending={state.trending}
        users={state.users as User[]}
      />
    </div>
  );
}

export function CategoryPreviewLoader({ categoryKey }: CategoryPreviewLoaderProps) {
  if (!isConvexConfigured()) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex (set <code className="font-mono">NEXT_PUBLIC_CONVEX_URL</code>) to preview category designs.
      </p>
    );
  }

  return <CategoryPreviewLoaderWithConvex categoryKey={categoryKey} />;
}
