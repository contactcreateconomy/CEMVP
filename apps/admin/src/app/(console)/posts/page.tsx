"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FunctionReturnType } from "convex/server";

import { api, type Id } from "@/lib/convex";

type AdminPost = FunctionReturnType<
  typeof api.forum.personas.adminModeration.listPostsForAdmin
>[number];

export default function PostsPage() {
  const posts = useQuery(api.forum.personas.adminModeration.listPostsForAdmin, { limit: 100 });
  const setModeration = useMutation(api.forum.personas.adminModeration.adminSetPostModeration);
  const deletePost = useMutation(api.forum.personas.adminModeration.adminDeletePost);
  const [filter, setFilter] = useState<string>("all");

  const filtered = (posts ?? []).filter((p: AdminPost) =>
    filter === "all" ? true : p.moderationStatus === filter,
  );

  return (
    <>
      <ConsolePageHeader
        title="Posts"
        description="Browse and moderate forum posts, including persona-published content."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {["all", "visible", "flagged", "removed"].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filter === status ? "secondary" : "ghost"}
            onClick={() => setFilter(status)}
          >
            {status}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((post: AdminPost) => (
          <Card key={post.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{post.title}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  @{post.authorHandle} · {post.category} · {post.moderationStatus}
                  {post.managedByAutomation ? " · persona" : ""}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{post.summary}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.moderationStatus !== "visible" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setModeration({
                        postId: post.id as Id<"forumPosts">,
                        moderationStatus: "visible",
                      })
                    }
                  >
                    Restore
                  </Button>
                )}
                {post.moderationStatus !== "flagged" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setModeration({
                        postId: post.id as Id<"forumPosts">,
                        moderationStatus: "flagged",
                      })
                    }
                  >
                    Flag
                  </Button>
                )}
                {post.moderationStatus !== "removed" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[var(--danger)]"
                    onClick={() => deletePost({ postId: post.id as Id<"forumPosts"> })}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
