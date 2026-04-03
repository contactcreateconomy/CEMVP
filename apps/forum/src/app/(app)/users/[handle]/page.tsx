/**
 * Route: /users/[handle]
 * Public profile: mock user + posts by author. Backend: GET /api/users/:handle, GET /api/posts?authorId=
 */
import { notFound } from "next/navigation";

import { FeedClient } from "@/components/feed/feed-client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getFeedData, getPostsByAuthor, getUserByHandle } from "@/lib/adapters/content";
import { reputationLabel } from "@/lib/discussion/reputation";

interface UserProfilePageProps {
  params: Promise<{ handle: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { handle: handleParam } = await params;
  const handle = decodeURIComponent(handleParam);
  const user = getUserByHandle(handle);
  if (!user) {
    notFound();
  }

  const { comments, users } = getFeedData();
  const authorPosts = getPostsByAuthor(user.id);

  return (
    <section className="animate-route-emerge space-y-6">
      <div className="card-surface flex flex-col gap-4 rounded-[16px] border border-(--border-subtle) p-5 sm:flex-row sm:items-center">
        <UserAvatar user={user} size="lg" className="shrink-0" />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-(--text-primary)">{user.name}</h1>
          <p className="text-sm text-(--text-muted)">
            @{user.handle} · {reputationLabel(user.points)}
          </p>
          {user.bio ? <p className="mt-2 text-sm text-(--text-secondary)">{user.bio}</p> : null}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--text-muted)">Posts</h2>
        <FeedClient
          initialPosts={authorPosts}
          allComments={comments}
          users={users}
          selectedSort="new"
          emptyState={{
            title: "No posts yet",
            description: "This member hasn’t published anything in the mock catalog.",
          }}
        />
      </div>
    </section>
  );
}
