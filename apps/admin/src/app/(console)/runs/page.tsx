"use client";

import { useQuery } from "convex/react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/convex";
import type { RunRow } from "@/lib/persona-types";

export default function RunsPage() {
  const runs = useQuery(api.forum.personas.queries.listAutomationRuns, { limit: 100 });

  return (
    <>
      <ConsolePageHeader
        title="Automation runs"
        description="Audit log of generation, scheduler, and publish events."
      />

      <div className="space-y-2">
        {(runs ?? []).map((run: RunRow) => (
          <Card key={run.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm">
              <div>
                <p className="font-medium">{run.runType}</p>
                <p className="text-[var(--text-muted)]">
                  {new Date(run.createdAt).toLocaleString()}
                  {run.personaId ? ` · persona ${run.personaId.slice(-6)}` : ""}
                </p>
              </div>
              <span className={run.success ? "text-green-500" : "text-red-400"}>
                {run.success ? "OK" : run.error ?? "Failed"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
