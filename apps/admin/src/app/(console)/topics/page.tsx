"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Id } from "@/lib/convex";
import type { TopicRow } from "@/lib/persona-types";

export default function TopicsPage() {
  const config = useQuery(api.forum.personas.queries.getAutomationConfig, {});
  const topics = useQuery(api.forum.personas.queries.listTopicBriefs, {});
  const suggested = useQuery(api.forum.personas.queries.listTopicBriefs, { status: "suggested" });

  const createTopic = useMutation(api.forum.personas.mutations.createTopicBrief);
  const closeTopic = useMutation(api.forum.personas.mutations.closeTopicBrief);
  const deleteTopic = useMutation(api.forum.personas.mutations.deleteTopicBrief);
  const acceptTopic = useMutation(api.forum.personas.mutations.acceptSuggestedTopic);
  const dismissTopic = useMutation(api.forum.personas.mutations.dismissSuggestedTopic);
  const discover = useMutation(api.forum.personas.mutations.triggerTrendingDiscovery);
  const updateTrending = useMutation(api.forum.personas.mutations.updateTrendingConfig);

  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("news");
  const [subreddits, setSubreddits] = useState("");
  const [trendKeywords, setTrendKeywords] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createTopic({
      title,
      keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
      category,
    });
    setTitle("");
    setKeywords("");
  }

  async function saveTrendingConfig() {
    await updateTrending({
      watchedSubreddits: subreddits.split(",").map((s) => s.trim()).filter(Boolean),
      trendingKeywords: trendKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    });
  }

  return (
    <>
      <ConsolePageHeader
        title="Topic briefs"
        description="Supply topics for personas to research. Discover trending topics from Reddit (review-first by default)."
        actions={
          <Button size="sm" onClick={() => discover({})}>
            Discover trending
          </Button>
        }
      />

      <div className="space-y-6">
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">Trending settings</h3>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Watched subreddits (comma-separated)"
              defaultValue={(config?.watchedSubreddits ?? []).join(", ")}
              onChange={(e) => setSubreddits(e.target.value)}
            />
            <Input
              placeholder="Trending keywords"
              defaultValue={(config?.trendingKeywords ?? []).join(", ")}
              onChange={(e) => setTrendKeywords(e.target.value)}
            />
            <Button className="md:col-span-2" variant="secondary" onClick={saveTrendingConfig}>
              Save trending config
            </Button>
          </CardContent>
        </Card>

        {(suggested ?? []).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Suggested (review first)</h3>
            {(suggested ?? []).map((t: TopicRow) => (
              <Card key={t.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t.source ?? "unknown"} · score {t.score ?? 0} · {t.category}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => acceptTopic({ topicBriefId: t.id as Id<"forumTopicBriefs"> })}>
                      Accept
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => dismissTopic({ topicBriefId: t.id as Id<"forumTopicBriefs"> })}>
                      Dismiss
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">New topic</h3>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <Input placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              <Input
                placeholder="Keywords (comma-separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <Input placeholder="Category key (e.g. news, qa)" value={category} onChange={(e) => setCategory(e.target.value)} />
              <Button type="submit">Add topic brief</Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {(topics ?? [])
            .filter((t: TopicRow) => t.status !== "suggested")
            .map((t: TopicRow) => (
              <Card key={t.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
                <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
                  <div>
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t.category} · {t.status}
                      {t.source ? ` · ${t.source}` : ""} · {t.keywords.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {t.status !== "closed" && t.status !== "in_use" && (
                      <Button size="sm" variant="secondary" onClick={() => closeTopic({ topicBriefId: t.id as Id<"forumTopicBriefs"> })}>
                        Close
                      </Button>
                    )}
                    {t.status !== "in_use" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[var(--danger)]"
                        onClick={() => deleteTopic({ topicBriefId: t.id as Id<"forumTopicBriefs"> })}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
