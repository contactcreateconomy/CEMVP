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
  const topics = useQuery(api.forum.personas.queries.listTopicBriefs, {});
  const createTopic = useMutation(api.forum.personas.mutations.createTopicBrief);
  const closeTopic = useMutation(api.forum.personas.mutations.closeTopicBrief);

  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("news");

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

  return (
    <>
      <ConsolePageHeader
        title="Topic briefs"
        description="Supply topics for personas to research and draft posts about. Open briefs are picked up by generation."
      />

      <Card className="border-[var(--border-default)]">
        <CardHeader>
          <h3 className="font-semibold">New topic</h3>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input placeholder="Topic title" value={title} onChange={(e) => setTitle(e.target.value)} />
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
        {(topics ?? []).map((t: TopicRow) => (
          <Card key={t.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {t.category} · {t.status} · {t.keywords.join(", ")}
                </p>
              </div>
              {t.status !== "closed" && (
                <Button size="sm" variant="secondary" onClick={() => closeTopic({ topicBriefId: t.id as Id<"forumTopicBriefs"> })}>
                  Close
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
