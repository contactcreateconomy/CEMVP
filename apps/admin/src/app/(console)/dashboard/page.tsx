"use client";

import { useMutation, useQuery } from "convex/react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";

export default function DashboardPage() {
  const stats = useQuery(api.forum.personas.queries.getDashboardStats, {});
  const config = useQuery(api.forum.personas.queries.getAutomationConfig, {});
  const pause = useMutation(api.forum.personas.mutations.pauseAutomation);
  const updateConfig = useMutation(api.forum.personas.mutations.updateAutomationConfig);
  const bootstrap = useMutation(api.forum.personas.mutations.bootstrapPersonas);

  return (
    <>
      <ConsolePageHeader
        title="Dashboard"
        description="Overview of persona automation. Published posts appear in the forum feed as normal member posts."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending drafts" value={stats?.pendingDrafts ?? "—"} />
        <StatCard label="Published today" value={stats?.publishedToday ?? "—"} />
        <StatCard label="Active personas" value={stats?.activePersonas ?? "—"} />
        <StatCard label="Posts generated today" value={stats?.postsGeneratedToday ?? "—"} />
      </div>

      <Card className="mt-6 border-[var(--border-default)]">
        <CardHeader>
          <h2 className="font-semibold">Automation</h2>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant={config?.enabled ? "secondary" : "primary"}
            onClick={() => updateConfig({ enabled: !config?.enabled })}
          >
            {config?.enabled ? "Automation on — click to disable" : "Automation off — click to enable"}
          </Button>
          <Button variant="destructive" onClick={() => pause()}>
            Pause all
          </Button>
          <Button variant="secondary" onClick={() => bootstrap()}>
            Bootstrap 10 personas + skills
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-[var(--border-default)]">
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
