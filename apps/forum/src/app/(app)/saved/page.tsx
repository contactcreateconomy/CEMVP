/**
 * Route: /saved
 * Mock: shows posts with `isFavorited: true` in bundled data only. Client-side favorite toggles on /feed are not persisted here until a real API exists.
 */
import { FeedClient } from "@/components/feed/feed-client";
import { getFeedData } from "@/lib/adapters/content";

export default function SavedPage() {
  const { posts, comments, users } = getFeedData();
  const savedPosts = posts.filter((p) => p.isFavorited);

  return (
    <section className="animate-route-emerge space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-(--text-primary)">Saved</h1>
        <p className="mt-1 text-sm text-(--text-muted)">Posts marked as favorites in the mock catalog.</p>
      </div>
      <FeedClient
        initialPosts={savedPosts}
        allComments={comments}
        users={users}
        selectedSort="top"
        emptyState={{
          title: "No saved posts in mock data",
          description:
            "Nothing is flagged as favorited in the bundled feed yet, or try toggling favorites after a backend persists them.",
        }}
      />
    </section>
  );
}
