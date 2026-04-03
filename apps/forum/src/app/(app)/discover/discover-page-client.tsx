"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Compass } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";
import { isConvexConfigured } from "@cemvp/convex-client";

export function DiscoverPageClient() {
  const enabled = isConvexConfigured();
  const categories = useQuery(api.forum.queries.listCategories, enabled ? {} : "skip");

  if (!enabled) {
    return (
      <p className="text-sm text-(--text-muted)">
        Connect Convex to load categories.
      </p>
    );
  }

  if (categories === undefined) {
    return null;
  }

  return (
    <section className="animate-route-emerge space-y-4">
      <Card>
        <CardHeader>
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold text-(--text-primary)">
            <Compass className="h-5 w-5" /> Discover
          </h1>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.key}
              href={`/feed?category=${category.key}`}
              className="rounded-md border border-(--border-default) bg-(--bg-surface) p-3 transition-colors hover:border-(--border-active) hover:bg-(--bg-overlay)"
            >
              <p className="text-sm font-semibold text-(--text-primary)">{category.name}</p>
              <p className="mt-1 text-xs text-(--text-muted)">{category.description}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
