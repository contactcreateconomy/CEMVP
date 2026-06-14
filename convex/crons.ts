import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recompute hot feed cache",
  { minutes: 5 },
  internal.forum.feedCache.recomputeHotFeed,
  {},
);

crons.interval(
  "reconcile upvote counters",
  { minutes: 10 },
  internal.forum.jobs.reconcileUpvoteCounts,
  {},
);

crons.cron(
  "aggregate daily analytics",
  "0 3 * * *",
  internal.forum.jobs.aggregateDailyAnalytics,
  {},
);

export default crons;
