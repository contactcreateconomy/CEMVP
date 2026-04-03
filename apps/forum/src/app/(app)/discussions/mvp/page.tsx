/**
 * Route: /discussions/mvp
 * Dev/QA index: links to all nine thread-discussion MVP slugs + smoke checklist.
 */
import Link from "next/link";

import { DISCUSSION_MVP_SLUGS } from "@/types/discussion";

const checklist = [
  "MIN / MAX toggles layout and nesting depth",
  "Category body renders (news timeline + conflicts in MAX rail for news)",
  "Comments: sort, filters (solution only on help), gigs partition in MAX",
  "Showcase: See in media from pinned comment, pin mode on hero",
  "Thread header: report dialog, share, bookmarks (auth-gated where applicable)",
];

export default function DiscussionsMvpIndexPage() {
  return (
    <section className="animate-route-emerge mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-(--text-primary)">Thread discussion MVP</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Open each slug below to exercise the full discussion shell and category-specific UI (mock data).
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">MVP threads</h2>
        <ul className="mt-3 space-y-2">
          {DISCUSSION_MVP_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                href={`/discussions/${slug}`}
                className="text-sm font-medium text-(--brand-primary) hover:underline"
              >
                /discussions/{slug}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">Smoke checklist</h2>
        <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-(--text-secondary)">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
