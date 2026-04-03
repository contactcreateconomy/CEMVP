"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Briefcase, Calendar, ChevronsRight, Crosshair, ExternalLink, MapPin, Maximize2, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatCompactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DiscussionThread } from "@/types/discussion";
import type { User } from "@/types";

import { BriefToast } from "./brief-toast";
import { FormattedBody } from "./formatted-body";
import { useThreadDiscussion } from "./thread-discussion-context";

function stanceStyles(stance: "confirms" | "skeptical" | "contradicts") {
  if (stance === "confirms") return "bg-(--feedback-success)/15 text-(--feedback-success) border-(--feedback-success)/30";
  if (stance === "skeptical") return "bg-(--feedback-warning)/15 text-(--feedback-warning) border-(--feedback-warning)/30";
  return "bg-(--feedback-error)/15 text-(--feedback-error) border-(--feedback-error)/30";
}

export function CategoryThreadBody({
  thread,
  isMax,
  author,
  ensureAuthenticated,
}: {
  thread: DiscussionThread;
  isMax: boolean;
  author: User | null;
  ensureAuthenticated: () => boolean;
}) {
  switch (thread.category) {
    case "news":
      return <NewsBody thread={thread} isMax={isMax} author={author} />;
    case "review":
      return <ReviewBody thread={thread} isMax={isMax} />;
    case "compare":
      return <CompareBody thread={thread} isMax={isMax} />;
    case "launch-pad":
      return <LaunchpadBody thread={thread} isMax={isMax} author={author} />;
    case "debate":
      return <DebateBody thread={thread} isMax={isMax} ensureAuthenticated={ensureAuthenticated} />;
    case "help":
      return <HelpBody thread={thread} isMax={isMax} />;
    case "list":
      return <ListBody thread={thread} isMax={isMax} />;
    case "showcase":
      return <ShowcaseBody thread={thread} isMax={isMax} />;
    case "gigs":
      return <GigsBody thread={thread} isMax={isMax} author={author} ensureAuthenticated={ensureAuthenticated} />;
    default:
      return null;
  }
}

function NewsBody({
  thread,
  isMax,
  author,
}: {
  thread: Extract<DiscussionThread, { category: "news" }>;
  isMax: boolean;
  author: User | null;
}) {
  const b = thread.categoryBody;

  return (
    <div className="space-y-4">
      <Card className="border-(--border-default) bg-(--bg-surface)">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {b.sourceFavicon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.sourceFavicon} alt="" className="h-5 w-5 rounded" width={20} height={20} />
            ) : null}
            <span className="font-semibold text-(--text-primary)">{b.isOriginalReporting ? "Original reporting" : b.sourceName}</span>
            <span className="text-(--text-muted)">·</span>
            <time className="text-(--text-secondary)">{new Date(b.publishedAt).toLocaleString()}</time>
            {!b.isOriginalReporting && b.sourceUrl ? (
              <a
                href={b.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-(--brand-primary) hover:underline"
              >
                Read original <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
          {b.isOriginalReporting ? (
            <p className="text-sm text-(--text-secondary)">Original reporting by @{author?.handle ?? "author"}</p>
          ) : null}
          <div className="flex flex-wrap gap-2 text-xs text-(--text-muted)">
            <span>Published {new Date(b.publishedAt).toLocaleDateString()}</span>
            {b.updatedAt ? <span className="text-(--text-secondary)">Updated {new Date(b.updatedAt).toLocaleString()}</span> : null}
            {new Date(b.publishedAt).getTime() < Date.UTC(2026, 1, 20) ? (
              <span className="rounded-full bg-(--bg-overlay) px-2 py-0.5">Older content</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">Corroboration</p>
        {b.corroboration.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-(--border-default) bg-(--bg-inset) p-4 text-sm text-(--text-secondary)">
            No corroboration added yet. Know another source? Add it.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {b.corroboration.map((s) => (
              <div
                key={s.name}
                className="flex min-w-[140px] flex-1 items-center gap-2 rounded-[12px] border border-(--border-default) bg-(--bg-surface) px-3 py-2"
              >
                <span className="text-sm font-medium text-(--text-primary)">{s.name}</span>
                <span className={cn("ml-auto rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", stanceStyles(s.stance))}>
                  {s.stance}
                </span>
                {isMax && s.credibility ? (
                  <span
                    title="Independent: editorial distance from vendor. Corporate: vendor-affiliated. Government: official. Community: crowd-sourced."
                    className="rounded-full bg-(--bg-overlay) px-2 py-0.5 text-[10px] text-(--text-muted)"
                  >
                    {s.credibility}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <FormattedBody body={thread.body} />
    </div>
  );
}

function weightedScore(criteria: { score: number; weightPercent: number }[], weights: number[]) {
  const w = weights.length ? weights : criteria.map((c) => c.weightPercent);
  const sumW = w.reduce((a, b) => a + b, 0) || 1;
  return criteria.reduce((acc, c, i) => acc + c.score * (w[i] ?? c.weightPercent), 0) / sumW;
}

function ReviewBody({ thread, isMax }: { thread: Extract<DiscussionThread, { category: "review" }>; isMax: boolean }) {
  const b = thread.categoryBody;
  const [adjust, setAdjust] = useState(false);
  const [weights, setWeights] = useState(() => b.criteria.map((c) => c.weightPercent));
  const live = weightedScore(b.criteria, weights);
  const verdictColor =
    b.verdict === "recommended"
      ? "text-(--feedback-success)"
      : b.verdict === "caveats"
        ? "text-(--feedback-warning)"
        : "text-(--feedback-error)";
  const verdictLabel = b.verdict === "recommended" ? "Recommended" : b.verdict === "caveats" ? "With caveats" : "Not recommended";

  return (
    <div className="space-y-4">
      <Card className="border-(--border-default) bg-(--bg-surface) xl:sticky xl:top-20 xl:z-[5]">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          {b.productLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.productLogo} alt="" className="h-12 w-12 rounded-lg border border-(--border-default)" width={48} height={48} />
          ) : null}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-(--text-primary)">{b.productName}</h2>
            <p className="text-xs text-(--text-muted)">{b.reviewerContextNote}</p>
          </div>
          <a href={b.productUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-(--brand-primary) hover:underline">
            Visit product →
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold text-(--text-primary)">{b.starRating.toFixed(1)}</span>
            <span className="text-(--text-muted)">/ 5</span>
            <span className={cn("rounded-full border px-3 py-1 text-sm font-semibold", verdictColor)}>{verdictLabel}</span>
          </div>
          <p className="text-sm text-(--text-secondary)">{b.verdictRationale}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-(--text-primary)">Criteria scorecard</p>
            {isMax ? (
              <label className="flex items-center gap-2 text-xs text-(--text-secondary)">
                <input type="checkbox" checked={adjust} onChange={(e) => setAdjust(e.target.checked)} />
                Adjust for my use case
              </label>
            ) : null}
          </div>
          {b.criteria.map((c, i) => (
            <div key={c.id}>
              <div className="mb-1 flex justify-between text-xs text-(--text-secondary)">
                <span>
                  {c.label} — {c.score.toFixed(1)} — {c.weightPercent}% weight
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-(--bg-inset)">
                <div
                  className="h-full origin-left rounded-full bg-(--brand-primary) transition-[width] duration-700 ease-out"
                  style={{ width: `${(c.score / c.maxScore) * 100}%` }}
                />
              </div>
              {isMax && adjust ? (
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={weights[i] ?? c.weightPercent}
                  onChange={(e) => {
                    const next = [...weights];
                    next[i] = Number(e.target.value);
                    setWeights(next);
                  }}
                  className="mt-2 w-full accent-(--brand-primary)"
                />
              ) : null}
            </div>
          ))}
          <p className="text-sm font-semibold text-(--text-primary)">
            Weighted score: <span className="text-(--brand-primary)">{live.toFixed(2)}</span>
          </p>
          {isMax && adjust ? (
            <Button type="button" variant="secondary" size="sm" onClick={() => setWeights(b.criteria.map((c) => c.weightPercent))}>
              Reset to reviewer weights
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {isMax ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-(--text-primary)">Reviewer context</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {b.reviewerContextMax.map((row) => (
                <span key={row.label} className="rounded-full border border-(--border-default) bg-(--bg-inset) px-3 py-1 text-xs text-(--text-secondary)">
                  <span className="font-medium text-(--text-primary)">{row.label}:</span> {row.value}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <FormattedBody body={thread.body} />
    </div>
  );
}

function CompareBody({ thread, isMax }: { thread: Extract<DiscussionThread, { category: "compare" }>; isMax: boolean }) {
  const b = thread.categoryBody;
  const [weights, setWeights] = useState<number[]>(() => b.criteriaLabels.map(() => 1));
  const [scenario, setScenario] = useState(b.scenarios[0]?.id ?? "");
  const [diffOnly, setDiffOnly] = useState(false);

  const weightedTotals = useMemo(() => {
    const sumW = weights.reduce((a, x) => a + x, 0) || 1;
    return b.options.map((opt) => {
      const t = b.criteriaLabels.reduce((acc, label, i) => acc + (opt.scores[label] ?? 0) * (weights[i] ?? 1), 0);
      return t / sumW;
    });
  }, [b, weights]);

  const rowSpread = (label: string) => {
    const vals = b.options.map((o) => o.scores[label] ?? 0);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return max - min;
  };

  const hiddenRows =
    diffOnly ? b.criteriaLabels.filter((label) => rowSpread(label) < 0.5) : [];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[12px] border border-(--border-default) bg-(--bg-surface)">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-(--border-default) text-left text-(--text-muted)">
              <th className="sticky left-0 z-[1] bg-(--bg-surface) px-3 py-2 font-medium">Criteria</th>
              {b.options.map((o) => (
                <th key={o.id} className="px-3 py-2 font-medium text-(--text-primary)">
                  {o.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.criteriaLabels
              .filter((label) => !hiddenRows.includes(label))
              .map((label) => {
                const vals = b.options.map((o) => o.scores[label] ?? 0);
                const best = Math.max(...vals);
                return (
                  <tr key={label} className="border-b border-(--border-subtle)">
                    <td className="sticky left-0 bg-(--bg-surface) px-3 py-2 font-medium text-(--text-primary)">{label}</td>
                    {b.options.map((o) => {
                      const v = o.scores[label] ?? 0;
                      const win = v === best && vals.filter((x) => x === best).length === 1;
                      return (
                        <td
                          key={o.id}
                          className={cn("px-3 py-2", win && "font-semibold text-(--brand-primary)")}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="flex items-center gap-1 text-xs font-medium text-(--text-muted) md:hidden">
        <ChevronsRight className="h-3.5 w-3.5 shrink-0 text-(--brand-primary)" />
        Swipe horizontally to compare all options
      </p>

      {isMax ? (
        <div className="space-y-3 rounded-[12px] border border-(--border-default) bg-(--bg-inset) p-4">
          <p className="text-sm font-semibold text-(--text-primary)">My priorities</p>
          {b.criteriaLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-24 text-xs text-(--text-secondary)">{label}</span>
              <input
                type="range"
                min={1}
                max={5}
                value={weights[i] ?? 1}
                onChange={(e) => {
                  const next = [...weights];
                  next[i] = Number(e.target.value);
                  setWeights(next);
                }}
                className="flex-1 accent-(--brand-primary)"
              />
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => setWeights(b.criteriaLabels.map(() => 1))}>
            Reset weights
          </Button>
        </div>
      ) : null}

      {isMax ? (
        <div className="flex flex-wrap gap-2">
          {b.scenarios.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                scenario === s.id
                  ? "border-(--brand-primary) bg-(--brand-primary)/10 text-(--text-primary)"
                  : "border-(--border-default) text-(--text-secondary) hover:bg-(--bg-overlay)",
              )}
            >
              {s.label}
            </button>
          ))}
          <p className="w-full text-sm text-(--text-secondary)">
            {b.scenarios.find((s) => s.id === scenario)?.rationale}
          </p>
        </div>
      ) : null}

      {isMax ? (
        <label className="flex items-center gap-2 text-sm text-(--text-secondary)">
          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          Show differences only
          {diffOnly && hiddenRows.length > 0 ? (
            <span className="text-xs text-(--text-muted)">Hiding {hiddenRows.length} similar rows — turn off to show all</span>
          ) : null}
        </label>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {b.options.map((o, idx) => (
          <Card key={o.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-(--text-primary)">{o.name}</span>
                {o.isCommunityPick ? <Trophy className="h-4 w-4 text-(--feedback-warning)" aria-label="Community pick" /> : null}
              </div>
              <p className="text-2xl font-bold text-(--brand-primary)">{weightedTotals[idx]?.toFixed(1) ?? o.overallScore}</p>
              <p className="text-xs text-(--text-secondary)">
                <span className="font-medium text-(--text-primary)">Best for:</span> {o.bestFor}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormattedBody body={thread.body} />
    </div>
  );
}

function LaunchpadBody({
  thread,
  isMax,
  author,
}: {
  thread: Extract<DiscussionThread, { category: "launch-pad" }>;
  isMax: boolean;
  author: User | null;
}) {
  const b = thread.categoryBody;
  const stageColor =
    b.stage === "live"
      ? "bg-(--feedback-success)/15 text-(--feedback-success)"
      : b.stage === "beta"
        ? "bg-(--brand-primary)/15 text-(--brand-primary)"
        : b.stage === "prototype"
          ? "bg-(--feedback-warning)/15 text-(--feedback-warning)"
          : "bg-(--bg-overlay) text-(--text-secondary)";

  const cta =
    b.stage === "live"
      ? "Try it →"
      : b.stage === "beta"
        ? "Join waitlist →"
        : "Follow progress →";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[14px] border border-(--border-default) bg-black/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.heroImage} alt="" className="aspect-video w-full object-cover" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-(--text-primary)">{b.productName}</h2>
        <span className={cn("rounded-full px-3 py-0.5 text-xs font-semibold capitalize", stageColor)}>{b.stage}</span>
      </div>
      <p className="text-sm text-(--text-secondary)">{b.tagline}</p>
      <div className="flex flex-wrap gap-2">
        <Button type="button">{cta}</Button>
        <a
          href={b.productUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center rounded-md border border-(--border-prominent) px-4 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--bg-overlay)"
        >
          Visit product →
        </a>
      </div>
      <div className="flex flex-wrap gap-4 rounded-[12px] border border-(--border-default) bg-(--bg-surface) px-4 py-3 text-sm text-(--text-secondary)">
        <span>Upvotes {formatCompactNumber(thread.upvotes)}</span>
        <span>Comments {thread.comments.length}</span>
        {b.waitlistCount != null ? <span>Waitlist {formatCompactNumber(b.waitlistCount)}</span> : null}
      </div>
      <div className="border-l-4 border-(--brand-primary) bg-(--bg-inset) py-3 pl-4 pr-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
          <UserAvatar user={author} size="md" className="h-8 w-8" />
          From the maker
        </div>
        <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">{b.makerNote}</p>
      </div>
      {isMax ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-(--text-primary)">Milestones</p>
              <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
                {b.milestones.map((m) => (
                  <li key={m.label}>
                    <span className="font-medium text-(--text-primary)">{m.date}</span> — {m.label}{" "}
                    {m.upcoming ? <span className="text-(--text-muted)">(Upcoming)</span> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-(--text-primary)">Version log</p>
              <ul className="mt-2 space-y-2 text-sm text-(--text-secondary)">
                {b.changelog.map((c) => (
                  <li key={c.version} className={c.current ? "font-medium text-(--text-primary)" : ""}>
                    {c.version} · {new Date(c.date).toLocaleDateString()} — {c.summary}{" "}
                    {c.current ? <span className="text-(--brand-primary)">Current</span> : null}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-(--text-primary)">Built with</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {b.builtWith.map((t) => (
                  <span key={t} className="rounded-full border border-(--border-default) bg-(--bg-surface) px-3 py-1 text-xs text-(--text-secondary)">
                    {t}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
      <FormattedBody body={thread.body} />
    </div>
  );
}

function DebateBody({
  thread,
  isMax,
  ensureAuthenticated,
}: {
  thread: Extract<DiscussionThread, { category: "debate" }>;
  isMax: boolean;
  ensureAuthenticated: () => boolean;
}) {
  const b = thread.categoryBody;
  const [vote, setVote] = useState<"agree" | "disagree" | "abstain" | null>(null);
  const [dist, setDist] = useState(b.votes);
  const total = dist.agree + dist.disagree + dist.abstain;

  const cast = (v: "agree" | "disagree" | "abstain") => {
    if (!ensureAuthenticated()) return;
    if (b.status !== "open") return;
    setVote(v);
    setDist((d) => ({ ...d, [v]: d[v] + 1 }));
  };

  const pctNum = (n: number) => (total ? (n / total) * 100 : 0);

  return (
    <div className="space-y-4">
      <Card className="border-(--border-prominent) bg-(--bg-surface)">
        <CardContent className="space-y-3 p-4">
          <p className="text-lg font-medium italic text-(--text-primary)">&ldquo;{b.motion}&rdquo;</p>
          <span
            className={cn(
              "inline-block rounded-full px-3 py-0.5 text-xs font-semibold capitalize",
              b.status === "open" ? "bg-(--feedback-success)/15 text-(--feedback-success)" : "bg-(--bg-overlay) text-(--text-muted)",
            )}
          >
            {b.status}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--bg-inset) text-[10px] font-medium text-white">
            <div
              className="bg-(--feedback-success) transition-all duration-500"
              style={{ width: `${pctNum(dist.agree)}%` }}
            />
            <div
              className="bg-(--feedback-error) transition-all duration-500"
              style={{ width: `${pctNum(dist.disagree)}%` }}
            />
            <div className="bg-(--text-muted) transition-all duration-500" style={{ width: `${pctNum(dist.abstain)}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-(--text-secondary)">
            <span>Agree {Math.round(pctNum(dist.agree))}%</span>
            <span>Disagree {Math.round(pctNum(dist.disagree))}%</span>
            <span>Abstain {Math.round(pctNum(dist.abstain))}%</span>
          </div>
          {b.status === "open" ? (
            <div className="flex flex-wrap gap-2">
              {(["agree", "disagree", "abstain"] as const).map((v) => (
                <Button key={v} type="button" variant={vote === v ? "primary" : "secondary"} size="sm" onClick={() => cast(v)}>
                  {v}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-(--text-muted)">Voting closed</p>
          )}
          <p className="text-xs text-(--text-muted)">{total} votes</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-(--feedback-success)">For</p>
          {b.forArguments.map((a) => (
            <Card key={a.id} className={cn(a.strength === "strong" ? "border-(--feedback-success)/40" : "border-(--border-default)")}>
              <CardContent className="p-3 text-sm text-(--text-secondary)">
                <p className="text-(--text-primary)">{a.claim}</p>
                <p className="mt-2 text-xs text-(--text-muted)">{a.upvotes} upvotes</p>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => ensureAuthenticated()}>
            Add argument
          </Button>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-(--feedback-error)">Against</p>
          {b.againstArguments.map((a) => (
            <Card key={a.id} className={cn(a.strength === "strong" ? "border-(--feedback-error)/40" : "border-(--border-default)")}>
              <CardContent className="p-3 text-sm text-(--text-secondary)">
                <p className="text-(--text-primary)">{a.claim}</p>
                <p className="mt-2 text-xs text-(--text-muted)">{a.upvotes} upvotes</p>
              </CardContent>
            </Card>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => ensureAuthenticated()}>
            Add argument
          </Button>
        </div>
      </div>

      {isMax && b.argumentTree.length > 0 ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-(--text-primary)">Argument tree</p>
            <ArgumentTreeNodes nodes={b.argumentTree} depth={0} />
          </CardContent>
        </Card>
      ) : null}

      <FormattedBody body={thread.body} />
    </div>
  );
}

function ArgumentTreeNodes({
  nodes,
  depth,
}: {
  nodes: import("@/types/discussion").DebateArgumentNode[];
  depth: number;
}) {
  if (depth > 2) return null;
  return (
    <ul className="mt-2 space-y-2 border-l border-(--border-default) pl-4">
      {nodes.map((n) => (
        <li key={n.id} className="text-sm text-(--text-secondary)">
          <span className="font-medium text-(--text-primary)">{n.claim}</span>
          <span className="ml-2 text-xs capitalize text-(--text-muted)">{n.side}</span>
          {n.relation ? <span className="text-xs text-(--text-muted)"> ({n.relation})</span> : null}
          {n.children && n.children.length > 0 ? <ArgumentTreeNodes nodes={n.children} depth={depth + 1} /> : null}
        </li>
      ))}
    </ul>
  );
}

function HelpBody({ thread, isMax }: { thread: Extract<DiscussionThread, { category: "help" }>; isMax: boolean }) {
  const b = thread.categoryBody;
  const [repro, setRepro] = useState(b.reproducibilityCount);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase text-(--text-muted)">What I&apos;m trying to do</p>
            <p className="mt-1 text-(--text-secondary)">{b.goal}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-(--text-muted)">What I&apos;ve tried</p>
            <ul className="mt-1 list-inside list-disc text-(--text-secondary)">
              {b.tried.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-(--text-muted)">Where I&apos;m stuck</p>
            <p className="mt-1 text-(--text-secondary)">{b.stuck}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-(--text-muted)">Environment</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {b.environment.map((e) => (
                <span key={e} className="rounded-full border border-(--border-default) bg-(--bg-inset) px-2 py-0.5 text-xs">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        className={cn(
          "rounded-[12px] border px-4 py-3 text-sm font-medium",
          b.solved ? "border-(--feedback-success)/40 bg-(--feedback-success)/10 text-(--feedback-success)" : "border-(--feedback-error)/40 bg-(--feedback-error)/10 text-(--feedback-error)",
        )}
      >
        {b.solved ? "✅ Solved" : "🔴 Unsolved"}
        {b.solved && b.solutionCommentId ? (
          <a href={`#comment-${b.solutionCommentId}`} className="ml-3 underline">
            Jump to solution →
          </a>
        ) : null}
      </div>

      {isMax ? (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-(--text-secondary)">{repro} others have this problem</span>
          <Button type="button" size="sm" variant="secondary" onClick={() => setRepro((n) => n + 1)}>
            I have this too
          </Button>
        </div>
      ) : null}

      <FormattedBody body={thread.body} />
    </div>
  );
}

function ListBody({ thread, isMax }: { thread: Extract<DiscussionThread, { category: "list" }>; isMax: boolean }) {
  const b = thread.categoryBody;
  const [lens, setLens] = useState(b.lenses[0]?.id ?? "editors");
  const [openRank, setOpenRank] = useState<number | null>(null);

  const sorted = useMemo(() => {
    const items = [...b.items];
    const lensId = lens;
    items.sort((a, bItem) => (a.lensRanks[lensId] ?? 99) - (bItem.lensRanks[lensId] ?? 99));
    return items.map((item, idx) => {
      const editorRank = item.lensRanks.editors ?? item.rank;
      const lensRank = item.lensRanks[lensId] ?? item.rank;
      return { item, displayRank: idx + 1, delta: lensRank - editorRank };
    });
  }, [b.items, lens]);

  return (
    <div className="space-y-4">
      <Card className="border-(--border-default) bg-(--bg-inset)">
        <CardContent className="space-y-2 p-4">
          <p className="text-sm font-semibold text-(--text-primary)">{b.purpose}</p>
          <p className="text-xs text-(--text-muted)">Audience: {b.audience}</p>
          <p className="text-sm text-(--text-secondary)">{b.whyExists}</p>
        </CardContent>
      </Card>
      <Card className="border-(--border-default) bg-(--bg-surface)">
        <CardContent className="p-4">
          <p className="text-sm font-semibold text-(--text-primary)">Criteria</p>
          <ul className="mt-2 space-y-1 text-sm text-(--text-secondary)">
            {b.criteria.map((c) => (
              <li key={c.text}>
                {c.met ? "✓" : "○"} {c.text}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-3 text-xs text-(--text-muted)">
        <span>Last updated {new Date(b.lastUpdated).toLocaleDateString()}</span>
        <span>{b.contributorCount} contributors</span>
        {b.ongoing ? <span className="rounded-full bg-(--bg-overlay) px-2 py-0.5">Ongoing list</span> : null}
        {b.targetCount != null ? (
          <span>
            {b.currentCount} of {b.targetCount} items
          </span>
        ) : null}
      </div>

      {isMax ? (
        <div className="flex flex-wrap gap-2">
          {b.lenses.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLens(l.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium",
                lens === l.id ? "border-(--brand-primary) bg-(--brand-primary)/10" : "border-(--border-default) text-(--text-secondary)",
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {sorted.map(({ item, displayRank, delta }) => (
          <Card key={item.rank}>
            <CardContent className="p-0">
              <button type="button" className="flex w-full items-start gap-3 p-4 text-left" onClick={() => setOpenRank(openRank === item.rank ? null : item.rank)}>
                <span className="text-3xl font-bold text-(--text-muted)/60">{displayRank}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-(--text-primary)">{item.name}</span>
                    <span className="rounded-full bg-(--bg-overlay) px-2 py-0.5 text-[11px] text-(--text-secondary)">{item.categoryChip}</span>
                    <span className="text-xs text-(--feedback-warning)">★ {item.stars.toFixed(1)}</span>
                    {isMax && delta !== 0 ? (
                      <span className="text-[11px] text-(--text-muted)">{delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`}</span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-(--text-secondary)">{item.blurb}</p>
                  {openRank === item.rank && item.detail ? <p className="mt-2 text-sm text-(--text-muted)">{item.detail}</p> : null}
                </div>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormattedBody body={thread.body} />
    </div>
  );
}

function ShowcaseBody({ thread, isMax }: { thread: Extract<DiscussionThread, { category: "showcase" }>; isMax: boolean }) {
  const b = thread.categoryBody;
  const [idx, setIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const primary = b.media[idx] ?? b.media[0];
  const { showcaseMediaPinMode, setShowcaseMediaPinMode, prependMainComposer, focusMainComposer, mediaHighlightCoords, setMediaHighlightCoords } =
    useThreadDiscussion();

  const onHeroImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isMax || !showcaseMediaPinMode || primary?.type !== "image") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    prependMainComposer(`📍 Media feedback at ${x}%, ${y}% (slide ${idx + 1})`);
    setShowcaseMediaPinMode(false);
    focusMainComposer();
  };

  return (
    <div className="space-y-4">
      <div
        id="showcase-media"
        className={cn(
          "relative overflow-hidden rounded-[14px] border border-(--border-default) bg-black/20 transition-[box-shadow] duration-500",
          mediaHighlightCoords ? "ring-4 ring-(--brand-primary) ring-offset-2 ring-offset-(--bg-canvas)" : "",
          isMax && showcaseMediaPinMode && "cursor-crosshair",
        )}
      >
        {primary?.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary.src}
            alt={primary.caption}
            className="aspect-video w-full object-cover"
            onClick={onHeroImageClick}
          />
        ) : null}
        <div className="absolute left-2 top-2 flex flex-wrap gap-2">
          {isMax ? (
            <Button
              type="button"
              size="sm"
              variant={showcaseMediaPinMode ? "primary" : "secondary"}
              className="border-0 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setShowcaseMediaPinMode(!showcaseMediaPinMode)}
            >
              <Crosshair className="mr-1 h-3.5 w-3.5" />
              {showcaseMediaPinMode ? "Click image to pin" : "Comment on this"}
            </Button>
          ) : null}
        </div>
        <button
          type="button"
          className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white"
          aria-label="Fullscreen"
          onClick={() => setFullscreen(true)}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] snap-x snap-mandatory md:snap-none">
        {b.media.map((m, i) => (
          <button
            key={m.src}
            type="button"
            onClick={() => {
              setIdx(i);
              setShowcaseMediaPinMode(false);
              setMediaHighlightCoords(null);
            }}
            className={cn(
              "h-16 w-28 shrink-0 snap-center overflow-hidden rounded-lg border-2 transition-colors",
              i === idx ? "border-(--brand-primary)" : "border-transparent opacity-80 hover:opacity-100",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.thumb ?? m.src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="text-sm text-(--text-secondary)">{primary?.caption}</p>

      <div className="border-l-4 border-(--feedback-info) bg-(--bg-inset) py-3 pl-4 pr-3">
        <p className="text-xs font-semibold uppercase text-(--text-muted)">Creator&apos;s intent</p>
        <p className="mt-2 text-sm text-(--text-secondary)">{b.creatorIntent}</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-(--text-muted)">Feedback requested on</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {b.feedbackChips.map((c) => (
            <span key={c} className="rounded-full border border-(--border-default) bg-(--bg-surface) px-3 py-1 text-xs text-(--text-secondary)">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-(--text-muted)">Versions</p>
        <div className="flex flex-wrap gap-2">
          {b.versions.map((v) => (
            <span
              key={v.version}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                v.current ? "border-(--brand-primary) bg-(--brand-primary)/10 font-medium" : "border-(--border-default) text-(--text-secondary)",
              )}
            >
              {v.version} · {new Date(v.date).toLocaleDateString()}
            </span>
          ))}
        </div>
      </div>

      {isMax ? (
        <p className="text-xs text-(--text-muted)">Use Feedback by theme in the comment section to group replies (MAX).</p>
      ) : null}

      <Dialog.Root open={fullscreen} onOpenChange={setFullscreen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,1200px)] -translate-x-1/2 -translate-y-1/2 p-2">
            {primary ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={primary.src} alt={primary.caption} className="max-h-[85vh] w-full object-contain" />
            ) : null}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <FormattedBody body={thread.body} />
    </div>
  );
}

function GigsBody({
  thread,
  isMax,
  author,
  ensureAuthenticated,
}: {
  thread: Extract<DiscussionThread, { category: "gigs" }>;
  isMax: boolean;
  author: User | null;
  ensureAuthenticated: () => boolean;
}) {
  const b = thread.categoryBody;
  const [applyOpen, setApplyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [checks, setChecks] = useState<boolean[]>(() => b.requiredSkills.map(() => false));

  const matched = checks.filter(Boolean).length;
  const fitLabel =
    matched >= b.requiredSkills.length - 1
      ? "You're a strong fit → Apply"
      : `You're missing ${b.requiredSkills.length - matched} required — consider applying anyway`;

  const stageIndex = b.stages.findIndex((s) => s.toLowerCase().startsWith(b.processStage));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-xl font-semibold text-(--text-primary)">{b.roleTitle}</h2>
          <div className="flex flex-wrap gap-2 text-sm text-(--text-secondary)">
            <span className="inline-flex items-center gap-1 rounded-full border border-(--border-default) px-2 py-0.5">
              <Briefcase className="h-3.5 w-3.5" /> {b.employment}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-(--border-default) px-2 py-0.5">
              <MapPin className="h-3.5 w-3.5" /> {b.location}
            </span>
            {b.budget ? (
              <span className="rounded-full border border-(--border-default) px-2 py-0.5">{b.budget}</span>
            ) : (
              <span className="rounded-full border border-(--feedback-warning)/40 bg-(--feedback-warning)/10 px-2 py-0.5 text-(--feedback-warning)">
                Budget incomplete
              </span>
            )}
            {b.duration ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-(--border-default) px-2 py-0.5">
                <Calendar className="h-3.5 w-3.5" /> {b.duration}
              </span>
            ) : (
              <span className="rounded-full border border-(--feedback-warning)/40 bg-(--feedback-warning)/10 px-2 py-0.5 text-(--feedback-warning)">
                Duration incomplete
              </span>
            )}
            {b.startDate ? <span className="text-xs text-(--text-muted)">Start {b.startDate}</span> : null}
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="text-xs font-semibold text-(--text-muted)">Required</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {b.requiredSkills.map((s) => (
            <span key={s} className="rounded-full bg-(--brand-primary)/15 px-3 py-1 text-xs font-medium text-(--text-primary)">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold text-(--text-muted)">Preferred</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {b.preferredSkills.map((s) => (
            <span key={s} className="rounded-full border border-(--border-default) px-3 py-1 text-xs text-(--text-secondary)">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="border-l-4 border-(--brand-primary) bg-(--bg-inset) py-3 pl-4 pr-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
          <UserAvatar user={author} size="md" className="h-8 w-8" />
          From the poster
        </div>
        <p className="mt-2 text-sm text-(--text-secondary)">{b.posterNote}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {b.isOpen ? (
          <Button
            type="button"
            onClick={() => {
              if (!ensureAuthenticated()) return;
              setApplyOpen(true);
            }}
          >
            Apply Now →
          </Button>
        ) : (
          <span className="rounded-full bg-(--bg-overlay) px-3 py-1 text-sm font-medium text-(--text-muted)">Position closed</span>
        )}
        <span className="text-sm text-(--text-secondary)">{b.applicantCount} applied</span>
        <span className="text-sm text-(--text-muted)">{b.isOpen ? "Open" : "Closed"}</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-(--text-muted)">Process</p>
        <div className="flex flex-wrap gap-2">
          {b.stages.map((s, i) => (
            <span
              key={s}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                i === stageIndex ? "bg-(--brand-primary) text-white" : "bg-(--bg-overlay) text-(--text-secondary)",
              )}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {isMax ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-semibold text-(--text-primary)">How well do you fit?</p>
            {b.requiredSkills.map((s, i) => (
              <label key={s} className="flex items-center gap-2 text-sm text-(--text-secondary)">
                <input
                  type="checkbox"
                  checked={checks[i]}
                  onChange={(e) => {
                    const next = [...checks];
                    next[i] = e.target.checked;
                    setChecks(next);
                  }}
                />
                {s}
              </label>
            ))}
            <p className="text-sm text-(--text-primary)">
              You match {matched} of {b.requiredSkills.length} required skills.
            </p>
            <p className="text-xs text-(--text-muted)">{fitLabel}</p>
          </CardContent>
        </Card>
      ) : null}

      <Dialog.Root open={applyOpen} onOpenChange={setApplyOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(480px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[16px] border border-(--border-default) bg-(--bg-surface) p-4 shadow-(--shadow-lg)">
            <Dialog.Title className="text-base font-semibold text-(--text-primary)">Apply</Dialog.Title>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setApplyOpen(false);
                setToast("Application submitted");
              }}
            >
              <input required className="rounded-lg border border-(--border-default) bg-(--bg-inset) px-3 py-2 text-sm" placeholder="Name" />
              <input required type="email" className="rounded-lg border border-(--border-default) bg-(--bg-inset) px-3 py-2 text-sm" placeholder="Email" />
              <input required className="rounded-lg border border-(--border-default) bg-(--bg-inset) px-3 py-2 text-sm" placeholder="Portfolio / LinkedIn URL" />
              <textarea required className="min-h-[100px] rounded-lg border border-(--border-default) bg-(--bg-inset) px-3 py-2 text-sm" placeholder="Why you?" />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setApplyOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {toast ? <BriefToast message={toast} onDismiss={() => setToast(null)} /> : null}

      <FormattedBody body={thread.body} />
    </div>
  );
}
