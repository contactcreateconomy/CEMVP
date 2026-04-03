#!/usr/bin/env bash
# Create GitHub issues for the thread discussion MVP (see docs/github-issues/thread-discussion/README.md).
# Prerequisites: gh auth login -h github.com
# DRY_RUN=1 ./scripts/create-thread-discussion-issues.sh  — print commands only

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ISSUES_DIR="$ROOT/docs/github-issues/thread-discussion"

create_issue() {
  local title=$1
  local body_file=$2
  if [[ "${DRY_RUN:-}" == "1" ]]; then
    printf 'DRY_RUN: gh issue create -t %q -F %q\n' "$title" "$body_file"
    return 0
  fi
  gh issue create -t "$title" -F "$body_file"
}

create_issue "[Thread MVP] Routing, thread types, slug → category map" "$ISSUES_DIR/body-01-routing.md"
create_issue "[Thread MVP] 3-column thread shell + responsive layout" "$ISSUES_DIR/body-02-shell-layout.md"
create_issue "[Thread MVP] Thread header, AI summary, action bar" "$ISSUES_DIR/body-03-thread-header.md"
create_issue "[Thread MVP] MIN / MAX mode toggle" "$ISSUES_DIR/body-04-min-max-toggle.md"
create_issue "[Thread MVP] Right sidebar: author, related, trending" "$ISSUES_DIR/body-05-sidebar-min.md"
create_issue "[Thread MVP] MAX insight rail" "$ISSUES_DIR/body-06-max-insight-rail.md"
create_issue "[Thread MVP] Comment section (nesting, sort, votes, Help solution)" "$ISSUES_DIR/body-07-comments.md"
create_issue "[Thread MVP] Comment composer, markdown toolbar, category nudges" "$ISSUES_DIR/body-08-composer.md"
create_issue "[Thread MVP] MAX comment filter chips" "$ISSUES_DIR/body-09-max-filters.md"
create_issue "[Thread MVP] Global interactions + mobile behavior" "$ISSUES_DIR/body-10-global-interactions-mobile.md"
create_issue "[Thread MVP] Category: News — mock data + body" "$ISSUES_DIR/body-11-category-news.md"
create_issue "[Thread MVP] Category: Help — mock data + body + code blocks" "$ISSUES_DIR/body-12-category-help.md"
create_issue "[Thread MVP] Category: Review — mock data + body" "$ISSUES_DIR/body-13-category-review.md"
create_issue "[Thread MVP] Category: Compare — mock data + body" "$ISSUES_DIR/body-14-category-compare.md"
create_issue "[Thread MVP] Category: List — mock data + body" "$ISSUES_DIR/body-15-category-list.md"
create_issue "[Thread MVP] Category: Launch Pad — mock data + body" "$ISSUES_DIR/body-16-category-launchpad.md"
create_issue "[Thread MVP] Category: Debate — mock data + body" "$ISSUES_DIR/body-17-category-debate.md"
create_issue "[Thread MVP] Category: Showcase — mock data + body" "$ISSUES_DIR/body-18-category-showcase.md"
create_issue "[Thread MVP] Category: Gigs — mock data + body" "$ISSUES_DIR/body-19-category-gigs.md"
create_issue "[Thread MVP] Feed deep-links + acceptance QA" "$ISSUES_DIR/body-20-feed-qa.md"

if [[ "${DRY_RUN:-}" != "1" ]]; then
  echo "Done. Created 20 issues."
fi
