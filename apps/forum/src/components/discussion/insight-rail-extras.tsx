"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DiscussionThread } from "@/types/discussion";

import { useThreadDiscussion } from "./thread-discussion-context";

export function InsightRailExtras({ thread }: { thread: DiscussionThread }) {
  const { prependMainComposer, focusMainComposer } = useThreadDiscussion();

  if (thread.category === "list") {
    const b = thread.categoryBody;
    const gaps = b.coverageGaps ?? [];
    if (gaps.length === 0) return null;
    return (
      <Card className="border-(--border-default) bg-(--bg-surface)">
        <CardContent className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase text-(--text-muted)">Coverage gaps</p>
          {gaps.map((g) => (
            <div key={g.text} className="rounded-[10px] border border-(--border-subtle) bg-(--bg-inset) p-3 text-sm text-(--text-secondary)">
              <p className="font-medium text-(--text-primary)">{g.text}</p>
              <p className="mt-1 text-xs text-(--text-muted)">{g.context}</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => {
                  prependMainComposer(`[Proposed addition — ${g.context}]\n${g.text}\n\nWhy it fits the criteria: `);
                  focusMainComposer();
                }}
              >
                Propose addition
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (thread.category === "news") {
    const b = thread.categoryBody;
    const timeline = b.timeline ?? [];
    const corroboration = b.corroboration ?? [];
    return (
      <div className="space-y-4">
        {timeline.length > 0 ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase text-(--text-muted)">Event timeline</p>
              <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
                {timeline.map((e) => (
                  <li key={e.date + e.label}>
                    <span className="font-medium text-(--text-primary)">{e.date}</span> — {e.label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : null}
        {b.conflictingSummary && corroboration.some((c) => c.stance === "contradicts") ? (
          <Card className="border-(--feedback-error)/30">
            <CardContent className="grid gap-2 p-4 sm:grid-cols-2">
              <p className="text-sm font-semibold text-(--text-primary) sm:col-span-2">Conflicting reports</p>
              <div>
                <p className="text-xs text-(--text-muted)">Claim</p>
                <p className="text-sm text-(--text-secondary)">{b.conflictingSummary.claim}</p>
              </div>
              <div>
                <p className="text-xs text-(--text-muted)">Source</p>
                <p className="text-sm text-(--text-secondary)">{b.conflictingSummary.sourceName}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    );
  }

  if (thread.category === "review") {
    const s = thread.categoryBody.sentiment;
    if (!s) return null;
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="text-xs font-semibold uppercase text-(--text-muted)">Community sentiment</p>
          <div className="flex gap-4 text-sm">
            <span className="text-(--feedback-success)">Agree {s.agreePct}%</span>
            <span className="text-(--feedback-error)">Disagree {s.disagreePct}%</span>
          </div>
          <div className="space-y-2 text-xs text-(--text-secondary)">
            <p>
              <span className="font-medium text-(--text-primary)">Top agree:</span> {s.agreeQuote}
            </p>
            <p>
              <span className="font-medium text-(--text-primary)">Top disagree:</span> {s.disagreeQuote}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (thread.category === "help") {
    const steps = thread.categoryBody.diagnosticSteps ?? [];
    if (steps.length === 0) return null;
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold uppercase text-(--text-muted)">Troubleshooting path</p>
          <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={s.tried ? "text-(--feedback-success)" : "text-(--text-muted)"}>{s.tried ? "✓" : "○"}</span>
                {s.label}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return null;
}
