"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Id } from "@/lib/convex";
import type { DraftRow } from "@/lib/persona-types";

export default function QueuePage() {
  const drafts = useQuery(api.forum.personas.queries.listDrafts, { status: "pending" });
  const approve = useMutation(api.forum.personas.mutations.approveDraft);
  const reject = useMutation(api.forum.personas.mutations.rejectDraft);
  const publish = useMutation(api.forum.personas.mutations.publishDraft);
  const editDraft = useMutation(api.forum.personas.mutations.editDraft);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  function startEdit(draft: DraftRow) {
    setEditingId(draft.id);
    setEditTitle(draft.title ?? "");
    setEditBody(draft.body);
  }

  async function saveEdit(draftId: Id<"forumContentDrafts">) {
    await editDraft({
      draftId,
      title: editTitle || undefined,
      body: editBody,
    });
    setEditingId(null);
  }

  return (
    <>
      <ConsolePageHeader
        title="Review queue"
        description="Approve and publish drafts here. Published content appears in the forum as normal posts and comments."
      />

      <div className="space-y-4">
        {(drafts ?? []).length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No pending drafts.</p>
        )}
        {(drafts ?? []).map((draft: DraftRow) => (
          <Card key={draft.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-[var(--text-muted)]">
                    {draft.kind} · {draft.personaName}
                    {draft.targetPostTitle ? ` · re: ${draft.targetPostTitle}` : ""}
                  </p>
                  <h3 className="mt-1 font-semibold">{draft.title ?? "Comment draft"}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={() => startEdit(draft)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => approve({ draftId: draft.id as Id<"forumContentDrafts"> })}>
                    Approve
                  </Button>
                  <Button size="sm" onClick={() => publish({ draftId: draft.id as Id<"forumContentDrafts"> })}>
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => reject({ draftId: draft.id as Id<"forumContentDrafts">, reason: "Rejected in review" })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {editingId === draft.id ? (
                <div className="space-y-2">
                  {draft.kind === "post" && (
                    <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Title" />
                  )}
                  <textarea
                    className="min-h-32 w-full rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 text-sm"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                  />
                  <Button size="sm" onClick={() => saveEdit(draft.id as Id<"forumContentDrafts">)}>
                    Save edits
                  </Button>
                </div>
              ) : (
                <div
                  className="prose prose-invert max-w-none text-sm text-[var(--text-secondary)]"
                  dangerouslySetInnerHTML={{ __html: draft.body }}
                />
              )}
              {draft.researchSnippets.length > 0 && (
                <div className="rounded-md border border-[var(--border-subtle)] p-3 text-xs text-[var(--text-muted)]">
                  <p className="mb-2 font-medium text-[var(--text-secondary)]">Research sources</p>
                  <ul className="space-y-1">
                    {draft.researchSnippets.map((s: DraftRow["researchSnippets"][number], i: number) => (
                      <li key={i}>
                        <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
