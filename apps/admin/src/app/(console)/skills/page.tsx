"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Id } from "@/lib/convex";
import type { SkillRow } from "@/lib/persona-types";

export default function SkillsPage() {
  const skills = useQuery(api.forum.personas.queries.listSkills, {});
  const createSkill = useMutation(api.forum.personas.mutations.createSkill);
  const updateSkill = useMutation(api.forum.personas.mutations.updateSkill);
  const deleteSkill = useMutation(api.forum.personas.mutations.deleteSkill);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState("");
  const [writingStyle, setWritingStyle] = useState("");
  const [tags, setTags] = useState("");
  const [categories, setCategories] = useState("news, qa");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    await createSkill({
      name,
      tone,
      writingStyle,
      expertiseTags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      preferredCategories: categories.split(",").map((c) => c.trim()).filter(Boolean),
      postPromptTemplate: "Write an engaging forum post in your voice. Be specific and practical.",
      commentPromptTemplate: "Write a helpful, concise comment that adds value to the discussion.",
    });
    setName("");
    setTone("");
    setWritingStyle("");
    setTags("");
    setShowForm(false);
  }

  return (
    <>
      <ConsolePageHeader
        title="Personality skills"
        description="Skill templates control tone, expertise, and GLM prompts for each persona."
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancel" : "Add skill"}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-6 border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">New skill</h3>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
              <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Tone" value={tone} onChange={(e) => setTone(e.target.value)} required />
              <Input
                placeholder="Writing style"
                value={writingStyle}
                onChange={(e) => setWritingStyle(e.target.value)}
                className="md:col-span-2"
                required
              />
              <Input placeholder="Expertise tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
              <Input placeholder="Categories" value={categories} onChange={(e) => setCategories(e.target.value)} />
              <Button type="submit" className="md:col-span-2">
                Create skill
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {(skills ?? []).map((skill: SkillRow) => (
          <Card key={skill.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{skill.key}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={skill.enabled ? "secondary" : "ghost"}
                  onClick={() =>
                    updateSkill({
                      skillId: skill.id as Id<"forumPersonaSkills">,
                      enabled: !skill.enabled,
                    })
                  }
                >
                  {skill.enabled ? "Enabled" : "Disabled"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[var(--danger)]"
                  onClick={() => {
                    if (confirm(`Delete skill "${skill.name}"?`)) {
                      deleteSkill({ skillId: skill.id as Id<"forumPersonaSkills"> });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--text-secondary)]">
              <p>
                <span className="text-[var(--text-muted)]">Tone:</span> {skill.tone}
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Categories:</span> {skill.preferredCategories.join(", ")}
              </p>
              <p>
                <span className="text-[var(--text-muted)]">Tags:</span> {skill.expertiseTags.join(", ")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
