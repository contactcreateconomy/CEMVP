# GitHub issues: Thread discussion MVP (`apps/forum`)

These files back the **Thread Discussion Detail** work described in [`docs/THREAD_DISCUSSION_USER_STORIES.md`](../../THREAD_DISCUSSION_USER_STORIES.md).

## Create issues (authenticated GitHub CLI)

1. Install and log in: `gh auth login -h github.com`
2. From the repo root:

```bash
./scripts/create-thread-discussion-issues.sh
```

Optional: `DRY_RUN=1 ./scripts/create-thread-discussion-issues.sh` prints commands without calling `gh`.

**Note:** This script was used to open issues **#5–#24** on `contactcreateconomy/CEMVP`. Re-running it will create **duplicate** issues; use only on a fresh repo or edit the script if you need a subset.

## Issue list (20)

| # | Title |
|---|--------|
| 1 | Routing, thread types, slug → category map |
| 2 | 3-column thread shell + responsive layout |
| 3 | Thread header, AI summary, action bar |
| 4 | MIN / MAX mode toggle |
| 5 | Right sidebar: author, related, trending |
| 6 | MAX insight rail |
| 7 | Comment section (nesting, sort, votes, Help solution) |
| 8 | Comment composer, markdown toolbar, category nudges |
| 9 | MAX comment filter chips |
| 10 | Global interactions + mobile behavior |
| 11 | Category: News — mock data + body |
| 12 | Category: Help — mock data + body + code blocks |
| 13 | Category: Review — mock data + body |
| 14 | Category: Compare — mock data + body |
| 15 | Category: List — mock data + body |
| 16 | Category: Launch Pad — mock data + body |
| 17 | Category: Debate — mock data + body |
| 18 | Category: Showcase — mock data + body |
| 19 | Category: Gigs — mock data + body |
| 20 | Feed deep-links + acceptance QA |

## Labels (optional)

Create labels such as `area:forum`, `thread-mvp` and add them in the script with `-l` if desired.
