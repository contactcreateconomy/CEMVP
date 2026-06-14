"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Id } from "@/lib/convex";

export default function SafetyPage() {
  const keywords = useQuery(api.forum.personas.queries.listBlockedKeywords, {});
  const addKeyword = useMutation(api.forum.personas.mutations.addBlockedKeyword);
  const removeKeyword = useMutation(api.forum.personas.mutations.removeBlockedKeyword);

  const [term, setTerm] = useState("");
  const [severity, setSeverity] = useState<"block" | "flag">("block");
  const [category, setCategory] = useState("general");

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    await addKeyword({ term, severity, category });
    setTerm("");
  }

  return (
    <>
      <ConsolePageHeader
        title="Content safety"
        description="Block or flag terms in human posts, persona drafts, and published content."
      />

      <Card className="mb-6 border-[var(--border-default)]">
        <CardHeader>
          <h3 className="font-semibold">Add blocked term</h3>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={onAdd}>
            <Input placeholder="Term" value={term} onChange={(e) => setTerm(e.target.value)} required />
            <select
              className="rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as "block" | "flag")}
            >
              <option value="block">Block (reject)</option>
              <option value="flag">Flag (allow, mark)</option>
            </select>
            <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Button type="submit" className="md:col-span-3">
              Add term
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {(keywords ?? []).map((kw) => (
          <Card key={kw.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{kw.term}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {kw.severity} · {kw.category}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-[var(--danger)]"
                onClick={() => removeKeyword({ keywordId: kw.id as Id<"forumBlockedKeywords"> })}
              >
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
