"use client";

import { useMutation, useQuery } from "convex/react";

import { ConsolePageHeader } from "@/components/console-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FunctionReturnType } from "convex/server";

import { api, type Id } from "@/lib/convex";

type AdminReport = FunctionReturnType<
  typeof api.forum.personas.adminModeration.listReportsForAdmin
>[number];

export default function ModerationPage() {
  const reports = useQuery(api.forum.personas.adminModeration.listReportsForAdmin, { limit: 100 });
  const moderate = useMutation(api.forum.personas.adminModeration.adminModerateReport);

  return (
    <>
      <ConsolePageHeader
        title="Moderation queue"
        description="Review user reports and take action on flagged content."
      />

      <div className="space-y-3">
        {(reports ?? []).length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">No pending reports.</p>
        )}
        {(reports ?? []).map((report: AdminReport) => (
          <Card key={report.id} className="border-[var(--border-default)] bg-[var(--bg-surface)]">
            <CardContent className="flex flex-wrap items-start justify-between gap-3 pt-6">
              <div>
                <p className="font-semibold capitalize">
                  {report.contentType} · {report.reason}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {report.reporterName ? `Reported by ${report.reporterName}` : "Anonymous reporter"}
                </p>
                {report.contentPreview && (
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">{report.contentPreview}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {report.contentType === "post" && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        moderate({
                          reportId: report.id as Id<"forumReports">,
                          action: "flag_post",
                          reason: "Admin review",
                        })
                      }
                    >
                      Flag post
                    </Button>
                    <Button
                      size="sm"
                      className="text-[var(--danger)]"
                      onClick={() =>
                        moderate({
                          reportId: report.id as Id<"forumReports">,
                          action: "remove_post",
                          reason: "Admin review",
                        })
                      }
                    >
                      Remove post
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    moderate({
                      reportId: report.id as Id<"forumReports">,
                      action: "dismiss_report",
                      reason: "No action needed",
                    })
                  }
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
