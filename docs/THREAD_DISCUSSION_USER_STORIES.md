# CREATECONOMY — THREAD DISCUSSION PAGE
## Frontend User Stories · MVP 0 · All 9 Categories

---

## CONTEXT FOR CLAUDE CODE

You are building the **Thread Discussion Detail Page** for Createconomy — a creator economy discussion platform for the top 3% of tech builders, AI tool testers, and vibecoders. This is a **frontend-only build**. All data is mocked. The design system and visual tokens are already implemented in the home feed — inherit everything, introduce nothing new visually.

The page lives at `/discussion/[id]`. It opens when a user clicks any post card from the home feed.

The layout is **3-column** — the same grid as the home feed: Left Nav (reuse existing), Center Thread (main build), Right Sidebar (new). All 9 categories share one thread shell. What changes per category is the body block that renders between the header and the comment section.

---

## PART 1 — MOCK DATA

Create one mock data file per category inside `/src/lib/mock-data/`. Each file should contain realistic, creator-economy-relevant content — not lorem ipsum. The data must visually demonstrate the full feature set of that category when rendered, including all MIN and MAX fields. The CTO will replace these files with real API calls later, so keep all mock data centralized and cleanly typed.

---

## PART 2 — CORE THREAD SHELL
### Applies to all 9 categories. This is the invariant foundation.

---

### US-CORE-001 — Consistent Thread Shell

**As a reader,** I want the same structural layout — header, body, comments, composer — in every category thread, **so that** I never have to relearn the interface when switching between News, Review, Gigs, or any other category.

**What the UI must show:**
- Every thread, regardless of category, has these four zones stacked in this order: Thread Header → Category Body → Comment Section → Composer
- The category tag is always visible near the title so the reader immediately knows what type of content they're looking at
- Spacing, typography, and interaction patterns are consistent everywhere

---

### US-CORE-002 — Thread Header

**As a reader,** I want a rich but compact header at the top of every thread, **so that** I can understand the topic, trust the source, and take action — all within 3 seconds without scrolling.

**What the UI must show:**
- Category badge (colored chip with icon — each of the 9 categories has its own color and icon, use existing design system category tokens)
- Thread title — large, bold, prominent
- Author block: avatar, display name, @handle, and their reputation badge (e.g., "Pro Creator", "AI Builder")
- Posted timestamp and view count
- Tags — clickable chips representing the topic (e.g., "AI Tools", "Claude API", "Workflow")
- AI Summary block — a 1–2 sentence AI-generated summary of the thread. Visually distinct from the rest of the content (subtle border, slight background shift, small bot icon, labelled "AI Summary"). Collapsed by default on mobile, expanded by default on desktop.
- Action bar with: Upvote (with count), Comment count (clicking it scrolls to the comment section), Fav / Bookmark (toggleable, count shown), Share (copies link to clipboard, shows a brief "Link copied" toast), and an overflow menu (···) for Report, Copy link
- The MIN / MAX mode toggle — a single control in the top-right corner of the header, clearly labelled. This is the most important global control on the page.

---

### US-CORE-003 — MIN / MAX Mode Toggle

**As a user,** I want to switch between MIN and MAX mode on any thread, **so that** I can choose between a clean reading experience and a deep analytical one without leaving the page.

**What the UI must show:**
- MIN is the default on every page load
- Toggling to MAX reveals additional panels, insight cards, and power-user features without navigating away, reloading, or losing scroll position
- The transition is smooth — elements slide or fade in, they do not flash or pop
- The toggle visually shows which mode is currently active
- MAX-only elements are completely hidden in MIN — no collapsed placeholders, no empty space

**The core principle:** MIN = content only. MAX = content + intelligence layer. The same thread, not two different pages.

---

### US-CORE-004 — Right Sidebar (Thread Context)

**As a reader,** I want a sidebar next to the thread that gives me context about the author and related content, **so that** I can explore further without leaving the page.

**What the UI must show:**
- **About the Author** card: author's avatar, name, handle, reputation badge, and a Follow button (UI only, no persistence required for MVP)
- **Related Threads** section: 3–4 compact post cards linking to threads in the same category. Compact variant — no image, just title, author, and engagement count
- **Trending in [Category]** section: 3 compact cards of trending posts in this category

---

### US-CORE-005 — Comment Section

**As a reader and participant,** I want a rich threaded comment section below every thread, **so that** I can follow the discussion and contribute.

**What the UI must show:**

**Sort bar:** Comment count label on the left, sort options on the right (Best, New, Top) — same pill style as the feed tabs

**Comment display:**
- Each comment shows: author avatar, name, handle, reputation badge, "OP" tag if the commenter is the original thread author, timestamp
- Upvote and downvote on each comment — optimistic UI, votes update immediately in the UI
- A Reply button that expands an inline composer directly below that comment
- An overflow menu (···) on each comment: Report, Copy link
- Comments are nested. Default visible nesting depth is 3 levels. At level 3, show a "Continue this thread →" link that expands the deeper replies inline on click.
- In MAX mode only: the full nesting depth expands to 5 levels

**Empty state:** "Be the first to reply. Share your thoughts." with a clear CTA

**Solution highlight (Help category only):** If a comment is marked as the solution, it gets a green left border and a "✅ Solution" badge. A banner at the top of the comment section links directly to it.

---

### US-CORE-006 — Comment Composer

**As a participant,** I want a clean, smart composer to write my reply, **so that** I can contribute quickly with quality.

**What the UI must show:**
- The composer appears at the top of the comment section (for new top-level comments) and inline below any comment when the Reply button is clicked
- Author's own avatar sits to the left of the input
- Text area that expands as the user types
- A minimal markdown toolbar: Bold, Italic, Inline code, Code block, Link
- Submit button that is disabled when the field is empty

**AI Quality Nudge** — this is a key feature:
- After the user has typed 20 or more characters, a subtle tip card appears below the input (not intrusive, has an ✕ dismiss button)
- The nudge message is specific to the category. Examples:
  - News: "Adding a source link makes your reply 4x more likely to be upvoted."
  - Review: "Mention which version or plan you used — context builds trust."
  - Debate: "The strongest arguments cite a counter-argument directly before refuting it."
  - Help: "Include your error message and what you've already tried — it cuts reply time in half."
  - Compare: "Which use case are you optimising for? It makes your comparison actionable."
  - Launchpad: "Specific feedback ('the onboarding step 3 is unclear') is more useful than general praise."
  - List: "If you're suggesting an addition, explain why it meets the stated criteria."
  - Showcase: "Tell us which aspect you want feedback on — UX, visuals, or technical approach."
  - Gigs: "If you're a candidate, lead with your most relevant work, not your resume."
- The nudge is static text — no API call needed

---

### US-CORE-007 — MAX Mode: Insight Rail

**As a power user,** I want a live intelligence panel in the right sidebar when in MAX mode, **so that** I can understand the state of the thread without reading every comment.

**What the UI must show (MAX only, replaces or augments the standard sidebar in MAX mode):**
- A compact AI-generated summary of the thread's key points (static mock text)
- "Key Agreements" — 2–3 bullet points of what commenters seem to agree on
- "Open Questions" — 2–3 unresolved questions still being debated, each linking to the relevant comment cluster
- "Top Contributor" for this thread — one author card with their most upvoted comment in this thread
- The panel is sticky on desktop scroll, collapsible on mobile

---

### US-CORE-008 — MAX Mode: Advanced Comment Filtering

**As a power user,** I want to filter comments by contribution type in MAX mode, **so that** I can go straight to the highest-signal replies.

**What the UI must show (MAX only, appears above the comment list):**
- A filter bar with multi-select chips: Evidence, Counterpoint, Question, Resource, Solution (for Help)
- Active filter count shown on the filter button
- A "Clear all" option
- The comment list updates to show only matching comments when filters are applied

---

---

## PART 3 — THE 9 CATEGORY-SPECIFIC BODIES

Each category has a **first principle** — the core purpose that defines what the UI must do for that category above all else. The category body renders between the Thread Header and the Comment Section. It contains the MIN features by default. MAX mode adds an intelligence layer to that same body without replacing it.

---

## CATEGORY 1 — NEWS

**First Principle:** A news thread is about trust and time. The reader needs to know: *What happened? When? Who reported it? Is it verified by others?* The UI must answer these before the reader reads a single paragraph.

---

### US-MIN-NEWS-001 — Source Identity Block

**As a news reader,** I want to see the source of the news immediately when I open the thread, **so that** I can decide whether to trust the content before reading it.

**What the UI must show:**
- A source bar directly below the thread header, above the body text
- Shows: source favicon, source name (e.g., "OpenAI Blog"), publication date and time, and an "Read original →" link that opens in a new tab
- If there's no external source (original reporting), show "Original reporting by @author"

---

### US-MIN-NEWS-002 — Recency and Freshness Indicator

**As a reader,** I want the publish time and any update timestamps to be visually prominent, **so that** I know immediately if this is breaking news or an older story.

**What the UI must show:**
- Publish timestamp displayed prominently near the title — not buried in metadata
- If the post was updated after publishing, show "Updated [time]" separately from "Published [time]"
- Posts older than a configurable threshold (e.g., 7 days) display a subtle "older content" visual treatment — slightly muted, not alarming

---

### US-MIN-NEWS-003 — Corroboration Strip

**As a critical reader,** I want to see how many other outlets are covering this same story, **so that** I can assess whether this is isolated or widely reported.

**What the UI must show:**
- A horizontal strip below the source bar showing 2–4 other sources covering the same story
- Each source shows: name, a stance chip (Confirms / Skeptical / Contradicts) with distinct colors (green / amber / red)
- If no corroboration sources are provided by the poster, show an empty state: "No corroboration added yet. Know another source? Add it."

---

### US-MAX-NEWS-001 — Source Credibility Badges (MAX only)

**As a power reader,** I want to see credibility context for each source in MAX mode, **so that** I can evaluate the quality of the reporting without opening each link.

**What the UI must show (MAX only):**
- Each source in the corroboration strip gains a credibility badge: Independent / Corporate / Government / Community
- A small "Why this matters" tooltip explains what each badge type means
- These badges are completely hidden in MIN

---

### US-MAX-NEWS-002 — Event Timeline Panel (MAX only)

**As a power reader,** I want a chronological timeline of how this story developed, **so that** I can understand the sequence of events rather than just the latest state.

**What the UI must show (MAX only):**
- A timeline panel in the insight rail showing 3–5 dated entries (e.g., "March 18 — Initial report", "March 19 — Official response", "March 20 — Community analysis")
- Each timeline entry links to the relevant paragraph in the body or the relevant comment
- The timeline is a MAX-only element — completely absent in MIN

---

### US-MAX-NEWS-003 — Conflicting Reports Card (MAX only)

**As a critical reader,** I want to know when sources are actively contradicting each other, **so that** I can form my own view rather than accepting one narrative.

**What the UI must show (MAX only):**
- A "Conflicting Reports" card in the insight rail, visible only when at least one corroboration source has a "Contradicts" stance
- Shows the conflicting claim and the source name side by side in a simple two-column visual
- Hidden entirely in MIN, hidden in MAX when no conflicts exist

---

---

## CATEGORY 2 — REVIEW

**First Principle:** A review is only as trustworthy as its criteria and context. The reader needs to know: *What was tested? On what basis? By whom? What was the verdict?* Before anything else, the verdict must be visible.

---

### US-MIN-REVIEW-001 — Product Identity Block

**As a reader,** I want to see clearly what is being reviewed at the top of the thread, **so that** I know immediately what product, tool, or service this is about.

**What the UI must show:**
- A product card directly below the thread header
- Shows: product name, product logo/thumbnail, a "Visit product →" link, and a one-line reviewer context note (e.g., "30-day trial · 2 production projects · Claude API v3")
- This block anchors the entire thread — it never scrolls out of view on desktop

---

### US-MIN-REVIEW-002 — Verdict Block

**As a reader,** I want the reviewer's final verdict displayed prominently near the top, **so that** I can understand the stance in under 5 seconds.

**What the UI must show:**
- A verdict strip below the product card
- Contains: a star rating (e.g., 4.2/5), a verdict label (Recommended / With Caveats / Not Recommended) with a distinct color treatment (green / amber / red)
- A one-sentence verdict rationale directly below the label
- This must be above the fold on desktop

---

### US-MIN-REVIEW-003 — Criteria Scorecard

**As a reader,** I want to see how the reviewer scored each evaluation criterion, **so that** I can understand what drove the overall rating.

**What the UI must show:**
- A scored criteria block showing each criterion as a row: criterion label, score bar (animated left-to-right on mount), and numerical score
- Each criterion also shows its weight percentage (e.g., "Accuracy — 4.1 — 35% weight")
- The overall weighted score is shown at the bottom of the block
- Criteria are defined by the post author and rendered from the thread data

---

### US-MAX-REVIEW-001 — Adjustable Criteria Weights (MAX only)

**As a reader evaluating this product for my own use case,** I want to adjust the weight of each criterion to match my priorities, **so that** I can see a score that is relevant to me, not just the reviewer.

**What the UI must show (MAX only):**
- An "Adjust for my use case" toggle that reveals weight sliders for each criterion
- Moving a slider recalculates the weighted overall score in real time — no page refresh
- A "Reset to reviewer weights" button returns to defaults
- This entire interaction is UI-only — no API call, pure frontend state

---

### US-MAX-REVIEW-002 — Reviewer Context Panel (MAX only)

**As a skeptical reader,** I want to see full context about the reviewer's experience, **so that** I can judge how applicable this review is to my situation.

**What the UI must show (MAX only):**
- An expanded reviewer context card showing: usage duration, version or plan tested, environment details (OS, team size, use case), and any declared conflicts of interest
- Presented as labeled metadata chips — not a wall of text
- Completely hidden in MIN

---

### US-MAX-REVIEW-003 — Comment Clustering by Sentiment (MAX only)

**As a reader,** I want to see whether the community agrees or disagrees with the reviewer's verdict, **so that** I get a collective signal beyond one person's opinion.

**What the UI must show (MAX only):**
- A "Community Sentiment" card in the insight rail showing: % of commenters who agree with the verdict, % who disagree, and the top upvoted agree and disagree comments surfaced as quotes
- This is static mock data — the visual structure and layout is what's being built, not the algorithm

---

---

## CATEGORY 3 — COMPARE

**First Principle:** Comparison is a decision tool. The reader is not here to read — they are here to choose. The UI must make differences immediately scannable and the winner obvious within each use case.

---

### US-MIN-COMPARE-001 — Comparison Table

**As a reader making a decision,** I want a clear side-by-side table of the options being compared, **so that** I can scan differences without reading paragraphs.

**What the UI must show:**
- A comparison table where each column is one option being compared (2–4 options)
- Each row is a criterion (e.g., Speed, Accuracy, Price, UX)
- Each cell shows a score or label
- The highest score in each row is visually highlighted (bold, accent color)
- First column (criteria labels) is sticky on horizontal scroll for mobile
- Table is horizontally scrollable on screens below 768px

---

### US-MIN-COMPARE-002 — Verdict Cards

**As a decision-maker,** I want a "best for" verdict for each option, **so that** I can pick based on my context rather than just the raw scores.

**What the UI must show:**
- Below the table, one verdict card per option
- Each card shows: option name/logo, overall score, and a "Best for:" one-liner (e.g., "Best for solo builders", "Best for enterprise teams")
- A "Community Pick" badge on the option that the community voted as overall winner — shown with a distinct trophy icon

---

### US-MAX-COMPARE-001 — Criteria Weight Sliders (MAX only)

**As a power user,** I want to weight the comparison criteria based on what matters to me, **so that** the rankings update to reflect my priorities.

**What the UI must show (MAX only):**
- A "My priorities" panel with sliders for each criterion
- Adjusting a slider recalculates each option's weighted score in real time
- The table cell highlighting updates to reflect the new rankings
- A "Reset" option restores original weights
- Completely UI-only — no API call

---

### US-MAX-COMPARE-002 — Scenario Matrix (MAX only)

**As a reader,** I want to see how the winner changes depending on the use case scenario, **so that** I can pick based on my specific situation.

**What the UI must show (MAX only):**
- A scenario selector showing 3–4 preset scenarios (e.g., "Solo dev on a budget", "Agency with a team", "Enterprise with compliance needs")
- Selecting a scenario shows which option is recommended for that scenario and why (a one-sentence rationale)
- Displayed as a tab or pill selector — not a dropdown

---

### US-MAX-COMPARE-003 — Diff Highlight Mode (MAX only)

**As a power user,** I want to hide rows where all options score similarly, **so that** I can focus only on the meaningful differences.

**What the UI must show (MAX only):**
- A "Show differences only" toggle in MAX mode
- When active, rows where all scores are within a set threshold are hidden
- A label like "Hiding 3 similar rows — show all" appears when rows are hidden

---

---

## CATEGORY 4 — LAUNCHPAD

**First Principle:** Launchpad is about momentum and iteration. The reader wants to understand what is being built, where it is in its journey, and what kind of help is needed right now. The UI must communicate stage and direction above all else.

---

### US-MIN-LAUNCHPAD-001 — Product Hero Block

**As a viewer,** I want to see the product being launched presented prominently at the top, **so that** I understand what it is before reading any further.

**What the UI must show:**
- A hero image or video at the top of the body (wide, 16:9 ratio)
- Below the hero: product name, logo, tagline (one line), and a status badge indicating the launch stage (Idea / Prototype / Beta / Live) — each with a distinct color
- A primary CTA button appropriate to the stage: "Try it →" for Live, "Join waitlist →" for Beta, "Follow progress →" for Prototype/Idea
- A "Visit product →" secondary link

---

### US-MIN-LAUNCHPAD-002 — Launch Stats Strip

**As a community member,** I want to see the product's traction at a glance, **so that** I can gauge community interest before deciding whether to engage.

**What the UI must show:**
- A stats strip below the hero: upvote count, comment count, and if applicable, a waitlist signups number
- This gives a quick "heat check" before reading further

---

### US-MIN-LAUNCHPAD-003 — Maker Note

**As a reader,** I want to hear directly from the person building this in their own voice, **so that** I understand their motivation and can build empathy with the creator.

**What the UI must show:**
- A distinct "From the maker" block — visually differentiated from the body (left accent border, slightly inset, author avatar inline)
- The maker writes a first-person note: why they built this, what problem they're solving, what they need
- This is the most human element on the page — it should feel personal, not corporate

---

### US-MIN-LAUNCHPAD-004 — Feedback Request Block

**As a viewer,** I want to know exactly what kind of feedback the creator is looking for, **so that** my comment is actually useful to them.

**What the UI must show:**
- A "What I need feedback on" section above the comment composer
- The creator specifies 2–3 focus areas as editable chips (e.g., "Onboarding clarity", "Pricing model", "Target audience fit")
- This anchors the discussion and reduces generic praise

---

### US-MAX-LAUNCHPAD-001 — Milestone Timeline (MAX only)

**As a follower of this project,** I want to see the product's roadmap and past milestones, **so that** I can track progress over time.

**What the UI must show (MAX only):**
- A vertical timeline showing past milestones (dated, with a one-line note) and upcoming planned milestones (marked as "Upcoming")
- Current position is highlighted on the timeline
- Clicking a past milestone scrolls to or highlights the relevant post/update if linked

---

### US-MAX-LAUNCHPAD-002 — Changelog Stack (MAX only)

**As a returning viewer,** I want to see what has changed since the last time I viewed this thread, **so that** I can catch up quickly.

**What the UI must show (MAX only):**
- A "Version / Update Log" section showing a stack of dated update entries
- Each entry shows: version label (v1.0, v2.0), date, and a one-sentence summary of what changed
- Most recent version is shown first and visually highlighted as "Current"

---

### US-MAX-LAUNCHPAD-003 — Built With Stack (MAX only)

**As a technical reader,** I want to see the technology stack behind the product, **so that** I can assess technical fit or contribute relevant advice.

**What the UI must show (MAX only):**
- A "Built with" section showing technology chips (e.g., "Next.js", "Claude API", "Vercel")
- Each chip is non-interactive — this is display only
- Hidden in MIN to reduce clutter for non-technical readers

---

---

## CATEGORY 5 — DEBATE

**First Principle:** A debate is a structured search for truth, not a shouting match. The UI must make the proposition crystal clear, allow users to take a side with commitment, and surface the strongest arguments on each side — not just the most popular comments.

---

### US-MIN-DEBATE-001 — Proposition Block

**As a reader,** I want the debate motion stated clearly and unavoidably at the top, **so that** I understand exactly what is being argued before reading any responses.

**What the UI must show:**
- A large, visually prominent proposition block below the header
- The motion is quoted: e.g., *"AI will make 80% of SaaS tools irrelevant within 3 years"*
- Debate status badge: Open / Closed / Resolved — with distinct color treatments

---

### US-MIN-DEBATE-002 — Voting Bar

**As a participant,** I want to cast my vote on the proposition and see where the community stands, **so that** I can engage as a voter, not just a spectator.

**What the UI must show:**
- A horizontal vote bar showing: % Agree, % Disagree, % Abstain — as a proportional bar with labels
- Three vote buttons below: Agree, Disagree, Abstain
- Once voted, buttons update to show user's choice (active state), and the bar animates to reflect their vote
- Total vote count shown below the bar
- If the debate is Closed, the buttons are disabled and a "Voting closed" label replaces them

---

### US-MIN-DEBATE-003 — Argument Summary Cards

**As a reader,** I want to see the strongest arguments on each side at a glance, **so that** I understand the core tension of the debate before reading all comments.

**What the UI must show:**
- Two columns: "For" and "Against" — each column showing 2 argument summary cards
- Each card shows the argument claim, a strength indicator (Strong / Medium — conveyed visually through border treatment, not a gamified badge), and the upvote count for that argument
- An "Add argument" CTA at the bottom of each column, auth-gated

---

### US-MAX-DEBATE-001 — Argument Tree (MAX only)

**As a power reader,** I want to see how arguments branch and counter each other, **so that** I can follow the logical structure of the debate, not just the emotional temperature.

**What the UI must show (MAX only):**
- An expandable argument tree that visually branches from the main proposition
- Each node is a claim. Child nodes are either "Supports this" or "Counters this"
- Nodes can be collapsed. The tree defaults to 2 levels visible
- Clicking a node scrolls to the relevant comment in the thread

---

### US-MAX-DEBATE-002 — Fallacy Flag Panel (MAX only)

**As a critical reader,** I want to see when community members have flagged logical fallacies in an argument, **so that** I can assess argument quality beyond upvotes.

**What the UI must show (MAX only):**
- In MAX mode, any comment can show a fallacy tag applied by community members (e.g., "Ad Hominem", "Strawman", "False Dichotomy")
- Tags appear as small chips below the comment — they are semantic labels, not downvotes
- A fallacy count is visible on each comment in MAX mode
- Completely hidden in MIN to avoid noise

---

### US-MAX-DEBATE-003 — Common Ground Box (MAX only)

**As a reader,** I want to see what both sides actually agree on, **so that** the debate feels constructive and I can understand where the real disagreement lies.

**What the UI must show (MAX only):**
- A "Common Ground" card in the insight rail
- Shows 2–3 bullet points of statements both sides have acknowledged as true (mock data for MVP)
- Labelled clearly as "Where both sides agree"
- This is static in MVP — the visual component and its placement are what's being built

---

---

## CATEGORY 6 — HELP

**First Principle:** A help thread is a race against someone's frustration. The reader either has the same problem and wants a solution, or they have expertise and want to help efficiently. The UI must make the problem crystal clear, show what's already been tried, and make the accepted solution impossible to miss.

---

### US-MIN-HELP-001 — Problem Statement Block

**As a helper,** I want to see the exact problem, the environment, and what's already been tried — all before I read any comments, **so that** I can immediately assess whether I can help.

**What the UI must show:**
- A structured problem block at the top of the body with three labeled sections:
  - "What I'm trying to do" — the goal
  - "What I've tried" — list of attempted solutions
  - "Where I'm stuck" — the specific blocker
- Tech stack chips below the block (e.g., "Next.js 14", "Claude API", "Vercel") — clearly labeled "Environment"

---

### US-MIN-HELP-002 — Solved / Unsolved Status Banner

**As a reader with the same problem,** I want to know immediately whether this thread has been solved, **so that** I can jump straight to the answer or know I need to read the full discussion.

**What the UI must show:**
- A status banner directly below the problem block: a green "✅ Solved" banner if resolved, a red "🔴 Unsolved" banner if not
- The Solved banner includes a "Jump to solution →" anchor link that scrolls directly to the accepted solution comment
- The solution comment itself is visually differentiated: green left border, "✅ Solution" badge at top

---

### US-MIN-HELP-003 — Code Block Display

**As a participant,** I want any code snippets in the thread to be clearly formatted with syntax highlighting and a copy button, **so that** I can read and use them without friction.

**What the UI must show:**
- Code blocks render with dark background, monospace font, and syntax highlighting
- A "Copy" button in the top-right corner of each code block — clicking it changes to "Copied ✓" for 2 seconds
- A language label in the top-left (e.g., "TypeScript", "Python")
- Code blocks appear in both the OP body and in comments

---

### US-MAX-HELP-001 — Reproducibility Counter (MAX only)

**As a helper,** I want to see how many other users have confirmed the same problem, **so that** I know whether this is an isolated edge case or a widespread issue.

**What the UI must show (MAX only):**
- A "X others have this problem" counter below the problem block
- A "I have this too" button that increments the counter (optimistic UI)
- This counter is hidden in MIN

---

### US-MAX-HELP-002 — Diagnostic Path (MAX only)

**As a power helper,** I want to see a visual summary of the troubleshooting steps that have been tried and suggested so far, **so that** I don't repeat suggestions already made.

**What the UI must show (MAX only):**
- A compact "Troubleshooting path" card in the insight rail
- Shows a numbered list of approaches that have been suggested or tried, with a checkmark if marked as tried, and an open circle if suggested but not yet tried
- This is static mock data in MVP — the UI component and its placement are what matters

---

---

## CATEGORY 7 — LIST

**First Principle:** A list is only as good as its curation logic. The reader needs to trust the selection — which means the criteria that drove inclusion must be visible before the items themselves. Without criteria, a list is just someone's opinion.

---

### US-MIN-LIST-001 — List Purpose and Criteria Block

**As a reader,** I want to understand the purpose and selection criteria of the list before I look at a single item, **so that** I can decide whether this list is relevant to my needs.

**What the UI must show:**
- A purpose block at the top: one-line purpose statement ("Best AI tools for YouTube creators in 2026"), target audience, and a "Why this list exists" explanation
- Below it, a criteria block showing the selection criteria as a checklist (e.g., "✓ Must save 2+ hours/week", "✓ Price under $50/month", "✓ Available globally")
- Both blocks visually distinct from the list items below — different background or border treatment

---

### US-MIN-LIST-002 — Ranked List Items

**As a reader,** I want to scan the list items quickly with just enough information to evaluate each one, **so that** I can find what I need without reading a full review for each.

**What the UI must show:**
- Items displayed in ranked order: rank number (large, prominent), item name, logo/thumbnail, category chip (e.g., "Editing", "Audio"), star rating, and a one-sentence annotation (max 150 characters)
- The rank number is a key visual element — large, slightly muted, left-anchored
- Items are expandable — clicking an item reveals a slightly longer description inline

---

### US-MIN-LIST-003 — List Metadata Strip

**As a reader,** I want to know how current and collaborative this list is, **so that** I can gauge its freshness and authority.

**What the UI must show:**
- A metadata strip below the criteria block: "Last updated [date]" and "X contributors"
- If the list is marked as "Ongoing" (still being built), show an "Ongoing list" indicator
- "X of Y items" if the curator has indicated a target count

---

### US-MAX-LIST-001 — Multi-Lens Sorting (MAX only)

**As a power reader,** I want to re-sort the list by different lenses so that the ranking reflects my priorities, not just the author's.

**What the UI must show (MAX only):**
- A lens selector above the list items: "Editor's choice", "Best value", "Most popular", "Beginner-friendly", "Custom"
- Selecting a lens re-orders the list items in real time (frontend state only)
- The active lens is visually highlighted
- A visual indicator on each item shows whether it moved up or down under the new lens (e.g., a small up/down arrow with the delta)

---

### US-MAX-LIST-002 — Coverage Gaps Panel (MAX only)

**As a contributor,** I want to see what is missing from this list based on the stated criteria, **so that** I can make meaningful additions.

**What the UI must show (MAX only):**
- A "Coverage gaps" card in the insight rail
- Shows 2–3 criteria that are under-represented in the current items (e.g., "Only 1 item covers Audio editing")
- A "Propose addition" CTA below each gap — clicking opens the comment composer with the relevant gap pre-filled as context
- Hidden entirely in MIN

---

---

## CATEGORY 8 — SHOWCASE

**First Principle:** Showcase is about feedback, not applause. The creator is presenting work and asking for critique. The UI must make the work visually prominent, make the feedback request explicit, and give commenters the tools to give precise, directed feedback — not generic reactions.

---

### US-MIN-SHOWCASE-001 — Media Gallery Hero

**As a viewer,** I want to see the creator's work in its best form at the top of the thread, **so that** I can evaluate it visually before reading any context.

**What the UI must show:**
- A primary media display at the top — large image, video player, or audio player depending on the media type
- Below the primary media: a thumbnail strip for additional media. Clicking a thumbnail swaps the primary display (local state only, no page refresh)
- Caption below the primary display showing the media description
- A fullscreen toggle on the primary media

---

### US-MIN-SHOWCASE-002 — Creator Intent Block

**As a viewer about to give feedback,** I want to understand what the creator was trying to achieve, **so that** my feedback is relevant to their goal, not just my personal taste.

**What the UI must show:**
- A "Creator's intent" block below the media: a first-person statement from the creator ("I was trying to achieve...")
- This is distinct from the general body text — it has a visual treatment that signals "this is the creator's voice and goal"

---

### US-MIN-SHOWCASE-003 — Feedback Request Tags

**As a commenter,** I want to see exactly what kind of feedback the creator wants, **so that** my reply is immediately useful to them.

**What the UI must show:**
- A "Feedback requested on:" row showing the creator's focus areas as chips (e.g., "UX Flow", "Error Handling", "Visual Hierarchy")
- These chips appear above the comment composer as a gentle directive
- The comment composer's AI quality nudge references these chips explicitly ("The creator is looking for feedback on UX flow and error handling specifically")

---

### US-MIN-SHOWCASE-004 — Version Timeline

**As a returning viewer,** I want to see this project's version history, **so that** I can see how it has evolved and give feedback in that context.

**What the UI must show:**
- A compact version timeline below the body: version label (v1.0, v2.0), date, and a one-sentence note for each version
- The current version is highlighted
- Clicking a past version label does nothing in MVP (placeholder for future version diff view)

---

### US-MAX-SHOWCASE-001 — Annotated Comments (MAX only)

**As a feedback giver,** I want to pin my comment to a specific part of an image or a specific timestamp in a video, **so that** my feedback is precise and unambiguous.

**What the UI must show (MAX only):**
- In MAX mode, the primary media has a "Comment on this" mode — clicking activates a crosshair cursor on images or a timestamp selector on video
- After selecting a location/timestamp, the comment composer opens pre-loaded with a reference to that location
- In the comment list, comments with a media annotation show a small "📍 See in media" badge — clicking it highlights the corresponding area in the media

---

### US-MAX-SHOWCASE-002 — Feedback Cluster View (MAX only)

**As a creator reviewing feedback,** I want to see my comments grouped by theme, **so that** I can process feedback efficiently and spot patterns.

**What the UI must show (MAX only):**
- A "Feedback by theme" grouping mode in MAX — toggling it re-groups the comment section into clusters: UX, Visual, Technical, Other
- The cluster labels are tabs or accordions
- The standard chronological view is still accessible via a toggle
- This is a view-only reorganization — no data is changed

---

---

## CATEGORY 9 — GIGS

**First Principle:** A gig post is a transaction. Both sides — the poster and the candidate — need clarity before they invest time. The UI must surface role requirements, scope, and compensation with zero ambiguity, and give candidates a structured way to self-qualify before applying.

---

### US-MIN-GIGS-001 — Role Summary Card

**As a job seeker,** I want to see the essential role details at the very top, **so that** I can decide in 10 seconds whether to read further.

**What the UI must show:**
- A role summary card below the header with: Role title (large), Employment type chip (Full-time / Part-time / Contract / One-off), Location chip (Remote / On-site / Hybrid), Budget/compensation range, and Duration or start date
- Each detail uses an icon + label treatment (e.g., briefcase icon + "Contract")
- If any critical field is missing (budget, duration), a subtle "Incomplete" indicator appears on that field — this holds posters accountable for clarity

---

### US-MIN-GIGS-002 — Skills Block

**As a candidate,** I want to see the required and preferred skills clearly separated, **so that** I can self-assess fit before applying.

**What the UI must show:**
- Two rows of skill chips: "Required" (solid chip) and "Preferred" (outlined chip)
- Visual distinction makes the difference between must-have and nice-to-have immediately clear

---

### US-MIN-GIGS-003 — Poster Note

**As a candidate,** I want to hear from the person posting the gig in their own words, **so that** I understand the culture and team context beyond the formal requirements.

**What the UI must show:**
- A "From the poster" block — same visual treatment as the Launchpad Maker Note (left accent border, slightly inset, poster's avatar inline)
- A first-person note from the poster about the team, the working style, and what kind of person they're looking for

---

### US-MIN-GIGS-004 — Apply CTA

**As a candidate,** I want a clear, prominent way to apply, **so that** I don't have to hunt for the action.

**What the UI must show:**
- A primary "Apply Now →" button that is the most visually prominent interactive element on the page
- Below the button: applicant count ("24 applied") and position status ("Open" or "Closed")
- When position is Closed (`isOpen: false`), the Apply button is replaced by a "Position Closed" badge — no button
- Clicking Apply opens a simple modal with fields: Name, Email, Portfolio/LinkedIn URL, and a free-text "Why you?" field. Submitting shows a "Application submitted" toast. No API call in MVP.

---

### US-MIN-GIGS-005 — Process Stage Tracker

**As a candidate,** I want to see the hiring pipeline stages, **so that** I understand what happens after I apply.

**What the UI must show:**
- A horizontal step indicator showing the hiring stages: Applied → Screening → Interview → Offer
- The current active stage is highlighted
- This is informational only — candidates see where the process is, not their personal application status

---

### US-MAX-GIGS-001 — Fit Self-Check (MAX only)

**As a candidate,** I want to self-assess my fit before applying, **so that** I don't waste the poster's time or my own.

**What the UI must show (MAX only):**
- A "How well do you fit?" checklist in MAX mode showing the required skills as checkboxes the candidate checks off
- A dynamic fit score appears below (e.g., "You match 4 of 5 required skills") — purely frontend state
- A "You're a strong fit → Apply" prompt if score is high, or "You're missing X — consider applying anyway" if score is partial
- Hidden entirely in MIN

---

### US-MAX-GIGS-002 — Q&A Partition (MAX only)

**As a candidate or curious reader,** I want clarifying questions separated from application signals in the comment section, **so that** I can get my questions answered without it being mistaken for an application.

**What the UI must show (MAX only):**
- In MAX mode, the comment section has a tab toggle: "Questions" and "Responses"
- "Questions" tab: public clarifying questions from the community
- "Responses" tab: comments that signal application intent (e.g., "I'm interested, here's my background")
- In MIN mode, all comments appear in one standard thread

---

### US-MAX-GIGS-003 — Proof of Work Rail (MAX only)

**As a poster reviewing applicants,** I want to see a candidate's best work from the platform alongside their comment, **so that** I can evaluate them in context without leaving the thread.

**What the UI must show (MAX only):**
- In MAX mode, comments from candidates who have Showcase posts on the platform display a mini "Proof of Work" rail below their comment — 2–3 compact cards linking to their showcase posts
- This pulls from the commenter's profile mock data
- Candidates with no Showcase posts do not show this rail — no empty state
- Hidden entirely in MIN

---

---

## PART 4 — INTERACTION STATES

These apply across all 9 category threads:

- **Upvote thread** — toggle. Count increments/decrements immediately in UI. Icon fills when active.
- **Bookmark (Fav)** — toggle. Icon fills when active. Count updates immediately.
- **Share** — copies URL to clipboard. Brief "Link copied" toast notification appears and auto-dismisses.
- **Upvote comment** — toggle, optimistic. Enabling upvote disables downvote simultaneously.
- **Downvote comment** — toggle, optimistic. Enabling downvote disables upvote simultaneously.
- **Reply** — clicking Reply on a comment expands an inline composer directly below that comment.
- **Debate vote** — radio-style selection (one of Agree / Disagree / Abstain). Vote bar animates to reflect the new distribution.
- **Review weight sliders** — recalculate the weighted total score live as the slider moves.
- **Gallery thumbnail (Showcase)** — clicking a thumbnail swaps the primary image. Active thumbnail has a highlighted border.
- **Apply (Gigs)** — opens a modal. Submitting shows a toast and closes the modal. No API call.
- **Auth-gated actions** — clicking any action that requires login (upvote, comment, bookmark, apply, debate vote, add argument) triggers the existing auth modal from the home feed. Do not build a new auth flow.
- **MIN → MAX toggle** — scroll position is preserved. No reload. Transition is smooth.

---

## PART 5 — MOBILE BEHAVIOUR

- Below 768px: Left nav collapses. Hamburger toggle reveals it as an overlay.
- Below 768px: Right sidebar moves to below the comment section.
- Below 768px: Comparison table (Compare category) is horizontally scrollable with visible scroll hint.
- Below 768px: Showcase media gallery uses horizontal swipe with CSS scroll snap.
- Below 768px: MAX mode insight rail becomes a collapsible bottom sheet instead of a fixed right rail.
- Composer: full-width on mobile. Markdown toolbar collapses into a ··· overflow button.

---

## PART 6 — ROUTING

The page lives at `/discussion/[id]`. Create 9 distinct mock thread IDs, one per category, so each thread type is directly navigable during development and review:

- `/discussion/news-001`
- `/discussion/review-001`
- `/discussion/compare-001`
- `/discussion/launchpad-001`
- `/discussion/debate-001`
- `/discussion/help-001`
- `/discussion/list-001`
- `/discussion/showcase-001`
- `/discussion/gigs-001`

The `[id]` prefix determines which category body component renders. A simple helper function maps the ID prefix to the category.
