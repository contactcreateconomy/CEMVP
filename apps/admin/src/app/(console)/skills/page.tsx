"use client";

import { useMutation, useQuery } from "convex/react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api, type Id } from "@/lib/convex";
import type { SkillRow } from "@/lib/persona-types";

export default function SkillsPage() {
  const skills = useQuery(api.forum.personas.queries.listSkills, {});
  const updateSkill = useMutation(api.forum.personas.mutations.updateSkill);

  return (
    <>
      <ConsolePageHeader
        title="Personality skills"
        description="Skill templates control tone, expertise, and GLM prompts for each persona."
      />

      <div className="space-y-4">
        {(skills ?? []).map((skill: SkillRow) => (
          <Card key={skill.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="font-semibold">{skill.name}</h3>
                <p className="text-xs text-[var(--text-muted)]">{skill.key}</p>
              </div>
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
