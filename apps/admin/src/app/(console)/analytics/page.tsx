"use client";

import { useQuery } from "convex/react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "@/lib/convex";

export default function AnalyticsPage() {
  const analytics = useQuery(api.forum.personas.queries.getAnalyticsSummary, {});

  return (
    <>
      <ConsolePageHeader
        title="Analytics"
        description="Draft pipeline and automation run statistics."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <p className="text-xs text-[var(--text-muted)]">Total drafts</p>
            <p className="text-2xl font-semibold">{analytics?.totalDrafts ?? "—"}</p>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <p className="text-xs text-[var(--text-muted)]">Pending</p>
            <p className="text-2xl font-semibold">{analytics?.pendingDrafts ?? "—"}</p>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <p className="text-xs text-[var(--text-muted)]">Published</p>
            <p className="text-2xl font-semibold">{analytics?.publishedDrafts ?? "—"}</p>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <p className="text-xs text-[var(--text-muted)]">Rejected</p>
            <p className="text-2xl font-semibold">{analytics?.rejectedDrafts ?? "—"}</p>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">Posts by persona</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {(analytics?.postsByPersona ?? []).map((row) => (
              <div key={row.personaId} className="flex justify-between text-sm">
                <span>{row.personaName}</span>
                <span className="text-[var(--text-muted)]">{row.publishedCount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-[var(--border-default)]">
          <CardHeader>
            <h3 className="font-semibold">Runs by type</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {(analytics?.runsByType ?? []).map((row) => (
              <div key={row.runType} className="flex justify-between text-sm">
                <span>{row.runType}</span>
                <span className="text-[var(--text-muted)]">
                  {row.count} ({Math.round(row.successRate * 100)}% ok)
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
