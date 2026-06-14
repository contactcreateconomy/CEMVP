"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, type Id } from "@/lib/convex";
import type { PersonaRow, SkillRow } from "@/lib/persona-types";

export default function PersonasPage() {
  const personas = useQuery(api.forum.personas.queries.listPersonas, {});
  const skills = useQuery(api.forum.personas.queries.listSkills, {});
  const createPersona = useMutation(api.forum.personas.mutations.createPersona);
  const updatePersona = useMutation(api.forum.personas.mutations.updatePersona);
  const deletePersona = useMutation(api.forum.personas.mutations.deletePersona);
  const trigger = useMutation(api.forum.personas.mutations.triggerGeneration);

  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");
  const [skillId, setSkillId] = useState("");

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!skillId) return;
    await createPersona({
      displayName,
      handle,
      bio,
      image: image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=faces",
      skillId: skillId as Id<"forumPersonaSkills">,
      active: false,
    });
    setDisplayName("");
    setHandle("");
    setBio("");
  }

  return (
    <>
      <ConsolePageHeader
        title="Personas"
        description="Forum profiles managed here. Published posts appear as ordinary member content on the forum."
      />

      <div className="space-y-6">
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">Add persona</h3>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
              <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
              <Input placeholder="Handle" value={handle} onChange={(e) => setHandle(e.target.value)} required />
              <Input placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="md:col-span-2" />
              <Input placeholder="Avatar URL (optional)" value={image} onChange={(e) => setImage(e.target.value)} className="md:col-span-2" />
              <select
                className="rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 text-sm md:col-span-2"
                value={skillId}
                onChange={(e) => setSkillId(e.target.value)}
                required
              >
                <option value="">Select skill…</option>
                {(skills ?? []).map((s: SkillRow) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button type="submit" className="md:col-span-2">
                Create persona
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {(personas ?? []).map((p: PersonaRow) => (
            <Card key={p.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                <div>
                  <p className="font-semibold">
                    {p.displayName}
                    {p.verified ? " ✓" : ""}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    @{p.handle} · {p.skillName} · L{p.level} · {p.points} pts · streak {p.streakDays}d
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    posts today: {p.postsTodayCount}/{p.dailyPostLimit}
                    {p.autoPublish ? " · auto-publish" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={p.active ? "secondary" : "ghost"}
                    onClick={() =>
                      updatePersona({
                        personaId: p.id as Id<"forumPersonas">,
                        active: !p.active,
                      })
                    }
                  >
                    {p.active ? "Active" : "Inactive"}
                  </Button>
                  <Button
                    size="sm"
                    variant={p.autoPublish ? "secondary" : "ghost"}
                    onClick={() =>
                      updatePersona({
                        personaId: p.id as Id<"forumPersonas">,
                        autoPublish: !p.autoPublish,
                      })
                    }
                  >
                    {p.autoPublish ? "Auto-publish" : "Manual review"}
                  </Button>
                  <Button size="sm" onClick={() => trigger({ personaId: p.id as Id<"forumPersonas"> })}>
                    Generate draft
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[var(--danger)]"
                    onClick={() => {
                      if (confirm(`Remove persona "${p.displayName}" from automation? Profile and posts are kept.`)) {
                        deletePersona({ personaId: p.id as Id<"forumPersonas"> });
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
