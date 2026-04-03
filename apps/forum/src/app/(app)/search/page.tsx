/**
 * Route: /search?q=
 * Mock search over posts and users (substring match).
 */
import Link from "next/link";

import { FeedClient } from "@/components/feed/feed-client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getFeedData } from "@/lib/adapters/content";
import { searchMockPosts, searchMockUsers } from "@/lib/search/mock-search";
import { reputationLabel } from "@/lib/discussion/reputation";

function firstSearchParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

interface SearchPageProps {
  searchParams?: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = await searchParams;
  const qRaw = firstSearchParam(resolved?.q) ?? "";
  const q = qRaw.trim();
  const { posts, comments, users } = getFeedData();

  if (!q) {
    return (
      <section className="animate-route-emerge space-y-4">
        <h1 className="text-2xl font-semibold text-(--text-primary)">Search</h1>
        <p className="text-sm text-(--text-secondary)">
          Use the search field in the header and press Enter to find posts and people in the mock catalog.
        </p>
      </section>
    );
  }

  const matchedPosts = searchMockPosts(posts, q);
  const matchedUsers = searchMockUsers(users, q);

  return (
    <section className="animate-route-emerge space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-(--text-primary)">Search results</h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          Showing matches for &quot;{q}&quot; (mock data)
        </p>
      </div>

      {matchedUsers.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">People</h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {matchedUsers.map((u) => (
              <li key={u.id}>
                <Link
                  href={`/users/${encodeURIComponent(u.handle)}`}
                  className="card-surface flex items-center gap-3 rounded-[14px] border border-(--border-subtle) p-3 transition-colors hover:border-(--border-active)"
                >
                  <UserAvatar user={u} size="md" className="shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-(--text-primary)">{u.name}</p>
                    <p className="text-xs text-(--text-muted)">
                      @{u.handle} · {reputationLabel(u.points)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">Posts</h2>
        <FeedClient
          initialPosts={matchedPosts}
          allComments={comments}
          users={users}
          selectedSort="top"
          emptyState={{
            title: "No posts match your search",
            description: `Nothing in the mock feed matched "${q}". Try another keyword or browse Discover categories.`,
          }}
        />
      </div>
    </section>
  );
}
